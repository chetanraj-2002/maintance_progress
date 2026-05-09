import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { Asset, Threshold } from '../../models/models';
import { AssetService } from '../../services/asset.service';
import { ThresholdService } from '../../services/threshold.service';

@Component({
  selector: 'app-asset-edit-dialog',
  templateUrl: './asset-edit-dialog.component.html',
  styleUrls: ['./asset-edit-dialog.component.css']
})
export class AssetEditDialogComponent implements OnChanges {
  @Input() asset: Asset | null = null;
  @Input() threshold: Threshold | null = null;
  @Input() canDelete = false;

  @Output() saved = new EventEmitter<{ asset: Asset; threshold: Threshold | null }>();
  @Output() deleted = new EventEmitter<Asset>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  saving = false;
  deleting = false;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private thresholdService: ThresholdService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      assetName: ['', [Validators.required, Validators.minLength(2)]],
      location:  ['', [Validators.required, Validators.minLength(2)]],
      rmsMax:    [10, [Validators.required, Validators.min(0.1)]],
      tempMax:   [80, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.asset) {
      this.form.patchValue({
        assetName: this.asset.assetName,
        location:  this.asset.location,
        rmsMax:    this.threshold?.rmsMax ?? 10,
        tempMax:   this.threshold?.tempMax ?? 80
      });
    }
  }

  submit(): void {
    if (!this.asset || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const v = this.form.value;
    const updatedAsset: Asset = {
      ...this.asset,
      assetName: v.assetName,
      location:  v.location
    };

    forkJoin({
      asset: this.assetService.update(this.asset.id, updatedAsset),
      threshold: this.thresholdService.saveOrUpdate({
        assetId: this.asset.id,
        rmsMax:  v.rmsMax,
        tempMax: v.tempMax
      })
    }).subscribe({
      next: ({ asset, threshold }) => {
        this.saving = false;
        this.snack.open(`"${asset.assetName}" updated`, '', { duration: 2000, panelClass: ['snack-success'] });
        this.saved.emit({ asset, threshold });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Failed to update asset.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  remove(): void {
    if (!this.asset) return;
    if (!confirm(`Permanently delete "${this.asset.assetName}"? Readings, thresholds, and tickets for this asset will also be removed.`)) {
      return;
    }
    this.deleting = true;
    this.assetService.delete(this.asset.id).subscribe({
      next: () => {
        this.deleting = false;
        this.snack.open(`"${this.asset!.assetName}" deleted`, '', { duration: 2000 });
        this.deleted.emit(this.asset!);
      },
      error: () => {
        this.deleting = false;
        this.snack.open('Failed to delete asset.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
      }
    });
  }

  cancel(): void {
    this.closed.emit();
  }

  get name() { return this.form.get('assetName')!; }
  get loc()  { return this.form.get('location')!; }
  get rms()  { return this.form.get('rmsMax')!; }
  get temp() { return this.form.get('tempMax')!; }
}
