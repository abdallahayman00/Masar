// pending-batches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { PendingBatchesService } from '../../../../core/services/pending-batches.service';
import {
  PendingBatch,
  PagedResponse,
} from '../../../../core/interfaces/pending-batches';

@Component({
  selector: 'app-pending-batches',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [PendingBatchesService],
  templateUrl: './pending-batches.component.html',
  styleUrls: [],
})
export class PendingBatchesComponent implements OnInit {
  pendingBatches: PendingBatch[] = [];
  totalCount: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  searchTerm: string = '';

  constructor(private batchesService: PendingBatchesService) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.batchesService
      .getWaitingBookings(this.currentPage, this.searchTerm)
      .subscribe({
        next: (response: PagedResponse) => {
          this.pendingBatches = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.isLoading = false;
          console.log('✅ البيانات:', response);
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ في تحميل البيانات';
          this.isLoading = false;
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'حدث خطأ في تحميل البيانات',
            confirmButtonText: 'حاول مرة أخرى',
            confirmButtonColor: '#dc2626',
          });
        },
      });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadBatches();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadBatches();
  }

  // ✅ دالة القبول - نستخدم bookingId
  approveBatch(batch: PendingBatch): void {
    Swal.fire({
      title: 'تأكيد القبول',
      html: `هل أنت متأكد من قبول دفعة الطالب <strong>${batch.studentName}</strong>؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، قبول',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.processApproval(batch.bookingId, batch.studentName);
      }
    });
  }

  // معالجة القبول
  private processApproval(bookingId: number, studentName: string): void {
    Swal.fire({
      title: 'جاري المعالجة...',
      text: 'يرجى الانتظار',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // pending-batches.component.ts (داخل processApproval)

    this.batchesService.confirmPayment(bookingId).subscribe({
      next: (response: string) => {
        // <--- تغيير any إلى string
        // الرد النصي قد يكون "Booking confirmed successfully"
        console.log('رد الخادم:', response);

        Swal.fire({
          icon: 'success',
          title: 'تم القبول بنجاح',
          text: `تم قبول دفعة الطالب ${studentName}`,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
        this.loadBatches();
      },
      error: (err) => {
        // قد يظل يدخل到这里 إذا حدث خطأ حقيقي (مثل 404 أو 500)
        console.error(err);
        let errorMessage = 'حدث خطأ أثناء قبول الدفعة';

        // محاولة استخراج رسالة الخطأ من الرد النصي إن وجدت
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.status === 400) {
          errorMessage = 'الدفعة غير موجودة أو تم معالجتها مسبقاً';
        } else if (err.status === 404) {
          errorMessage = 'الدفعة غير موجودة';
        }

        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: errorMessage,
          confirmButtonText: 'حاول مرة أخرى',
          confirmButtonColor: '#dc2626',
        });
      },
    });
  }

  // ✅ دالة عرض التفاصيل
  viewBatch(batch: PendingBatch): void {
    const daysText = `${batch.firstDay} - ${batch.secondDay}`;
    const date = new Date(batch.createdAt);
    const formattedDate = date.toLocaleDateString('ar-EG');

    Swal.fire({
      title: '📋 تفاصيل الدفعة',
      html: `
        <div style="text-align: right; direction: rtl;">
          <table style="width: 100%; text-align: right; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold; width: 40%;">رقم الحجز:</td>
              <td style="padding: 8px;">${batch.bookingId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">اسم الطالب:</td>
              <td style="padding: 8px;">${batch.studentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">اسم المعلم:</td>
              <td style="padding: 8px;">${batch.teacherName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">اسم المسار:</td>
              <td style="padding: 8px;">${batch.trackName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">الأيام:</td>
              <td style="padding: 8px;">${daysText}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">الوقت:</td>
              <td style="padding: 8px;">${batch.time}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">الحالة:</td>
              <td style="padding: 8px;">
                <span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                  ${batch.bookingStatus === 'Waiting' ? 'قيد المراجعة' : batch.bookingStatus}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">تاريخ الطلب:</td>
              <td style="padding: 8px;">${formattedDate}</td>
            </tr>
          </table>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'إغلاق',
      confirmButtonColor: '#3b82f6',
      width: '500px',
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#e5e7eb';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 85%)`;
  }

  getAvatarTextColor(name: string): string {
    if (!name) return '#4b5563';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 80%, 25%)`;
  }
}
