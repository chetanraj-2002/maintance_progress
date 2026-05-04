import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThresholdService } from '../../services/threshold.service';
import { Threshold } from '../../models/models';

@Component({
  selector: 'app-threshold-form',
  templateUrl: './threshold-form.component.html',
  styleUrls: ['./threshold-form.component.css']
})
export class ThresholdFormComponent implements OnChanges {
  @Input() threshold: Threshold | null = null;
  @Input() selectedAssetId: number | null = null;
  @Input() readonly = false;
  @Output() thresholdUpdated = new EventEmitter<Threshold>();

  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private thresholdService: ThresholdService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      rmsMax: [10, [Validators.required, Validators.min(0.1)]],
      tempMax: [80, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.threshold) {
      this.form.patchValue({
        rmsMax: this.threshold.rmsMax,
        tempMax: this.threshold.tempMax
      });
    }

    if (this.readonly) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  save(): void {
    if (this.readonly || this.form.invalid || this.selectedAssetId == null) return;

    this.saving = true;
    const payload = {
      assetId: this.selectedAssetId,
      rmsMax: this.form.value.rmsMax,
      tempMax: this.form.value.tempMax
    };

    this.thresholdService.saveOrUpdate(payload).subscribe({
      next: (updated) => {
        this.saving = false;
        this.thresholdUpdated.emit(updated);
        this.snackBar.open('Thresholds updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['snack-success']
        });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open('Failed to update thresholds', 'Close', {
          duration: 3000,
          panelClass: ['snack-error']
        });
        console.error(err);
      }
    });
  }
}
