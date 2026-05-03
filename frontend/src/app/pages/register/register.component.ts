import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass    = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  const errors: Record<string, boolean> = {};
  if (v.length < 8)             errors['minLength']   = true;
  if (!/[A-Z]/.test(v))        errors['uppercase']   = true;
  if (!/[0-9]/.test(v))        errors['number']      = true;
  if (!/[^A-Za-z0-9]/.test(v)) errors['special']     = true;
  return Object.keys(errors).length ? errors : null;
}

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const pattern = /^\+?(\d[\s\-.]?){7,14}\d$/;
  return pattern.test(control.value.trim()) ? null : { invalidPhone: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  loading      = false;
  showPassword = false;
  showConfirm  = false;

  constructor(
    private fb:     FormBuilder,
    private router: Router,
    private snack:  MatSnackBar,
    private auth:   AuthService
  ) {
    this.form = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.required, phoneValidator]],
      password:        ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    setTimeout(() => {
      const { fullName, email, phone, password } = this.form.value;
      const result = this.auth.register(fullName, email, phone, password);
      this.loading = false;
      if (result.ok) {
        this.snack.open('Account created! Redirecting to dashboard…', '', { duration: 2500, panelClass: ['snack-success'] });
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      } else {
        this.snack.open(result.message, 'Close', { duration: 4000, panelClass: ['snack-error'] });
      }
    }, 800);
  }

  goToLogin() { this.router.navigate(['/login']); }
  goToHome()  { this.router.navigate(['/']); }

  get fullName()        { return this.form.get('fullName')!; }
  get email()           { return this.form.get('email')!; }
  get phone()           { return this.form.get('phone')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  // Password strength helpers for the live checklist
  hasMinLength()  { return !this.password.hasError('minLength'); }
  hasUppercase()  { return !this.password.hasError('uppercase'); }
  hasNumber()     { return !this.password.hasError('number'); }
  hasSpecial()    { return !this.password.hasError('special'); }
}
