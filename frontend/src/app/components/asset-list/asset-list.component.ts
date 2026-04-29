import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Asset } from '../../models/models';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements OnChanges {
  @Input() assets: Asset[] = [];
  @Input() selectedAssetId: number | null = null;
  @Output() assetSelected = new EventEmitter<Asset>();

  displayedColumns: string[] = ['assetName', 'location', 'status', 'action'];
  dataSource = new MatTableDataSource<Asset>([]);
  filterValue = '';

  ngOnChanges(): void {
    this.dataSource.data = this.assets;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  selectAsset(asset: Asset): void {
    this.assetSelected.emit(asset);
  }

  getStatusClass(status: string): string {
    return `status-pill ${status}`;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      HEALTHY: 'Healthy',
      WARNING: 'Warning',
      NEEDS_ATTEN: 'Needs Attention',
      ALERT: 'Alert'
    };
    return map[status] ?? status;
  }
}
