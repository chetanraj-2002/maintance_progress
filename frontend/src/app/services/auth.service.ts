import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'USER';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly USERS_KEY  = 'pm_users';
  private readonly SESSION_KEY = 'pm_session';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadSession());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.ensureDefaultAccounts();
  }

  // ── Register ─────────────────────────────────────────────
  register(fullName: string, email: string, phone: string, password: string, role: UserRole = 'USER'): { ok: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'An account with this email already exists.' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      role
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
  get isAdmin(): boolean         { return this.currentUser?.role === 'ADMIN'; }

  // Per-user storage key prefix (so each user has isolated dashboard data)
  userKey(suffix: string): string {
    return `pm_${this.currentUser?.id ?? 'anon'}_${suffix}`;
  }

  private setSession(user: User): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadSession(): User | null {
    try { return this.normalizeUser(JSON.parse(localStorage.getItem(this.SESSION_KEY) ?? 'null')); }
    catch { return null; }
  }

  private getUsers(): User[] {
    try {
      const users = JSON.parse(localStorage.getItem(this.USERS_KEY) ?? '[]');
      return Array.isArray(users) ? users.map(u => this.normalizeUser(u)).filter(Boolean) as User[] : [];
    }
    catch { return []; }
  }

  private ensureDefaultAccounts(): void {
    const users = this.getUsers();
    if (users.length > 0) return;

    const admin: User = {
      id: 'admin-demo',
      fullName: 'Admin User',
      email: 'admin@pm.local',
      phone: '+91 90000 00000',
      role: 'ADMIN'
    };
    const viewer: User = {
      id: 'viewer-demo',
      fullName: 'Viewer User',
      email: 'viewer@pm.local',
      phone: '+91 90000 00001',
      role: 'USER'
    };

    localStorage.setItem(this.USERS_KEY, JSON.stringify([admin, viewer]));
    localStorage.setItem(`pm_pwd_${admin.id}`, btoa('Admin@123'));
    localStorage.setItem(`pm_pwd_${viewer.id}`, btoa('Viewer@123'));
  }

  private normalizeUser(user: User | null): User | null {
    if (!user) return null;
    return {
      ...user,
      role: user.role ?? 'USER'
    };
  }
}
