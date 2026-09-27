import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DailySessions, DaySessions, Session, SessionStatusEnum } from '../../../core/interfaces/student-sessions';
import { StudentService } from '../../../core/services/student.service';
import { ArabicNumberPipe } from '../../../core/pipes/arabic-number.pipe';

@Component({
  selector: 'app-student-sessions',
  imports: [CommonModule, ArabicNumberPipe],
  templateUrl: './student-sessions.component.html',
  styleUrl: './student-sessions.component.scss'
})
export class StudentSessionsComponent implements OnInit {

  isDailyLoading: boolean = false
  isWeeklyLoading: boolean = false
  dailyError: string = ''
  weeklyError: string = ''
  dailyCount: number = 0
  weeklyCount: number = 0
  dailySessionsData: DailySessions[] = []
  weeklySessionData: DaySessions[] = []

  private readonly studentServices = inject (StudentService)

  ngOnInit(): void {
    this.getDailySessions()
    this.getWeeklySessions()
  }

  selectedPeriod: 'daily' | 'weekly' = 'daily';

  filterByPeriod(period: 'daily' | 'weekly') {
  this.selectedPeriod = period;
}

   private getDailySessions() {
    const today = new Date().toISOString().split('T')[0];
    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('لا يوجد studentId مخزن');
      return;
    }
    this.isDailyLoading = true
    this.dailyError = ''
     this.studentServices.getDailySessions(+studentId, today).subscribe({
      next: (res) =>{
        this.dailySessionsData = res
        this.isDailyLoading = false;
        this.dailyCount = res.length
      },
      error: (err) => {
        if (this.isNoSessionsError(err)) {
          this.dailySessionsData = [];
          this.dailyCount = 0;
        } else {
          this.dailyError =
            'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة لاحقاً.';
        }
        this.isDailyLoading = false;
      },
    })
  }

  private getWeeklySessions() {
    const startDate = new Date().toISOString().split('T')[0];
    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('لا يوجد studentId مخزن');
      return;
    }
    this.isWeeklyLoading = true
    this.weeklyError = ''
    this.studentServices.getWeeklySessions(+studentId, startDate).subscribe({
      next: (res) =>{
        this.weeklySessionData = res.days
        this.isWeeklyLoading = false;
        this.weeklyCount = res.days.length
      },
      error: (err) => {
        if (this.isNoSessionsError(err)) {
          this.weeklySessionData = [];
          this.weeklyCount = 0;
        } else {
          this.weeklyError =
            'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة لاحقاً.';
        }
        this.isWeeklyLoading = false;
      },
    })
  }

  // الـ API بيرجع 404 مع رسالة "No sessions found" لما مفيش جلسات — ده مش خطأ، ده حالة فاضية
  private isNoSessionsError(err: any): boolean {
    return (
      err?.status === 404 ||
      err?.error?.message?.toLowerCase().includes('no sessions')
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case SessionStatusEnum.Upcoming:
        return 'status-badge--upcoming';
      case SessionStatusEnum.Completed:
        return 'status-badge--completed';
      case SessionStatusEnum.Missed:
        return 'status-badge--missed';
      case SessionStatusEnum.Ongoing:
        return 'status-badge--ongoing';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case SessionStatusEnum.Upcoming:
        return 'قادمة';
      case SessionStatusEnum.Completed:
        return 'مكتملة';
      case SessionStatusEnum.Missed:
        return 'غياب ومنتهية';
      case SessionStatusEnum.Ongoing:
        return 'جارية الآن';
      default:
        return status;
    }
  }

  formatTimeArabic(time: string): string {
    if (!time) return '';
    return time
      .replace(/AM/i, 'صباحاً')
      .replace(/PM/i, 'مساءً');
  }

}