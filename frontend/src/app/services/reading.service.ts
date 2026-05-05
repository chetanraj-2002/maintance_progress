import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Reading } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private baseUrl = 'http://localhost:9090/api/readings';

  constructor(private http: HttpClient) {}

  getReadings(assetId?: number, start?: string, end?: string, page = 0, size = 200): Observable<Page<Reading>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (assetId != null) params = params.set('assetId', assetId);
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<Page<Reading>>(this.baseUrl, { params });
  }

  getRecentReadings(assetId: number): Observable<Reading[]> {
    return this.http.get<Reading[]>(`${this.baseUrl}/recent/${assetId}`);
  }
}
