import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Subscription, interval } from 'rxjs';
import { Asset, Reading, Threshold, Ticket, OpenCountDto } from '../models/models';
import { AssetService } from '../services/asset.service';
import { ReadingService } from '../services/reading.service';
import { ThresholdService } from '../services/threshold.service';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../services/auth.service';

type DashboardView = 'home' | 'assets' | 'tickets';

const ISSUE_SEVERITY: Record<string, number> = {
  RMS_AND_TEMP_OVER_THRESHOLD: 3,
  RMS_OVER_THRESHOLD: 2,
  TEMP_OVER_THRESHOLD: 1
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // ── Layout state ──
  activeView: DashboardView = 'home';
  sidebarCollapsed = false;

  // ── Data ──
  allAssets:  Asset[]        = [];
  readings:   Reading[]      = [];
  tickets:    Ticket[]       = [];
  openCounts: OpenCountDto[] = [];
  selectedAsset: Asset | null     = null;
  threshold:     Threshold | null = null;

  // ── Loading flags ──
  loadingAssets   = false;
  loadingReadings = false;
  lastLiveRefresh: Date | null = null;
  private liveSub?: Subscription;

  // ── Tickets pagination + show closed toggle ──
  ticketPageIndex = 0;
  ticketPageSize  = 8;
  ticketPageSizeOptions = [5, 8, 12, 20];
  showClosedTickets = false;

  // ── Add Asset dialog ──
  showAddAsset = false;
  addAssetForm: FormGroup;
  addingAsset  = false;

  // ── Edit Asset dialog ──
  editingAsset: Asset | null = null;
  editingThreshold: Threshold | null = null;

  constructor(
    private assetService:    AssetService,
    private readingService:  ReadingService,
    private thresholdService: ThresholdService,
    private ticketService:   TicketService,
    public  auth:            AuthService,
    private router:          Router,
    private snack:           MatSnackBar,
    private fb:              FormBuilder
  ) {
    this.addAssetForm = this.fb.group({
      assetName: ['', [Validators.required, Validators.minLength(2)]],
      location:  ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAssets();
    this.loadTickets();
    this.loadOpenCounts();
    this.startLiveFeed();
  }

  ngOnDestroy(): void {
    this.liveSub?.unsubscribe();
  }

  // ── Sidebar / view switching ────────────────────────────────
  setView(view: DashboardView): void {
    this.activeView = view;
    if (view !== 'assets') {
      this.selectedAsset = null;
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // ── Asset loading ───────────────────────────────────────────
  loadAssets(): void {
    this.loadingAssets = true;
    this.assetService.getAll().subscribe({
      next: (data) => {
        this.allAssets = data;
        this.syncSelectedAsset();
        this.loadingAssets = false;
      },
      error: () => this.loadingAssets = false
    });
  }

  // ── Add Asset (admin) ───────────────────────────────────────
  openAddAsset(): void {
    this.showAddAsset = true;
    this.addAssetForm.reset();
  }

  closeAddAsset(): void {
    this.showAddAsset = false;
  }

  submitAddAsset(): void {
    if (this.addAssetForm.invalid) {
      this.addAssetForm.markAllAsTouched();
      return;
    }
    this.addingAsset = true;
    const payload: Partial<Asset> = {
      assetName: this.addAssetForm.value.assetName,
      location:  this.addAssetForm.value.location,
      status:    'HEALTHY'
    };
    this.assetService.create(payload as Asset).subscribe({
      next: (created) => {
        this.allAssets = [...this.allAssets, created];
        this.addingAsset  = false;
        this.showAddAsset = false;
        this.snack.open(`Asset "${created.assetName}" added`, '', { duration: 2000, panelClass: ['snack-success'] });
      },
      error: () => {
        this.addingAsset = false;
        this.snack.open('Failed to add asset. Check backend.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  // ── Edit Asset (admin) ──────────────────────────────────────
  openEditAsset(asset: Asset): void {
    this.editingAsset = asset;
    this.editingThreshold = null;
    this.thresholdService.getByAssetId(asset.id).subscribe({
      next: (t) => this.editingThreshold = t,
      error: ()  => this.editingThreshold = null
    });
  }

  closeEditAsset(): void {
    this.editingAsset = null;
    this.editingThreshold = null;
  }

  onAssetEdited(payload: { asset: Asset; threshold: Threshold | null }): void {
    this.allAssets = this.allAssets.map(a => a.id === payload.asset.id ? payload.asset : a);
    if (this.selectedAsset?.id === payload.asset.id) {
      this.selectedAsset = payload.asset;
      if (payload.threshold) {
        this.threshold = payload.threshold;
      }
    }
    this.closeEditAsset();
  }

  onAssetDeleted(deleted: Asset): void {
    this.allAssets = this.allAssets.filter(a => a.id !== deleted.id);
    if (this.selectedAsset?.id === deleted.id) {
      this.selectedAsset = null;
      this.readings = [];
      this.threshold = null;
      this.sidebarCollapsed = false;
    }
    this.closeEditAsset();
    this.loadTickets();
    this.loadOpenCounts();
  }

  // ── Asset selection (Assets view) ───────────────────────────
  onAssetSelected(asset: Asset): void {
    this.selectedAsset = asset;
    this.sidebarCollapsed = true;          // auto-minimise sidebar
    this.loadReadings();
    this.loadThreshold(asset.id);
  }

  closeAssetDetail(): void {
    this.selectedAsset = null;
    this.readings = [];
    this.threshold = null;
    this.sidebarCollapsed = false;
  }

  loadReadings(): void {
    if (!this.selectedAsset) return;
    this.loadingReadings = true;

    this.readingService.getRecentReadings(this.selectedAsset.id).subscribe({
      next: (readings) => {
        this.readings = readings;
        this.loadingReadings = false;
        this.lastLiveRefresh = new Date();
      },
      error: () => this.loadingReadings = false
    });
  }

  loadThreshold(assetId: number): void {
    this.thresholdService.getByAssetId(assetId).subscribe({
      next: (t) => this.threshold = t,
      error: ()  => this.threshold = null
    });
  }

  onThresholdUpdated(t: Threshold): void {
    this.threshold = t;
  }

  // ── Tickets ─────────────────────────────────────────────────
  loadTickets(): void {
    this.ticketService.getAll().subscribe({ next: d => this.tickets = d });
  }

  loadOpenCounts(): void {
    this.ticketService.getOpenCounts().subscribe({ next: d => this.openCounts = d });
  }

  /** Sort tickets by status (OPEN > CLOSED), then severity, then newest first. */
  private sortByPriority(list: Ticket[]): Ticket[] {
    return [...list].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'OPEN' ? -1 : 1;
      }
      const sa = ISSUE_SEVERITY[a.issueType] ?? 0;
      const sb = ISSUE_SEVERITY[b.issueType] ?? 0;
      if (sa !== sb) return sb - sa;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  get prioritisedTickets(): Ticket[] {
    return this.sortByPriority(this.tickets);
  }

  get visibleTickets(): Ticket[] {
    const all = this.prioritisedTickets;
    return this.showClosedTickets ? all : all.filter(t => t.status === 'OPEN');
  }

  get pagedTickets(): Ticket[] {
    const start = this.ticketPageIndex * this.ticketPageSize;
    return this.visibleTickets.slice(start, start + this.ticketPageSize);
  }

  get pastTicketCount(): number {
    return this.tickets.filter(t => t.status === 'CLOSED').length;
  }

  onTicketPage(event: PageEvent): void {
    this.ticketPageIndex = event.pageIndex;
    this.ticketPageSize  = event.pageSize;
  }

  togglePastTickets(): void {
    this.showClosedTickets = !this.showClosedTickets;
    this.ticketPageIndex = 0;
  }

  closeTicket(ticket: Ticket): void {
    if (ticket.status !== 'OPEN') return;
    this.ticketService.close(ticket.id).subscribe({
      next: (updated) => {
        this.tickets = this.tickets.map(t => t.id === updated.id ? updated : t);
        this.loadOpenCounts();
        this.loadAssets();
        this.snack.open('Ticket closed', '', { duration: 1800, panelClass: ['snack-success'] });
      },
      error: () => this.snack.open('Failed to close ticket.', 'Close', { duration: 3000, panelClass: ['snack-error'] })
    });
  }

  deleteTicket(ticket: Ticket): void {
    if (!this.canManageAssets) return;
    if (!confirm(`Delete this ticket for "${ticket.asset.assetName}"?`)) return;
    this.ticketService.delete(ticket.id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== ticket.id);
        this.loadOpenCounts();
        this.snack.open('Ticket deleted', '', { duration: 1800 });
      },
      error: () => this.snack.open('Failed to delete ticket.', 'Close', { duration: 3000, panelClass: ['snack-error'] })
    });
  }

  formatIssue(issueType: string): string {
    const map: Record<string, string> = {
      RMS_OVER_THRESHOLD: 'RMS exceeded',
      TEMP_OVER_THRESHOLD: 'Temperature exceeded',
      RMS_AND_TEMP_OVER_THRESHOLD: 'RMS & temperature exceeded'
    };
    return map[issueType] ?? issueType.replace(/_/g, ' ');
  }

  ticketSeverityClass(issueType: string): string {
    const score = ISSUE_SEVERITY[issueType] ?? 0;
    if (score >= 3) return 'severity-critical';
    if (score === 2) return 'severity-high';
    return 'severity-medium';
  }

  // ── Live feed ───────────────────────────────────────────────
  private startLiveFeed(): void {
    this.liveSub = interval(3000).subscribe(() => this.refreshRealtimeData());
  }

  private refreshRealtimeData(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.allAssets = assets;
        this.syncSelectedAsset();
      }
    });
    this.loadTickets();
    this.loadOpenCounts();
    if (this.selectedAsset) {
      this.readingService.getRecentReadings(this.selectedAsset.id).subscribe({
        next: (readings) => {
          this.readings = readings;
          this.lastLiveRefresh = new Date();
        }
      });
    }
  }

  private syncSelectedAsset(): void {
    if (!this.selectedAsset) return;
    const updated = this.allAssets.find(a => a.id === this.selectedAsset?.id);
    if (updated) this.selectedAsset = updated;
  }

  // ── Auth helpers ────────────────────────────────────────────
  logout(): void {
    this.auth.logout();
  }

  // ── Convenience getters used by the template ───────────────
  get rmsMax():  number { return this.threshold?.rmsMax  ?? 10; }
  get tempMax(): number { return this.threshold?.tempMax ?? 80; }

  get latestReading(): Reading | null {
    return this.readings.length ? this.readings[this.readings.length - 1] : null;
  }
  get latestRms():  string { return this.latestReading ? this.latestReading.rms.toFixed(1) : '--'; }
  get latestTemp(): string { return this.latestReading ? this.latestReading.temperature.toFixed(1) : '--'; }
  get selectedStatus(): string { return this.selectedAsset?.status ?? 'NO_ASSET'; }
  get liveTimestamp(): string {
    return this.lastLiveRefresh
      ? this.lastLiveRefresh.toLocaleTimeString('en-US', { hour12: false })
      : '--:--:--';
  }

  get criticalTickets(): Ticket[] {
    return this.prioritisedTickets.filter(t => t.status === 'OPEN').slice(0, 5);
  }

  get openTicketCount(): number { return this.tickets.filter(t => t.status === 'OPEN').length; }
  get healthyAssetCount(): number { return this.allAssets.filter(a => a.status === 'HEALTHY').length; }
  get alertAssetCount():   number { return this.allAssets.filter(a => a.status === 'ALERT').length; }

  get userName(): string { return this.auth.currentUser?.fullName ?? 'User'; }
  get userRole(): string { return this.auth.currentUser?.role === 'ADMIN' ? 'Admin' : 'Viewer'; }
  get canManageAssets(): boolean { return this.auth.isAdmin; }

  get addName() { return this.addAssetForm.get('assetName')!; }
  get addLoc()  { return this.addAssetForm.get('location')!; }
}
