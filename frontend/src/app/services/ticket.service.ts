import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OpenCountDto, Ticket } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private baseUrl = 'http://localhost:9090/api/tickets';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  getOpenCounts(): Observable<OpenCountDto[]> {
    return this.http.get<OpenCountDto[]>(`${this.baseUrl}/open-counts`);
  }

  create(assetId: number, issueType: string): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, { assetId, issueType }, this.roleHeaders());
  }

  /** Close a ticket. Allowed for any logged-in user. */
  close(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/close`, null);
  }

  /** Delete a ticket. Admin-only. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.roleHeaders());
  }

  private roleHeaders() {
    return {
      headers: { 'X-User-Role': this.auth.currentUser?.role ?? 'USER' }
    };
  }
}
