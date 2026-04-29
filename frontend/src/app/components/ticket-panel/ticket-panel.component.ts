import { Component, Input } from '@angular/core';
import { Ticket, OpenCountDto } from '../../models/models';

@Component({
  selector: 'app-ticket-panel',
  templateUrl: './ticket-panel.component.html',
  styleUrls: ['./ticket-panel.component.css']
})
export class TicketPanelComponent {
  @Input() tickets: Ticket[] = [];
  @Input() openCounts: OpenCountDto[] = [];

  formatIssueType(issueType: string): string {
    const map: Record<string, string> = {
      RMS_OVER_THRESHOLD: 'RMS Exceeded',
      TEMP_OVER_THRESHOLD: 'Temperature Exceeded',
      RMS_AND_TEMP_OVER_THRESHOLD: 'RMS & Temp Exceeded'
    };
    return map[issueType] ?? issueType.replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  getOpenCount(assetId: number): number {
    const found = this.openCounts.find(o => o.assetId === assetId);
    return found ? found.openCount : 0;
  }

  getIssueIcon(issueType: string): string {
    if (issueType === 'RMS_OVER_THRESHOLD') return 'vibration';
    if (issueType === 'TEMP_OVER_THRESHOLD') return 'thermostat';
    return 'warning';
  }

  get recentTickets(): Ticket[] {
    return this.tickets.slice(0, 20);
  }
}
