import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  successMessage: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRememberMe(): void {
    const current = this.loginForm.get('rememberMe')?.value;
    this.loginForm.patchValue({ rememberMe: !current });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;

        // ✅ تخزين التوكن حسب اختيار rememberMe
        const token = res?.token || res?.data?.token;
        if (token) {
          if (rememberMe) {
            localStorage.setItem('token', token);
          } else {
            sessionStorage.setItem('token', token);
          }
        } else {
          console.warn('No token received from API', res);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;

        let message = 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        if (err?.error?.message) {
          message = err.error.message;
        } else if (typeof err?.error === 'string') {
          message = err.error;
        }

        this.errorMessage = message;
      },
    });
  }
}
