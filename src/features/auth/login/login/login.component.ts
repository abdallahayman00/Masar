import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherService } from '../../../../core/services/teacher.service';
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
    private teacherService: TeacherService,
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

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        const role = this.authService.saveSession(res);

        // المعلم لازم يكون معتمد من الإدارة قبل الدخول
        if (role === 'Teacher') {
          this.verifyTeacherApproval(res);
          return;
        }

        this.finishLogin();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(
          this.extractErrorMessage(err) ||
            'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        );
      },
    });
  }

  // التأكد أن المعلم معتمد (isApproved) قبل السماح له بالدخول
  private verifyTeacherApproval(res: any): void {
    // لو الـ API رجّع حالة الاعتماد صراحة في رد تسجيل الدخول
    if (res?.isApproved === false) {
      this.blockPendingTeacher();
      return;
    }
    if (res?.isApproved === true) {
      this.finishLogin();
      return;
    }

    const teacherId =
      this.authService.getUserIdFromToken() ?? this.authService.getTeacherId();

    if (!teacherId) {
      this.blockPendingTeacher(
        'تعذر التحقق من حالة اعتماد حسابك. حاول مرة أخرى لاحقاً.',
      );
      return;
    }

    this.teacherService.getTeacherDetails(teacherId).subscribe({
      next: (teacher) => {
        if (teacher?.isApproved === false) {
          this.blockPendingTeacher();
          return;
        }
        this.finishLogin();
      },
      error: (err) => {
        const msg =
          typeof err?.error === 'string' ? err.error : err?.error?.message;
        this.blockPendingTeacher(
          msg || 'حسابك قيد المراجعة من الإدارة ولم يتم اعتماده بعد.',
        );
      },
    });
  }

  private blockPendingTeacher(
    message = 'حسابك قيد المراجعة من الإدارة ولم يتم اعتماده بعد. سيتم إخطارك عند التفعيل.',
  ): void {
    this.loading = false;
    this.authService.clearAuthData();
    this.toastService.warning(message, 'حساب غير مفعّل');
  }

  private finishLogin(): void {
    this.loading = false;
    this.toastService.success('تم تسجيل الدخول بنجاح');
    this.router.navigate(['/dashboard']);
  }

  private extractErrorMessage(err: any): string | null {
    const e = err?.error;
    if (typeof e === 'string' && e.trim()) return e;
    if (e?.message) return e.message;
    if (e?.title) return e.title;
    return null;
  }
}
