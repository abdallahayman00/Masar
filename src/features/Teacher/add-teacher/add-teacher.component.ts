// add-teacher.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

export interface NewTeacherData {
  userName: string;
  email: string;
  password: string;
  age: number;
  whatsAppNumber: string;
  nationalId: string;
  gender: string;
  residenceCountry: string;
  nationality: string;
  summary: string;
}

@Component({
  selector: 'app-add-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-teacher.component.html',
  styleUrls: ['./add-teacher.component.scss'],
})
export class AddTeacherComponent {
  teacherData: NewTeacherData = {
    userName: '',
    email: '',
    password: '',
    age: 0,
    whatsAppNumber: '',
    nationalId: '',
    gender: '',
    residenceCountry: '',
    nationality: '',
    summary: '',
  };

  showPassword: boolean = false;
  isSubmitting: boolean = false;
  private apiUrl =
    'http://massarlearning.runasp.net/api/Teacher/admin-create-teacher';

  constructor(private http: HttpClient) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closeForm(): void {
    window.history.back();
  }

  onSubmit(): void {
    this.isSubmitting = true;

    if (!this.validateForm()) {
      this.isSubmitting = false;
      return;
    }

    // تجهيز البيانات بالشكل المطلوب من الـ API
    const requestBody = {
      userName: this.teacherData.userName,
      email: this.teacherData.email,
      password: this.teacherData.password,
      age: this.teacherData.age.toString(), // API يريد نص
      whatsAppNumber: this.teacherData.whatsAppNumber,
      nationalId: this.teacherData.nationalId,
      gender: this.teacherData.gender,
      residenceCountry: this.teacherData.residenceCountry,
      nationality: this.teacherData.nationality,
      summary: this.teacherData.summary,
    };

    console.log('Sending data:', requestBody);

    this.http.post(this.apiUrl, requestBody).subscribe({
      next: (response) => {
        Swal.fire({
          title: '✅ تم الإضافة بنجاح!',
          text: 'تم إضافة المعلم الجديد بنجاح',
          icon: 'success',
          confirmButtonColor: '#2d5a27',
          confirmButtonText: 'حسناً',
          background: '#f5f0e6',
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          this.closeForm();
        });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding teacher:', error);

        let errorMessage =
          'حدث خطأ أثناء إضافة المعلم. يرجى المحاولة مرة أخرى.';

        if (error.error?.errors) {
          // تجميع رسائل الخطأ
          const allErrors = [];
          for (const key in error.error.errors) {
            allErrors.push(...error.error.errors[key]);
          }
          errorMessage = allErrors.join(', ');
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }

        Swal.fire({
          title: 'خطأ!',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#2d5a27',
          confirmButtonText: 'حسناً',
          background: '#f5f0e6',
        });
        this.isSubmitting = false;
      },
    });
  }

  validateForm(): boolean {
    if (!this.teacherData.userName) {
      Swal.fire('تنبيه', 'يرجى إدخال اسم المستخدم', 'warning');
      return false;
    }
    if (!this.teacherData.email) {
      Swal.fire('تنبيه', 'يرجى إدخال البريد الإلكتروني', 'warning');
      return false;
    }
    if (!this.teacherData.password || this.teacherData.password.length < 6) {
      Swal.fire('تنبيه', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
      return false;
    }
    if (!this.teacherData.age || this.teacherData.age < 18) {
      Swal.fire('تنبيه', 'العمر يجب أن يكون 18 سنة على الأقل', 'warning');
      return false;
    }
    if (!this.teacherData.whatsAppNumber) {
      Swal.fire('تنبيه', 'يرجى إدخال رقم واتس آب', 'warning');
      return false;
    }
    if (
      !this.teacherData.nationalId ||
      this.teacherData.nationalId.length !== 14
    ) {
      Swal.fire('تنبيه', 'الرقم القومي يجب أن يكون 14 رقم', 'warning');
      return false;
    }
    if (!this.teacherData.gender) {
      Swal.fire('تنبيه', 'يرجى اختيار الجنس', 'warning');
      return false;
    }
    if (!this.teacherData.residenceCountry) {
      Swal.fire('تنبيه', 'يرجى إدخال دولة الإقامة', 'warning');
      return false;
    }
    if (!this.teacherData.nationality) {
      Swal.fire('تنبيه', 'يرجى إدخال الجنسية', 'warning');
      return false;
    }
    if (!this.teacherData.summary) {
      Swal.fire('تنبيه', 'يرجى إدخال نبذة عن المعلم', 'warning');
      return false;
    }
    return true;
  }
}
