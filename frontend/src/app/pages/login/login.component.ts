import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;

  features = [
    { icon: 'sensors', text: 'Live sensor monitoring across all assets' },
    { icon: 'analytics', text: 'Predictive threshold alerts & analytics' },
    { icon: 'confirmation_number', text: 'Automated maintenance ticket system' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    // Simulate API call — replace with real AuthService.login() call
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open('Login successful! Redirecting to dashboard…', '', {
        duration: 2000,
        panelClass: ['snack-success']
      });
      setTimeout(() => this.router.navigate(['/dashboard']), 1800);
    }, 1200);
  }

  goToRegister() { this.router.navigate(['/register']); }
  goToHome()     { this.router.navigate(['/']); }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
