import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
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
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
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

  // login.component.ts (الجزء المعدل من onSubmit)
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;

        let token = res?.token;
        let role = res?.role;

        // 🔥 توحيد صيغة الدور: أول حرف كبير والباقي صغير -> "Admin" أو "Teacher"
        if (role && typeof role === 'string') {
          role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        } else {
          role = ''; // fallback
        }

        const storage = rememberMe ? localStorage : sessionStorage;

        if (token) {
          localStorage.setItem('token', token);
        }

        if (role) {
          localStorage.setItem('role', role);
        }

        this.toastService.success('تم تسجيل الدخول بنجاح');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 0);
      },
      error: () => {
        this.loading = false;
        this.toastService.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      },
    });
  }
}
