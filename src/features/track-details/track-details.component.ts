import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { StudentTracks, StudentTrack } from '../../core/interfaces/student-tracks';
import {
  DaySessions,
  Session,
  MonthlySession,
  MonthlySessions,
  CalendarDayCell,
  ProgressMarker,
  UpcomingSession,
} from '../../core/interfaces/student-sessions';

const ARABIC_DAY_NAMES = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const ARABIC_MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

@Component({
  selector: 'app-track-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-details.component.html',
  styleUrl: './track-details.component.scss',
})
export class TrackDetailsComponent implements OnInit {
  allStudentTracks!: StudentTrack;
  currentTrack: StudentTracks | null = null;
  weeklySessionData!: DaySessions[];
  monthlySessions: MonthlySessions = [];

  trackId!: number;
  studentId!: number;

  // Calendar state
  viewedMonth = new Date().getMonth();
  viewedYear = new Date().getFullYear();
  calendarWeeks: CalendarDayCell[][] = [];

  // Progress map
  progressMarkers: ProgressMarker[] = [];

  // Upcoming session (green card)
  upcomingSession: UpcomingSession | null = null;

  isLoading = true;

  // Error states
  tracksError = false;
  calendarError = false;
  weeklyError = false;

  // Cache للشهور المحملة
  private sessionsCache = new Map<string, MonthlySessions>();

  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('trackId');
    this.trackId = idParam ? +idParam : 0;

