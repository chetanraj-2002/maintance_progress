import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading      = false;
  showPassword = false;

  features = [
    { icon: 'sensors',              text: 'Live sensor monitoring across all assets' },
    { icon: 'analytics',            text: 'Predictive threshold alerts & analytics' },
    { icon: 'confirmation_number',  text: 'Automated maintenance ticket system' }
  ];

  constructor(
    private fb:     FormBuilder,
    private router: Router,
    private snack:  MatSnackBar,
    private auth:   AuthService
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    setTimeout(() => {
      const { email, password } = this.form.value;
      const result = this.auth.login(email, password);
      this.loading = false;
      if (result.ok) {
        this.snack.open(result.message, '', { duration: 2000, panelClass: ['snack-success'] });
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      } else {
        this.snack.open(result.message, 'Close', { duration: 4000, panelClass: ['snack-error'] });
      }
    }, 800);
  }

  goToRegister()     { this.router.navigate(['/register']); }
  goToHome()         { this.router.navigate(['/']); }
  goToForgotPassword() { this.router.navigate(['/forgot-password']); }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
