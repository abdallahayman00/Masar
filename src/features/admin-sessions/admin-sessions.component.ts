import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionsService } from '../../core/services/sessions.service';
import {
  SessionAdminItem,
  SessionAdminFilterParams,
} from '../../core/interfaces/session-admin';
import { FilterSectionComponent } from '../filter-section/filter-section.component';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSectionComponent],
  templateUrl: './admin-sessions.component.html',
  styleUrls: ['./admin-sessions.component.scss'],
})
export class AdminSessionsComponent implements OnInit {
  sessions: SessionAdminItem[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  filterParams: SessionAdminFilterParams = {};

  constructor(private sessionsService: SessionsService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.sessionsService
      .getAllSessionsForAdmin(
        this.currentPage,
        this.pageSize,
        this.filterParams,
      )
      .subscribe({
        next: (response) => {
          this.sessions = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading sessions:', err);
          this.errorMessage =
            'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة مرة أخرى.';
          this.isLoading = false;
        },
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSessions();
  }

  onFilterApplied(filters: any): void {
    this.filterParams = {
      teacherName: filters.teacherName || undefined,
      studentName: filters.studentName || undefined,
      trackName: filters.trackName || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    };
    this.currentPage = 1;
    this.loadSessions();
  }

  // دالة مساعدة للتحقق من اكتمال الجلسة (مع مراعاة القيم المختلفة)
  isSessionCompleted(session: SessionAdminItem): boolean {
    // إذا كان الحقل موجوداً وقيمته true
    return session.isCompleted === true;
  }

  getStatusClass(session: SessionAdminItem): string {
    if (session.isCompleted) return 'status-completed';
    if (session.isStudentAttended && session.isTeachertAttended)
      return 'status-attended';
    return 'status-pending';
  }

  getStatusText(session: SessionAdminItem): string {
    if (session.isCompleted) return 'مكتملة';
    if (session.isStudentAttended && session.isTeachertAttended)
      return 'تم الحضور';
    return 'قيد الانتظار';
  }

  getArabicDay(day: string): string {
    const daysMap: Record<string, string> = {
      Sunday: 'الأحد',
      Monday: 'الإثنين',
      Tuesday: 'الثلاثاء',
      Wednesday: 'الأربعاء',
      Thursday: 'الخميس',
      Friday: 'الجمعة',
      Saturday: 'السبت',
    };
    return daysMap[day] || day;
  }
}
