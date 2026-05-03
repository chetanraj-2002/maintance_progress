import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly USERS_KEY  = 'pm_users';
  private readonly SESSION_KEY = 'pm_session';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadSession());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {}

  // ── Register ─────────────────────────────────────────────
  register(fullName: string, email: string, phone: string, password: string): { ok: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'An account with this email already exists.' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone
    };
    users.push(user);
    // store hashed password alongside (simple sha-like key for demo — replace with real API)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`pm_pwd_${user.id}`, btoa(password));
    this.setSession(user);
    return { ok: true, message: 'Account created!' };
  }

  // ── Login ─────────────────────────────────────────────────
  login(email: string, password: string): { ok: boolean; message: string } {
    const users = this.getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, message: 'No account found with this email.' };
    const stored = localStorage.getItem(`pm_pwd_${user.id}`);
    if (stored !== btoa(password)) return { ok: false, message: 'Incorrect password.' };
    this.setSession(user);
    return { ok: true, message: 'Welcome back, ' + user.fullName + '!' };
  }

  // ── Logout ────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Forgot password ───────────────────────────────────────
  sendResetLink(email: string): { ok: boolean; message: string } {
    const users = this.getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, message: 'No account found with this email.' };
    // Generate a token and store it (in a real app this is emailed via backend)
    const token = btoa(`${user.id}:${Date.now()}`);
    localStorage.setItem(`pm_reset_${token}`, user.id);
    // For demo: store so ResetPassword page can read it
    localStorage.setItem('pm_reset_token_demo', token);
    return { ok: true, message: 'Reset link generated. (Demo: token stored locally.)' };
  }

  // ── Reset password ────────────────────────────────────────
  resetPassword(token: string, newPassword: string): { ok: boolean; message: string } {
    const userId = localStorage.getItem(`pm_reset_${token}`);
    if (!userId) return { ok: false, message: 'Invalid or expired reset link.' };
    localStorage.setItem(`pm_pwd_${userId}`, btoa(newPassword));
    localStorage.removeItem(`pm_reset_${token}`);
    localStorage.removeItem('pm_reset_token_demo');
    return { ok: true, message: 'Password updated successfully! Please log in.' };
  }

  // ── Helpers ───────────────────────────────────────────────
  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean      { return !!this.currentUserSubject.value; }

  // Per-user storage key prefix (so each user has isolated dashboard data)
  userKey(suffix: string): string {
    return `pm_${this.currentUser?.id ?? 'anon'}_${suffix}`;
  }

  private setSession(user: User): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadSession(): User | null {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY) ?? 'null'); }
    catch { return null; }
  }

  private getUsers(): User[] {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY) ?? '[]'); }
    catch { return []; }
  }
}
