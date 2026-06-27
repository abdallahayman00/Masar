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

  isLoading: boolean = false
  errorMessage: string = ''
  dailyCount: number = 0
  weeklyCount: number = 0
  dailySessionsData!: DailySessions[]
  weeklySessionData!:  DaySessions[]

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
    this.isLoading = true
     this.studentServices.getDailySessions(+studentId, today).subscribe({
      next: (res) =>{
        this.dailySessionsData = res
        this.isLoading = false;
        this.dailyCount = res.length
      },
      error: (err) => {
        this.errorMessage =
          'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة لاحقاً.';
        this.isLoading = false;
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
    this.isLoading = true
    this.studentServices.getWeeklySessions(+studentId, startDate).subscribe({
      next: (res) =>{
        this.weeklySessionData = res.days
        this.isLoading = false;
        this.weeklyCount = res.days.length
      },
      error: (err) => {
        this.errorMessage =
          'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة لاحقاً.';
        this.isLoading = false;
      },
    })
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