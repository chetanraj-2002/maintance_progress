import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reading, ReadingPage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private baseUrl = 'http://localhost:9090/api/readings';

  constructor(private http: HttpClient) {}

  getRecentReadings(assetId: number): Observable<Reading[]> {
    return this.http.get<Reading[]>(`${this.baseUrl}/recent/${assetId}`);
  }

  getReadings(
    assetId: number,
    page: number,
    size: number,
    start?: string | null,
    end?: string | null
  ): Observable<ReadingPage> {
    let params = new HttpParams()
      .set('assetId', assetId)
      .set('page', page)
      .set('size', size)
      .set('sort', 'timestamp,desc');

    if (start && end) {
      params = params.set('start', start).set('end', end);
    }

    return this.http.get<ReadingPage>(this.baseUrl, { params });
  }

  getReadingsByRange(assetId: number, start: string, end: string): Observable<Reading[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Reading[]>(`${this.baseUrl}/asset/${assetId}/range`, { params });
  }
}
