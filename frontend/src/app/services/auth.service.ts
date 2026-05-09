import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'USER';

interface AuthResponse {
  token: string;
  expiresInMs: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
  };
}

interface ResetTokenResponse {
  message: string;
  token: string;
}

interface MessageResponse {
  message: string;
}

const TOKEN_KEY = 'pm_jwt';
const USER_KEY  = 'pm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly baseUrl = 'http://localhost:9090/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Register ────────────────────────────────────────────
  register(fullName: string, email: string, phone: string, password: string, role: UserRole = 'USER'): Observable<{ ok: boolean; message: string }> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { fullName, email, phone, password, role }).pipe(
      tap(res => this.persistSession(res)),
      map(() => ({ ok: true, message: 'Account created!' })),
      catchError(err => of({ ok: false, message: this.extractMessage(err, 'Could not create account.') }))
    );
  }

  // ── Login ───────────────────────────────────────────────
  login(email: string, password: string): Observable<{ ok: boolean; message: string }> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(res => this.persistSession(res)),
      map(res => ({ ok: true, message: `Welcome back, ${res.user.fullName}!` })),
      catchError(err => of({ ok: false, message: this.extractMessage(err, 'Invalid email or password.') }))
    );
  }

  // ── Logout ──────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Forgot password ─────────────────────────────────────
  sendResetLink(email: string): Observable<{ ok: boolean; message: string; token?: string }> {
    return this.http.post<ResetTokenResponse>(`${this.baseUrl}/forgot-password`, { email }).pipe(
      map(res => ({ ok: true, message: res.message, token: res.token })),
      catchError(err => of({ ok: false, message: this.extractMessage(err, 'Could not send reset link.') }))
    );
  }

  // ── Reset password ──────────────────────────────────────
  resetPassword(token: string, newPassword: string): Observable<{ ok: boolean; message: string }> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, { token, password: newPassword }).pipe(
      map(res => ({ ok: true, message: res.message })),
      catchError(err => of({ ok: false, message: this.extractMessage(err, 'Invalid or expired reset link.') }))
    );
  }

  // ── Helpers ─────────────────────────────────────────────
  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean      { return !!this.getToken(); }
  get isAdmin(): boolean         { return this.currentUser?.role === 'ADMIN'; }

  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }

  userKey(suffix: string): string {
    return `pm_${this.currentUser?.id ?? 'anon'}_${suffix}`;
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw || !localStorage.getItem(TOKEN_KEY)) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private extractMessage(err: any, fallback: string): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string' && err.error.trim()) return err.error;
    if (err?.message) return err.message;
    return fallback;
  }
}