    this.getStudentTracks();
    this.getMonthlySessions();
    this.getWeeklyStuSessions();
  }

  // ============================================
  // API calls
  // ============================================

  getStudentTracks(): void {
    const studentId = this.getStudentId();
    if (!studentId) return;
    this.tracksError = false;

    this.studentService.getStudentTracks(+studentId).subscribe({
      next: (res) => {
        this.allStudentTracks = res;
        this.currentTrack =
          res.find((track) => track.trackId === this.trackId) ?? null;

        if (this.currentTrack) {
          this.buildProgressMarkers(this.currentTrack);
        }
      },
      error: () => {
        this.tracksError = true;
      },
    });
  }

  getMonthlySessions(): void {
    const studentId = this.getStudentId();
    if (!studentId || !this.trackId) return;
    this.calendarError = false;

    const cacheKey = `${this.viewedYear}-${this.viewedMonth}`;

    if (this.sessionsCache.has(cacheKey)) {
      this.monthlySessions = this.sessionsCache.get(cacheKey)!;
      this.buildCalendar();
      return;
    }

    this.studentService.getMonthlySessions(+studentId, this.trackId).subscribe({
      next: (res) => {
        this.sessionsCache.set(cacheKey, res);
        this.monthlySessions = res;
        this.buildCalendar();
      },
      error: () => {
        this.calendarError = true;
      },
    });
  }

  getWeeklyStuSessions(): void {
    const studentId = this.getStudentId();
    if (!studentId) return;
    this.weeklyError = false;

    const startDate = new Date().toISOString().split('T')[0];

    this.studentService.getWeeklySessions(+studentId, startDate).subscribe({
      next: (res) => {
        this.weeklySessionData = res.days;
        this.upcomingSession = this.findUpcomingSession(res.days);
        this.isLoading = false;
      },
      error: () => {
        this.weeklyError = true;
        this.isLoading = false;
      },
    });
  }

  private getStudentId(): string | null {
    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');

    if (!studentId) {
      console.warn('لا يوجد studentId مخزن');
      return null;
    }
    return studentId;
  }

  // ============================================
  // Derived data: completion percentage
  // ============================================

  get completionPercentage(): number {
    if (!this.currentTrack || !this.currentTrack.totalSessions) return 0;
    return Math.round(
      (this.currentTrack.completedSessions / this.currentTrack.totalSessions) * 100
    );
  }

  readonly ringRadius = 80;
  readonly ringCircumference = 2 * Math.PI * this.ringRadius;

  get ringOffset(): number {
    const progress = this.completionPercentage / 100;
    return this.ringCircumference * (1 - progress);
  }

  // ============================================
  // Progress map (خريطة التقدم)
  // ============================================

  private buildProgressMarkers(track: StudentTracks): void {
    const total = track.totalSessions || 0;
    const completed = track.completedSessions || 0;

    const markers: ProgressMarker[] = [];
    for (let i = 1; i <= total; i++) {
      markers.push({ index: i, isCompleted: i <= completed });
    }
    this.progressMarkers = markers;
  }

  // ============================================
  // Monthly calendar (جدول التعلم)
  // ============================================

  get viewedMonthLabel(): string {
    return `${ARABIC_MONTH_NAMES[this.viewedMonth]} ${this.viewedYear}`;
  }

  goToPreviousMonth(): void {
    this.viewedMonth--;
    if (this.viewedMonth < 0) {
      this.viewedMonth = 11;
      this.viewedYear--;
    }
    this.getMonthlySessions();
  }

  goToNextMonth(): void {
    this.viewedMonth++;
    if (this.viewedMonth > 11) {
      this.viewedMonth = 0;
      this.viewedYear++;
    }
    this.getMonthlySessions();
  }

  private buildCalendar(): void {
    const daysInMonth = new Date(this.viewedYear, this.viewedMonth + 1, 0).getDate();
    const firstDayWeekday = new Date(this.viewedYear, this.viewedMonth, 1).getDay();

    const sessionsByDay = new Map<number, MonthlySession[]>();
    for (const session of this.monthlySessions) {
      const date = new Date(session.sessionDate);
      if (
        date.getFullYear() === this.viewedYear &&
        date.getMonth() === this.viewedMonth
      ) {
        const day = date.getDate();
        const existing = sessionsByDay.get(day) ?? [];
        existing.push(session);
        sessionsByDay.set(day, existing);
      }
    }

    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === this.viewedYear &&
      today.getMonth() === this.viewedMonth;

    const cells: CalendarDayCell[] = [];

    for (let i = 0; i < firstDayWeekday; i++) {
      cells.push({ dayNumber: 0, date: null, status: 'none', isToday: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = sessionsByDay.get(day);
      let status: CalendarDayCell['status'] = 'none';

      if (daySessions && daySessions.length) {
        if (daySessions.some((s) => s.status === 'Upcoming')) {
          status = 'upcoming';
        } else if (daySessions.some((s) => s.status === 'Missed')) {
          status = 'missed';
        } else if (daySessions.some((s) => s.status === 'Completed')) {
          status = 'completed';
        }
      }

      cells.push({
        dayNumber: day,
        date: new Date(this.viewedYear, this.viewedMonth, day),
        status,
        isToday: isCurrentMonth && today.getDate() === day,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ dayNumber: 0, date: null, status: 'none', isToday: false });
    }

    const weeks: CalendarDayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    this.calendarWeeks = weeks;
  }

  readonly weekDayHeaders = ARABIC_DAY_NAMES;

  // ============================================
  // Upcoming session (الكارت الأخضر)
  // ============================================

  private findUpcomingSession(days: DaySessions[]): UpcomingSession | null {
    const now = new Date();

    for (const day of days) {
      const sessions: Session[] = day.sessions;
      for (const session of sessions) {
        const sessionDate = new Date(session.sessionDate);
        if (session.status === 'Upcoming' && sessionDate >= now) {
          return {
            sessionId: session.sessionId,
            date: sessionDate,
            dayName: ARABIC_DAY_NAMES[sessionDate.getDay()],
            dayNumber: sessionDate.getDate(),
            monthName: ARABIC_MONTH_NAMES[sessionDate.getMonth()],
            time:
              session.timeString ||
              sessionDate.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
            durationMinutes: session.sessionMinutes || 50,
            meetingLink: session.meetingLink ?? null,
          };
        }
      }
    }
    return null;
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

  // ============================================
  // Navigation
  // ============================================

  navigateToTrack(track: StudentTracks): void {
    this.router.navigate(['track-details', track.trackId]);
  }
}