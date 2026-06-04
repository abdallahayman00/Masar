// approved-teachers.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  AuthService,
  ChangePasswordRequest,
} from '../../../core/services/auth.service';
import { FilterParams } from '../../../core/interfaces/filter-params';
import { FilterSectionComponent } from '../../filter-section/filter-section.component';

export interface Teacher {
  teacherId: number;
  userId: number;
  fullName: string;
  email: string;
  whatsAppNumber: string;
  gender: string;
  age: string | number;
  nationality: string;
  summary: string;
  profileImagePath: string | null;
  isApproved: boolean;
}

export interface ApiResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Teacher[];
}

@Component({
  selector: 'app-approved-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSectionComponent],
  templateUrl: './approved-teachers.component.html',
  styleUrls: ['./approved-teachers.component.scss'],
})
export class ApprovedTeachersComponent implements OnInit {
  approvedTeachers: Teacher[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;
  private apiUrl = 'https://masaar.runasp.net/api/Teacher/approved';

  // ✅ متغيرات الفلترة
  currentFilters: FilterParams = {};

  // متغيرات المودال
  showModal: boolean = false;
  selectedTeacher: Teacher | null = null;

  // متغيرات مودال تغيير كلمة المرور
  showPasswordModal: boolean = false;
  passwordTeacher: Teacher | null = null;
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  passwordError: string = '';
  isSaving: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadApprovedTeachers();
  }

  // ✅ تحديث دالة loadApprovedTeachers لتدعم الفلاتر
  loadApprovedTeachers(filters?: FilterParams): void {
    this.isLoading = true;
    this.errorMessage = '';

    // حفظ الفلاتر الحالية
    if (filters) {
      this.currentFilters = filters;
    }

    const params: any = {
      page: this.currentPage,
    };

    // إضافة جميع الفلاتر الموجودة
    if (this.currentFilters.searchName) {
      params.searchName = this.currentFilters.searchName;
    }
    if (this.currentFilters.searchEmail) {
      params.searchEmail = this.currentFilters.searchEmail;
    }
    if (this.currentFilters.searchWhatsApp) {
      params.searchWhatsApp = this.currentFilters.searchWhatsApp;
    }
    if (this.currentFilters.gender) {
      params.gender = this.currentFilters.gender;
    }
    if (this.currentFilters.minAge) {
      params.minAge = this.currentFilters.minAge;
    }
    if (this.currentFilters.maxAge) {
      params.maxAge = this.currentFilters.maxAge;
    }
    if (this.currentFilters.sortOrder) {
      params.sortOrder = this.currentFilters.sortOrder;
    }

    this.http.get<ApiResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.approvedTeachers = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching approved teachers:', error);
        this.errorMessage =
          'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      },
    });
  }

  // ✅ معالج تطبيق الفلتر
  onFilterApplied(filters: FilterParams): void {
    this.currentPage = 1; // إعادة تعيين إلى الصفحة الأولى
    this.loadApprovedTeachers(filters);
  }

  // ✅ إزالة دالة onSearch القديمة لأن الفلتر سيتولى البحث
  // يمكنك الاحتفاظ بها إذا أردت استخدام البحث السريع مع الفلتر

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadApprovedTeachers(); // إعادة التحميل بنفس الفلاتر
  }

  // فتح المودال وعرض بيانات المعلم
  viewRequest(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.showModal = true;
    document.body.classList.add('modal-open');
  }

  // إغلاق المودال
  closeModal(): void {
    this.showModal = false;
    this.selectedTeacher = null;
    document.body.classList.remove('modal-open');
  }

  // فتح مودال تغيير كلمة المرور
  openChangePasswordModal(teacher: Teacher): void {
    this.passwordTeacher = teacher;
    this.showPasswordModal = true;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    document.body.classList.add('modal-open');
  }

  // إغلاق مودال تغيير كلمة المرور
  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordTeacher = null;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    document.body.classList.remove('modal-open');
  }

  // حفظ كلمة المرور الجديدة
  saveNewPassword(): void {
    this.passwordError = '';

    if (!this.newPassword) {
      this.passwordError = 'يرجى إدخال كلمة المرور الجديدة';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'كلمة المرور وتأكيدها غير متطابقتين';
      return;
    }

    if (!this.passwordTeacher) {
      this.passwordError = 'حدث خطأ في بيانات المعلم';
      return;
    }

    this.isSaving = true;

    const changePasswordRequest: ChangePasswordRequest = {
      userId: this.passwordTeacher.userId,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    };

    this.authService.changePassword(changePasswordRequest).subscribe({
      next: (response) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: `تم تغيير كلمة المرور للمعلم ${this.passwordTeacher?.fullName} بنجاح`,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#10b981',
          timer: 3000,
          timerProgressBar: true,
        });

        this.closePasswordModal();
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error changing password:', error);

        let errorText = 'حدث خطأ أثناء تغيير كلمة المرور';

        if (error.status === 401) {
          errorText =
            'غير مصرح لك بتغيير كلمة المرور. يرجى تسجيل الدخول مرة أخرى';
        } else if (error.error?.message) {
          errorText = error.error.message;
        } else if (error.error?.errors) {
          errorText = Object.values(error.error.errors).join(', ');
        }

        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: errorText,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#ef4444',
        });
      },
    });
  }

  // دالة التوجيه إلى صفحة إضافة معلم جديد
  goToAddTeacher(): void {
    this.router.navigate(['/add-teacher']);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.charAt(0);
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #d4f0e3, #b0e5cb)',
      'linear-gradient(135deg, #fdf8e6, #f5ebb3)',
      'linear-gradient(135deg, #fee2e2, #fecaca)',
      'linear-gradient(135deg, #ede9fe, #ddd6fe)',
      'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    ];
    const index = name.length % colors.length;
    return colors[index];
  }

  getAvatarTextColor(name: string): string {
    const colors = ['#1f6040', '#7a6008', '#991b1b', '#5b21b6', '#065f46'];
    const index = name.length % colors.length;
    return colors[index];
  }
}
