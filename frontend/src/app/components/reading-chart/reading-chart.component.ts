import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartDataset } from 'chart.js';
import { Reading } from '../../models/models';

@Component({
  selector: 'app-reading-chart',
  templateUrl: './reading-chart.component.html',
  styleUrls: ['./reading-chart.component.css']
})
export class ReadingChartComponent implements OnChanges {
  @Input() readings: Reading[] = [];
  @Input() selectedAssetName: string = '';
  @Input() rmsMax: number = 10;
  @Input() tempMax: number = 80;

  chartData: ChartData<'line'> = { labels: [], datasets: [] };
  chartReady = false;

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151',
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#2563eb',
        bodyColor: '#374151',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      } as any
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          maxTicksLimit: 12,
          maxRotation: 45
        },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    elements: {
      line: { tension: 0.3 },
      point: { radius: 3, hoverRadius: 6 }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (this.readings && this.readings.length > 0) {
      this.buildChart();
      this.chartReady = true;
    } else {
      this.chartReady = false;
      this.chartData = { labels: [], datasets: [] };
    }
  }

  private buildChart(): void {
    const labels = this.readings.map(r => {
      const d = new Date(r.timestamp);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    const rmsValues  = this.readings.map(r => r.rms);
    const tempValues = this.readings.map(r => r.temperature);

    const rmsPointColors  = rmsValues.map(v => v > this.rmsMax ? '#dc2626' : '#2563eb');
    const tempPointColors = tempValues.map(v => v > this.tempMax ? '#dc2626' : '#16a34a');

    const rmsDataset: ChartDataset<'line'> = {
      label: `RMS (g) — max: ${this.rmsMax}`,
      data: rmsValues,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.07)',
      pointBackgroundColor: rmsPointColors,
      pointBorderColor: rmsPointColors,
      pointRadius: rmsValues.map(v => v > this.rmsMax ? 6 : 3),
      fill: true,
      tension: 0.3
    };

    const tempDataset: ChartDataset<'line'> = {
      label: `Temperature (°C) — max: ${this.tempMax}`,
      data: tempValues,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.06)',
      pointBackgroundColor: tempPointColors,
      pointBorderColor: tempPointColors,
      pointRadius: tempValues.map(v => v > this.tempMax ? 6 : 3),
      fill: true,
      tension: 0.3
    };

    this.chartData = {
      labels: [...labels],
      datasets: [rmsDataset, tempDataset]
    };
  }
}
