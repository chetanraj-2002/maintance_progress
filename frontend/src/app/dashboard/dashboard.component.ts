import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asset, Reading, Threshold, Ticket, OpenCountDto } from '../models/models';
import { AssetService } from '../services/asset.service';
import { ReadingService } from '../services/reading.service';
import { ThresholdService } from '../services/threshold.service';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  assets: Asset[] = [];
  readings: Reading[] = [];
  tickets: Ticket[] = [];
  openCounts: OpenCountDto[] = [];
  selectedAsset: Asset | null = null;
  threshold: Threshold | null = null;

  startDate: Date | null = null;
  endDate: Date | null = null;

  loadingAssets = false;
  loadingReadings = false;

  constructor(
    private assetService: AssetService,
    private readingService: ReadingService,
    private thresholdService: ThresholdService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssets();
    this.loadTickets();
    this.loadOpenCounts();
  }

  loadAssets(): void {
    this.loadingAssets = true;
    this.assetService.getAll().subscribe({
      next: (data) => { this.assets = data; this.loadingAssets = false; },
      error: (err) => { console.error('Failed to load assets:', err); this.loadingAssets = false; }
    });
  }

  loadTickets(): void {
    this.ticketService.getAll().subscribe({
      next: (data) => this.tickets = data,
      error: (err) => console.error('Failed to load tickets:', err)
    });
  }

  loadOpenCounts(): void {
    this.ticketService.getOpenCounts().subscribe({
      next: (data) => this.openCounts = data,
      error: (err) => console.error('Failed to load open counts:', err)
    });
  }

  onAssetSelected(asset: Asset): void {
    this.selectedAsset = asset;
    this.loadReadings();
    this.loadThreshold(asset.id);
  }

  loadReadings(): void {
    if (!this.selectedAsset) return;
    this.loadingReadings = true;
    const startStr = this.startDate
      ? new Date(this.startDate.setHours(0, 0, 0, 0)).toISOString().slice(0, 19)
      : undefined;
    const endStr = this.endDate
      ? new Date(this.endDate.setHours(23, 59, 59, 999)).toISOString().slice(0, 19)
      : undefined;
    this.readingService.getReadings(this.selectedAsset.id, startStr, endStr).subscribe({
      next: (page) => { this.readings = page.content; this.loadingReadings = false; },
      error: (err) => { console.error('Failed to load readings:', err); this.loadingReadings = false; }
    });
  }

  loadThreshold(assetId: number): void {
    this.thresholdService.getByAssetId(assetId).subscribe({
      next: (t) => this.threshold = t,
      error: (err) => { console.error('Failed to load threshold:', err); this.threshold = null; }
    });
  }

  onThresholdUpdated(updated: Threshold): void {
    this.threshold = updated;
    if (this.selectedAsset) this.loadReadings();
  }

  applyDateFilter(): void { this.loadReadings(); }

  clearDateFilter(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadReadings();
  }

  goHome() { this.router.navigate(['/']); }

  get rmsMax(): number  { return this.threshold?.rmsMax ?? 10; }
  get tempMax(): number { return this.threshold?.tempMax ?? 80; }
}
