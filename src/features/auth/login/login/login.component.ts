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
  successMessage = ''; // إضافة رسالة النجاح
  showPassword = false;

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
    this.successMessage = ''; // مسح رسالة النجاح السابقة

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

        // عرض رسالة نجاح قبل التوجيه
        this.successMessage = '✓ تم تسجيل الدخول بنجاح... جاري التحويل';

        // التوجيه بعد نصف ثانية لإظهار رسالة النجاح
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        this.loading = false;
        // رسالة خطأ ثابتة بغض النظر عن الخطأ القادم من API
        this.errorMessage = '⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة';
      },
    });
  }
}
