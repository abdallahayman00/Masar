// teacher-sessions.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service ';
import { ToastService } from '../../../core/services/toast.service';
import {
  Session,
  SessionStatusEnum,
} from '../../../core/interfaces/session.interface';

@Component({
  selector: 'app-teacher-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-sessions.component.html',
  styleUrls: ['./teacher-sessions.component.scss'],
})
export class TeacherSessionsComponent implements OnInit {
  // جميع الجلسات من الـ API
  allSessions: Session[] = [];
  // الجلسات بعد الفلترة حسب الحالة
  filteredSessions: Session[] = [];

  isLoading = false;
  errorMessage = '';

  // الفلترة
  selectedStatus: string = 'all';
  statusTabs = [
    { label: 'الكل', value: 'all', icon: 'fas fa-chart-simple' },
    {
      label: 'قادمة',
      value: SessionStatusEnum.Upcoming,
      icon: 'fas fa-calendar-week',
    },
    {
      label: 'مكتملة',
      value: SessionStatusEnum.Completed,
      icon: 'fas fa-circle-check',
    },
    {
      label: 'غياب',
      value: SessionStatusEnum.Missed,
      icon: 'fas fa-user-slash',
    },
    {
      label: 'جارية الآن',
      value: SessionStatusEnum.Ongoing,
      icon: 'fas fa-clock',
    },
  ];

  // modal عرض التفاصيل
  showModal = false;
  selectedSession: Session | null = null;

  // modal إضافة رابط اللقاء
  showLinkModal = false;
  selectedSessionForLink: Session | null = null;
  newMeetingLink = '';
  isSavingLink = false;
  linkError = '';

  constructor(
    private sessionService: SessionService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    const teacherId = localStorage.getItem('teacherId');
    if (!teacherId) {
      this.errorMessage =
        'لم يتم العثور على معرف المعلم. يرجى تسجيل الدخول مرة أخرى.';
      return;
    }

    this.isLoading = true;
    this.sessionService.getTeacherSessionsForToday(+teacherId).subscribe({
      next: (sessions) => {
        this.allSessions = sessions;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('خطأ في تحميل الجلسات:', err);
        this.errorMessage =
          'حدث خطأ أثناء تحميل الجلسات. يرجى المحاولة لاحقاً.';
        this.isLoading = false;
      },
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedStatus === 'all') {
      this.filteredSessions = [...this.allSessions];
    } else {
      this.filteredSessions = this.allSessions.filter(
        (s) => s.sessionStatus === this.selectedStatus,
      );
    }
  }

  getStatusCount(statusValue: string): number {
    if (statusValue === 'all') return this.allSessions.length;
    return this.allSessions.filter((s) => s.sessionStatus === statusValue)
      .length;
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

  // ============================================================
  // CHECK IF SESSION CAN HAVE LINK
  // ============================================================
  canAddLink(session: Session): boolean {
    // الحالات التي لا يمكن إضافة رابط لها
    const blockedStatuses = [
      SessionStatusEnum.Completed,
      SessionStatusEnum.Missed,
    ];
    return !blockedStatuses.includes(
      session.sessionStatus as SessionStatusEnum,
    );
  }

  getLinkButtonTooltip(session: Session): string {
    const status = session.sessionStatus;
    switch (status) {
      case SessionStatusEnum.Completed:
        return 'لا يمكن إضافة رابط لجلسة مكتملة';
      case SessionStatusEnum.Missed:
        return 'لا يمكن إضافة رابط لجلسة غياب';
      default:
        return 'إضافة رابط الاجتماع';
    }
  }

  viewSessionDetails(session: Session): void {
    this.selectedSession = session;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSession = null;
  }

  openAddLinkModal(session: Session): void {
    // التحقق من إمكانية إضافة رابط
    if (!this.canAddLink(session)) {
      const statusText = this.getStatusText(session.sessionStatus);
      this.toastService.warning(
        `لا يمكن إضافة رابط لجلسة ${statusText}`,
        'تنبيه',
      );
      return;
    }

    this.selectedSessionForLink = session;
    this.newMeetingLink = session.sessionMeetLink || '';
    this.linkError = '';
    this.showLinkModal = true;
  }

  closeLinkModal(): void {
    this.showLinkModal = false;
    this.selectedSessionForLink = null;
    this.newMeetingLink = '';
    this.isSavingLink = false;
    this.linkError = '';
  }

  submitMeetingLink(): void {
    if (!this.selectedSessionForLink) return;

    // التحقق الإضافي قبل الحفظ
    if (!this.canAddLink(this.selectedSessionForLink)) {
      const statusText = this.getStatusText(
        this.selectedSessionForLink.sessionStatus,
      );
      this.toastService.error(`لا يمكن إضافة رابط لجلسة ${statusText}`, 'خطأ');
      this.closeLinkModal();
      return;
    }

    if (!this.newMeetingLink.trim()) {
      this.linkError = 'الرجاء إدخال رابط صالح';
      return;
    }

    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(this.newMeetingLink)) {
      this.linkError = 'الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://';
      return;
    }

    this.isSavingLink = true;
    this.sessionService
      .addMeetingLink(
        this.selectedSessionForLink.sessionId,
        this.newMeetingLink,
      )
      .subscribe({
        next: (response) => {
          // البحث عن الجلسة في allSessions وتحديثها مباشرة
          const sessionToUpdate = this.allSessions.find(
            (s) => s.sessionId === this.selectedSessionForLink!.sessionId,
          );
          if (sessionToUpdate) {
            sessionToUpdate.sessionMeetLink = this.newMeetingLink;
          }

          // البحث في filteredSessions وتحديثها
          const filteredSessionToUpdate = this.filteredSessions.find(
            (s) => s.sessionId === this.selectedSessionForLink!.sessionId,
          );
          if (filteredSessionToUpdate) {
            filteredSessionToUpdate.sessionMeetLink = this.newMeetingLink;
          }

          // تحديث selectedSession إذا كان نفس الجلسة
          if (
            this.selectedSession?.sessionId ===
            this.selectedSessionForLink!.sessionId
          ) {
            this.selectedSession.sessionMeetLink = this.newMeetingLink;
          }

          // إعادة تعيين المصفوفات لضمان تحديث view
          this.allSessions = [...this.allSessions];
          this.filteredSessions = [...this.filteredSessions];
          this.toastService.success('تم حفظ رابط الاجتماع بنجاح');

          this.closeLinkModal();
        },
        error: (err) => {
          console.error('خطأ في إضافة الرابط:', err);
          this.linkError = 'حدث خطأ أثناء حفظ الرابط. يرجى المحاولة لاحقاً.';
          this.isSavingLink = false;
        },
      });
  }

  get totalSessionsCount(): number {
    return this.allSessions.length;
  }
}
