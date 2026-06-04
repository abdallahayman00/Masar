// students.component.ts - النسخة المعدلة مع الفلتر
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StudentService } from '../../../core/services/student.service';
import {
  AuthService,
  ChangePasswordRequest,
} from '../../../core/services/auth.service';
import { Student } from '../../../core/interfaces/student';
import { FilterParams } from '../../../core/interfaces/filter-params';
import { FilterSectionComponent } from '../../filter-section/filter-section.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FilterSectionComponent,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
  providers: [StudentService],
})
export class StudentsComponent implements OnInit {
  // ============= DATA PROPERTIES =============
  approvedStudents: Student[] = [];
  filteredStudents: Student[] = []; // للطلاب بعد الفلترة
  totalCount: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;

  isLoading: boolean = false;
  errorMessage: string = '';

  // Modal flags
  showModal: boolean = false;
  showPasswordModal: boolean = false;

  // Password change fields
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  isSaving: boolean = false;
  passwordError: string = '';

  selectedStudent: Student | null = null;
  passwordStudent: Student | null = null;

  // Current filters
  currentFilters: FilterParams = {};

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadApprovedStudents();
  }

  // ============= LOAD DATA FROM API =============
  // في students.component.ts
  loadApprovedStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // بناء كائن الفلاتر مع إزالة القيم الفارغة
    const apiFilters = Object.fromEntries(
      Object.entries({
        fullName: this.currentFilters.searchName,
        email: this.currentFilters.searchEmail,
        whatsApp: this.currentFilters.searchWhatsApp,
        gender: this.currentFilters.gender,
        minAge: this.currentFilters.minAge ?? undefined,
        maxAge: this.currentFilters.maxAge ?? undefined,
        sortOrder: this.currentFilters.sortOrder,
      }).filter(
        ([_, value]) => value !== null && value !== undefined && value !== '',
      ),
    ) as {
      fullName?: string;
      email?: string;
      whatsApp?: string;
      gender?: string;
      nationality?: string;
      minAge?: number;
      maxAge?: number;
      sortOrder?: string;
    };

    this.studentService
      .getAllStudentsDetailsPaged(this.currentPage, this.pageSize, apiFilters)
      .subscribe({
        next: (response) => {
          this.approvedStudents = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.pageSize = response.pageSize;

          this.filteredStudents = [...this.approvedStudents];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading students:', err);
          this.errorMessage = 'حدث خطأ في تحميل بيانات الطلاب';
          this.isLoading = false;
        },
      });
  }
  onFilterApplied(filters: FilterParams): void {
    this.currentFilters = filters;
    this.currentPage = 1; // إعادة تعيين للصفحة الأولى عند التصفية
    this.loadApprovedStudents(); // إعادة التحميل من السيرفر
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadApprovedStudents(); // تحميل الصفحة الجديدة من السيرفر
  }

  // إزالة applyFiltersLocally() بالكامل لأن الفلترة ستتم على السيرفر
  // ============= FILTER LOGIC =============

  applyFiltersLocally(): void {
    let filtered = [...this.approvedStudents];

    // Filter by name
    if (this.currentFilters.searchName) {
      const searchTerm = this.currentFilters.searchName.toLowerCase();
      filtered = filtered.filter((student) =>
        student.fullName.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by email
    if (this.currentFilters.searchEmail) {
      const searchTerm = this.currentFilters.searchEmail.toLowerCase();
      filtered = filtered.filter((student) =>
        student.email.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by WhatsApp
    if (this.currentFilters.searchWhatsApp) {
      const searchTerm = this.currentFilters.searchWhatsApp.toLowerCase();
      filtered = filtered.filter((student) =>
        student.whatsAppNumber?.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by gender
    if (this.currentFilters.gender) {
      filtered = filtered.filter(
        (student) => student.gender === this.currentFilters.gender,
      );
    }

    // Filter by min age
    if (this.currentFilters.minAge) {
      filtered = filtered.filter(
        (student) => Number(student.age) >= Number(this.currentFilters.minAge),
      );
    }

    // Filter by max age
    if (this.currentFilters.maxAge) {
      filtered = filtered.filter(
        (student) => Number(student.age) <= Number(this.currentFilters.maxAge),
      );
    }

    // Apply sorting
    if (this.currentFilters.sortOrder) {
      switch (this.currentFilters.sortOrder) {
        case 'name_asc':
          filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
          break;
        case 'name_desc':
          filtered.sort((a, b) => b.fullName.localeCompare(a.fullName));
          break;
        case 'age_asc':
          filtered.sort((a, b) => Number(a.age) - Number(b.age));
          break;
        case 'age_desc':
          filtered.sort((a, b) => Number(b.age) - Number(a.age));
          break;
      }
    }

    this.filteredStudents = filtered;
    this.totalCount = filtered.length;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
  }

  // ============= UTILITY METHODS =============

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#ef4444',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getAvatarTextColor(name: string): string {
    return '#ffffff';
  }

  // ============= PAGE NAVIGATION =============

  // Helper to get current page items
  getCurrentPageItems(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredStudents.slice(start, end);
  }

  // ============= CHANGE PASSWORD LOGIC =============

  saveNewPassword(): void {
    this.passwordError = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.passwordError = '❌ الرجاء إدخال كلمة المرور وتأكيدها';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = '❌ كلمة المرور الجديدة وتأكيدها غير متطابقين';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return;
    }

    if (!this.passwordStudent) {
      this.passwordError = '❌ لم يتم تحديد الطالب';
      return;
    }

    const userId = this.passwordStudent.studentId;

    if (!userId) {
      this.passwordError = '❌ لم يتم العثور على معرف المستخدم';
      return;
    }

    this.isSaving = true;

    const request: ChangePasswordRequest = {
      userId: Number(userId),
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    };

    this.authService.changePassword(request).subscribe({
      next: (response) => {
        console.log('✅ Password changed successfully:', response);
        this.isSaving = false;
        alert('✅ تم تغيير كلمة المرور بنجاح');
        this.closePasswordModal();
      },
      error: (err) => {
        console.error('❌ Error changing password:', err);
        this.isSaving = false;

        let errorMsg = '❌ حدث خطأ أثناء تغيير كلمة المرور';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.title) {
          errorMsg = err.error.title;
        }
        this.passwordError = errorMsg;
      },
    });
  }

  // ============= MODAL METHODS =============

  viewRequest(student: Student): void {
    console.log('View student details:', student);
    this.selectedStudent = student;
    this.showModal = true;
  }

  openChangePasswordModal(student: Student): void {
    console.log('🔓 Open change password modal for:', student);
    this.passwordStudent = student;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.showPassword = false;
    this.showPasswordModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedStudent = null;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordStudent = null;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.isSaving = false;
    this.showPassword = false;
  }
}
