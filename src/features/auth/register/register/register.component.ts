import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentRegisterComponent } from '../student/student-register/student-register.component';
import { TeacherRegisterComponent } from '../teacher/teacher-register/teacher-register.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, StudentRegisterComponent, TeacherRegisterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnDestroy {
  activeMode: 'student' | 'teacher' = 'student';
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Toast properties
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  setMode(mode: 'student' | 'teacher'): void {
    this.activeMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.toastMessage = '';
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage = message;
    this.toastType = type;
    this.errorMessage = '';
    this.successMessage = '';

    // Auto hide after 3 seconds
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 3000);
  }

  closeToast(): void {
    this.toastMessage = '';
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  onStudentSubmit(formData: any): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.toastMessage = '';

    const request = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      studentNationality: formData.studentNationality,
      whatsAppNumber: formData.whatsAppNumber,
      parentWhatsAppNumber: formData.parentWhatsAppNumber || '',
      studentNotes: formData.studentNotes || '',
      platformExpectations: formData.platformExpectations || '',
      age: formData.age.toString(),
      nationalId: formData.nationalId,
      gender: formData.gender,
      residenceCountry: formData.residenceCountry,
    };

    console.log('Sending request:', request); // ✅ شوف البيانات اللي بتتبعت

    this.authService.registerStudent(request).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToast(
          '✓ تم إنشاء حساب الطالب بنجاح! جاري التحويل إلى صفحة تسجيل الدخول...',
          'success',
        );

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Full error:', err);

        let errorMessage = '⚠️ حدث خطأ أثناء إنشاء الحساب.';

        // معالجة أخطاء ASP.NET validation
        if (err.error?.errors) {
          const errors = err.error.errors;
          const errorList = [];

          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              errorList.push(`${key}: ${errors[key].join(', ')}`);
            }
          }

          if (errorList.length > 0) {
            errorMessage = errorList.join(' | ');
          }
        }
        // معالجة أخطاء FluentValidation
        else if (err.error?.title && err.error?.title.includes('validation')) {
          errorMessage = err.error.title;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }

        this.showToast(errorMessage, 'error');
      },
    });
  }

  onTeacherSubmit(formData: FormData): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.toastMessage = '';

    // ✅ للتأكد من البيانات المرسلة (للتجربة)
    console.log('📤 Sending teacher data:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(
          `  ${key}:`,
          value.name,
          `(${value.type}, ${value.size} bytes)`,
        );
      } else {
        console.log(`  ${key}:`, value);
      }
    });

    this.authService.registerTeacher(formData).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('✅ Teacher registration success:', res);

        this.showToast(
          '✓ تم إرسال طلب التسجيل بنجاح! سيتم مراجعة بياناتك والتواصل معك قريباً.',
          'success',
        );

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Teacher registration error:', err);

        let errorMessage = '⚠️ حدث خطأ أثناء إرسال الطلب.';

        // معالجة أخطاء ASP.NET validation
        if (err.error?.errors) {
          const errors = err.error.errors;
          const errorList = [];

          for (const key in errors) {
            if (errors.hasOwnProperty(key)) {
              errorList.push(`${key}: ${errors[key].join(', ')}`);
            }
          }

          if (errorList.length > 0) {
            errorMessage = errorList.join(' | ');
          }
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }

        this.showToast(errorMessage, 'error');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
