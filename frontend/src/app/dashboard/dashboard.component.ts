import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Asset, Reading, Threshold, Ticket, OpenCountDto } from '../models/models';
import { AssetService } from '../services/asset.service';
import { ReadingService } from '../services/reading.service';
import { ThresholdService } from '../services/threshold.service';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Data
  allAssets:    Asset[]       = [];
  pagedAssets:  Asset[]       = [];
  readings:     Reading[]     = [];
  tickets:      Ticket[]      = [];
  openCounts:   OpenCountDto[] = [];
  selectedAsset: Asset | null = null;
  threshold:    Threshold | null = null;

  // Pagination
  pageSize  = 4;
  pageIndex = 0;
  pageSizeOptions = [4, 8, 12];

  // Date filter
  startDate: Date | null = null;
  endDate:   Date | null = null;

  // Loading flags
  loadingAssets   = false;
  loadingReadings = false;

  // Add Asset dialog
  showAddAsset = false;
  addAssetForm: FormGroup;
  addingAsset  = false;

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
    if (!this.auth.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.loadAssets();
    this.loadTickets();
    this.loadOpenCounts();
  }

  // ── Asset loading ──────────────────────────────────────────
  loadAssets(): void {
    this.loadingAssets = true;
    this.assetService.getAll().subscribe({
      next: (data) => {
        this.allAssets   = data;
        this.pageIndex   = 0;
        this.updatePage();
        this.loadingAssets = false;
      },
      error: () => this.loadingAssets = false
    });
  }

  updatePage(): void {
    const start      = this.pageIndex * this.pageSize;
    this.pagedAssets = this.allAssets.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.updatePage();
  }

  // ── Add Asset ──────────────────────────────────────────────
  openAddAsset():  void { this.showAddAsset = true; this.addAssetForm.reset(); }
  closeAddAsset(): void { this.showAddAsset = false; }

  submitAddAsset(): void {
    if (this.addAssetForm.invalid) { this.addAssetForm.markAllAsTouched(); return; }
    this.addingAsset = true;
    const payload: Partial<Asset> = {
      assetName: this.addAssetForm.value.assetName,
      location:  this.addAssetForm.value.location,
      status:    'HEALTHY'
    };
    this.assetService.create(payload as Asset).subscribe({
      next: (created) => {
        this.allAssets = [...this.allAssets, created];
        this.updatePage();
        this.addingAsset  = false;
        this.showAddAsset = false;
        this.snack.open(`Asset "${created.assetName}" added!`, '', { duration: 2500, panelClass: ['snack-success'] });
      },
      error: () => {
        this.addingAsset = false;
        this.snack.open('Failed to add asset. Check backend.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  // ── Delete Asset ───────────────────────────────────────────
  deleteAsset(asset: Asset): void {
    if (!confirm(`Delete "${asset.assetName}"? This also removes its readings and tickets.`)) return;
    this.assetService.delete(asset.id).subscribe({
      next: () => {
        this.allAssets = this.allAssets.filter(a => a.id !== asset.id);
        if (this.selectedAsset?.id === asset.id) { this.selectedAsset = null; this.readings = []; }
        this.updatePage();
        this.snack.open(`Asset "${asset.assetName}" deleted.`, '', { duration: 2500 });
      },
      error: () => this.snack.open('Failed to delete asset.', 'Close', { duration: 3000, panelClass: ['snack-error'] })
    });
  }

  // ── Tickets ────────────────────────────────────────────────
  loadTickets(): void {
    this.ticketService.getAll().subscribe({ next: d => this.tickets = d });
  }

  loadOpenCounts(): void {
    this.ticketService.getOpenCounts().subscribe({ next: d => this.openCounts = d });
  }

  // ── Asset selected ─────────────────────────────────────────
  onAssetSelected(asset: Asset): void {
    this.selectedAsset = asset;
    this.loadReadings();
    this.loadThreshold(asset.id);
  }

  loadReadings(): void {
    if (!this.selectedAsset) return;
    this.loadingReadings = true;
    const s = this.startDate ? new Date(this.startDate.setHours(0,0,0,0)).toISOString().slice(0,19) : undefined;
    const e = this.endDate   ? new Date(this.endDate.setHours(23,59,59,999)).toISOString().slice(0,19) : undefined;
    this.readingService.getReadings(this.selectedAsset.id, s, e).subscribe({
      next: (page) => { this.readings = page.content; this.loadingReadings = false; },
      error: ()    => this.loadingReadings = false
    });
  }

  loadThreshold(assetId: number): void {
    this.thresholdService.getByAssetId(assetId).subscribe({
      next: (t) => this.threshold = t,
      error: ()  => this.threshold = null
    });
  }

  onThresholdUpdated(t: Threshold): void { this.threshold = t; }

  applyDateFilter(): void  { this.loadReadings(); }
  clearDateFilter(): void  { this.startDate = null; this.endDate = null; this.loadReadings(); }

  logout(): void { this.auth.logout(); }

  get rmsMax():  number { return this.threshold?.rmsMax  ?? 10; }
  get tempMax(): number { return this.threshold?.tempMax ?? 80; }
  get userName(): string { return this.auth.currentUser?.fullName ?? 'User'; }
  get userRole(): string { return this.auth.currentUser?.role === 'ADMIN' ? 'Admin' : 'Viewer'; }
  get canManageAssets(): boolean { return this.auth.isAdmin; }
  get addName()  { return this.addAssetForm.get('assetName')!; }
  get addLoc()   { return this.addAssetForm.get('location')!; }
}
