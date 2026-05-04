import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private baseUrl = 'http://localhost:9090/api/assets';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll():                     Observable<Asset[]>   { return this.http.get<Asset[]>(this.baseUrl); }
  getById(id: number):          Observable<Asset>     { return this.http.get<Asset>(`${this.baseUrl}/${id}`); }
  create(asset: Asset):         Observable<Asset>     { return this.http.post<Asset>(this.baseUrl, asset, this.roleOptions()); }
  update(id: number, a: Asset): Observable<Asset>     { return this.http.put<Asset>(`${this.baseUrl}/${id}`, a, this.roleOptions()); }
  delete(id: number):           Observable<void>      { return this.http.delete<void>(`${this.baseUrl}/${id}`, this.roleOptions()); }

  private roleOptions() {
    return { headers: { 'X-User-Role': this.auth.currentUser?.role ?? 'USER' } };
  }
}
