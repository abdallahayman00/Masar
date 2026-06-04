// teacher-requests.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2'; // <-- أضف هذا السطر لاستيراد SweetAlert

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
  selector: 'app-teacher-requests',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './teacher-requests.component.html',
  styleUrls: ['./teacher-requests.component.scss'],
})
export class TeacherRequestsComponent implements OnInit {
  pendingTeachers: Teacher[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentPage: number = 1;
  totalCount: number = 0;
  totalPages: number = 0;
  searchTerm: string = '';
  private apiUrl = 'https://masaar.runasp.net/api/Teacher/not-approved';

  // متغيرات المودال
  showModal: boolean = false;
  selectedTeacher: Teacher | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
    };

    if (this.searchTerm) {
      params.searchName = this.searchTerm;
    }

    this.http.get<ApiResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.pendingTeachers = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching teachers:', error);
        this.errorMessage =
          'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      },
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPendingRequests();
  }

  approveRequest(teacherId: number, teacherName: string): void {
    // 1. عرض رسالة تأكيد قبل الإرسال
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `هل تريد قبول المعلم "${teacherName}"؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2d5a27',
      cancelButtonColor: '#b8860b',
      confirmButtonText: 'نعم، قبول',
      cancelButtonText: 'إلغاء',
      background: '#f5f0e6',
      customClass: {
        popup: 'swal-quran',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // 2. إرسال طلب الموافقة إلى الـ API الصحيح
        this.http
          .post(
            `https://masaar.runasp.net/api/Teacher/TeacherApproved/${teacherId}`,
            {},
            {
              responseType: 'text', // لأن الـ API يرجع نص عادي
            },
          )
          .subscribe({
            next: (response) => {
              // 3. عرض رسالة نجاح مع اسم المعلم
              Swal.fire({
                title: '✅ تم القبول!',
                text: `تم قبول المعلم "${teacherName}" بنجاح`,
                icon: 'success',
                confirmButtonColor: '#2d5a27',
                confirmButtonText: 'حسناً',
                background: '#f5f0e6',
                timer: 3000,
                timerProgressBar: true,
              });

              // 4. إزالة المعلم من القائمة المحلية
              this.pendingTeachers = this.pendingTeachers.filter(
                (t) => t.teacherId !== teacherId,
              );
              this.totalCount--;
            },
            error: (error) => {
              console.error('Error approving teacher:', error);
              // 5. عرض رسالة خطأ
              Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء قبول الطلب. يرجى المحاولة مرة أخرى.',
                icon: 'error',
                confirmButtonColor: '#2d5a27',
                confirmButtonText: 'حسناً',
                background: '#f5f0e6',
              });
            },
          });
      }
    });
  }

  rejectRequest(teacherId: number): void {
    this.http
      .post(`https://masaar.runasp.net/api/Teacher/${teacherId}/reject`, {})
      .subscribe({
        next: () => {
          this.pendingTeachers = this.pendingTeachers.filter(
            (t) => t.teacherId !== teacherId,
          );
          this.totalCount--;
        },
        error: (error) => {
          console.error('Error rejecting teacher:', error);
        },
      });
  }

  // فتح المودال وعرض بيانات المعلم
  viewRequest(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.showModal = true;
    document.body.classList.add('modal-open'); // 👈 أضف هذا السطر
  }

  // إغلاق المودال
  closeModal(): void {
    this.showModal = false;
    this.selectedTeacher = null;
    document.body.classList.remove('modal-open'); // 👈 أضف هذا السطر
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
