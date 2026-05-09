import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reading } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private baseUrl = 'http://localhost:9090/api/readings';

  constructor(private http: HttpClient) {}

  getRecentReadings(assetId: number): Observable<Reading[]> {
    return this.http.get<Reading[]>(`${this.baseUrl}/recent/${assetId}`);
  }
}
