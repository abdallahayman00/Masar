import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { StudentTracks, StudentTrack } from '../../core/interfaces/student-tracks';
import {
  DaySessions,
  Session,
  ProgressMarker,
  UpcomingSession,
  MonthlySession,
  WeekDay,
  TimeSlot,
} from '../../core/interfaces/student-sessions';
import { ArabicNumberPipe } from '../../core/pipes/arabic-number.pipe';

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
  imports: [CommonModule, ArabicNumberPipe],
  templateUrl: './track-details.component.html',
  styleUrl: './track-details.component.scss',
})
export class TrackDetailsComponent implements OnInit {
  allStudentTracks!: StudentTrack;
  currentTrack: StudentTracks | null = null;
  weeklySessionData!: DaySessions[];

  trackId!: number;
  studentId!: number;
  missedSessionsCount: number = 0;

  // Progress map
  progressMarkers: ProgressMarker[] = [];

  // Weekly calendar
  weekStartDate: Date = this.getWeekStart(new Date());
  weekDays: WeekDay[] = [];
  timeSlots: TimeSlot[] = [];
  private sessionMap = new Map<string, Session>();
  private trackSessionIds = new Set<number>();

  // Upcoming session (green card)
  upcomingSession: UpcomingSession | null | undefined = undefined;

  isLoading = true;

  // Error states
  tracksError = false;
  weeklyError = false;

  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('trackId');
    this.trackId = idParam ? +idParam : 0;

    this.trackSessionIds = new Set();
    this.upcomingSession = undefined;
    this.weekDays = [];
    this.timeSlots = [];
    this.sessionMap.clear();
    this.progressMarkers = [];
    this.weekStartDate = this.getWeekStart(new Date());

    this.getStudentTracks();
    this.loadTrackSessionIds();
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

  private loadTrackSessionIds(): void {
    const studentId = this.getStudentId();
    if (!studentId) return;

    this.studentService.getMonthlySessions(+studentId, this.trackId).subscribe({
      next: (res: MonthlySession[]) => {
        this.trackSessionIds = new Set(res.map((s) => s.sessionId));
        this.missedSessionsCount = res.filter((s) => s.status === 'Missed').length;

        const now = new Date();
        const upcomingMonthly = res
          .filter((s) => s.status === 'Upcoming' && new Date(s.sessionDate) >= now)
          .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())[0];

        if (upcomingMonthly) {
          const sessionWeekStart = this.getWeekStart(new Date(upcomingMonthly.sessionDate));
          const weekStartStr = `${sessionWeekStart.getFullYear()}-${String(sessionWeekStart.getMonth() + 1).padStart(2, '0')}-${String(sessionWeekStart.getDate()).padStart(2, '0')}`;

          this.studentService.getWeeklySessions(+studentId, weekStartStr).subscribe({
            next: (weekRes) => {
              const days: DaySessions[] = Array.isArray(weekRes?.days) ? weekRes.days : [];

              let found: Session | undefined;
              for (const day of days) {
                found = day.sessions.find(
                  (s) => s.sessionId === upcomingMonthly.sessionId
                );
                if (found) break;
              }

              if (found) {
                const [datePart] = found.sessionDate.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);

                this.upcomingSession = {
                  sessionId: found.sessionId,
                  date: localDate,
                  dayName: ARABIC_DAY_NAMES[localDate.getDay()],
                  dayNumber: localDate.getDate(),
                  monthName: ARABIC_MONTH_NAMES[localDate.getMonth()],
                  time: found.timeString,
                  durationMinutes: found.sessionMinutes || 50,
                  meetingLink: found.meetingLink ?? null,
                };
              } else {
                const [datePart] = upcomingMonthly.sessionDate.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);

                this.upcomingSession = {
                  sessionId: upcomingMonthly.sessionId,
                  date: localDate,
                  dayName: ARABIC_DAY_NAMES[localDate.getDay()],
                  dayNumber: localDate.getDate(),
                  monthName: ARABIC_MONTH_NAMES[localDate.getMonth()],
                  time: localDate.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }),
                  durationMinutes: 50,
                  meetingLink: null,
                };
              }

              this.getWeeklyStuSessions();
            },
            error: () => {
              const [datePart] = upcomingMonthly.sessionDate.split('T');
              const [year, month, day] = datePart.split('-').map(Number);
              const localDate = new Date(year, month - 1, day);

              this.upcomingSession = {
                sessionId: upcomingMonthly.sessionId,
                date: localDate,
                dayName: ARABIC_DAY_NAMES[localDate.getDay()],
                dayNumber: localDate.getDate(),
                monthName: ARABIC_MONTH_NAMES[localDate.getMonth()],
                time: localDate.toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }),
                durationMinutes: 50,
                meetingLink: null,
              };
              this.getWeeklyStuSessions();
            },
          });
        } else {
          this.upcomingSession = null;
          this.getWeeklyStuSessions();
        }
      },
      error: () => {
        this.upcomingSession = null;
        this.getWeeklyStuSessions();
      },
    });
  }

  getWeeklyStuSessions(): void {
    const studentId = this.getStudentId();
    if (!studentId) return;
    this.weeklyError = false;
    this.isLoading = true;

    const startDate = `${this.weekStartDate.getFullYear()}-${String(this.weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(this.weekStartDate.getDate()).padStart(2, '0')}`;

    this.studentService.getWeeklySessions(+studentId, startDate).subscribe({
      next: (res) => {
        const days: DaySessions[] = Array.isArray(res?.days) ? res.days : [];
        this.weeklySessionData = days;
        this.buildWeeklyCalendar(days);
        this.isLoading = false;
      },
      error: (err) => {
        const isEmptyWeek =
          (err?.status === 404 &&
            err?.error?.message?.toLowerCase().includes('no sessions')) ||
          err?.error?.message?.toLowerCase().includes('no sessions');

        if (isEmptyWeek) {
          this.buildWeeklyCalendar([]);
        } else {
          this.weeklyError = true;
          this.weekDays = [];
          this.timeSlots = [];
        }
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
  // Completion percentage & ring
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
  // Progress map
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
  // Weekly calendar
  // ============================================

  get weekMonthLabel(): string {
    const end = new Date(this.weekStartDate);
    end.setDate(end.getDate() + 6);

    const startMonth = ARABIC_MONTH_NAMES[this.weekStartDate.getMonth()];
    const endMonth = ARABIC_MONTH_NAMES[end.getMonth()];

    return startMonth === endMonth
      ? startMonth
      : `${startMonth} - ${endMonth}`;
  }

  goToNextWeek(): void {
    const next = new Date(this.weekStartDate);
    next.setDate(next.getDate() + 7);
    this.weekStartDate = next;
    this.getWeeklyStuSessions();
  }

  goToPrevWeek(): void {
    const prev = new Date(this.weekStartDate);
    prev.setDate(prev.getDate() - 7);
    this.weekStartDate = prev;
    this.getWeeklyStuSessions();
  }

  private buildWeeklyCalendar(days: DaySessions[]): void {
    // 1. فلتر الـ sessions بتاعت التراك ده بس
    const filteredDays = this.trackSessionIds.size > 0
      ? days.map((day) => ({
          ...day,
          sessions: day.sessions.filter((s) =>
            this.trackSessionIds.has(s.sessionId)
          ),
        }))
      : days;

    // 2. بناء الـ sessionMap
    this.sessionMap.clear();
    for (const day of filteredDays) {
      for (const session of day.sessions) {
        const dateStr = session.sessionDate.split('T')[0];
        const timeKey = this.extractTime(session.timeString);
        this.sessionMap.set(`${dateStr}|${timeKey}`, session);
      }
    }

    // 3. بناء الـ weekDays
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.weekStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      this.weekDays.push({
        dateStr,
        dayName: ARABIC_DAY_NAMES[d.getDay()],
        dayNumber: d.getDate(),
        isToday: d.getTime() === today.getTime(),
      });
    }

    // 4. بناء الـ timeSlots
    const timesSet = new Set<string>();
    for (const day of filteredDays) {
      for (const session of day.sessions) {
        timesSet.add(this.extractTime(session.timeString));
      }
    }

    this.timeSlots = Array.from(timesSet)
      .sort()
      .map((t) => ({ label: t, timeKey: t }));
  }

  getCellSession(dateStr: string, timeKey: string): Session | undefined {
    return this.sessionMap.get(`${dateStr}|${timeKey}`);
  }

  private extractTime(timeString: string): string {
    if (!timeString) return '00:00';

    const cleaned = timeString.replace(/\s*(AM|PM)\s*/i, '').trim();
    const isPM = /PM/i.test(timeString);
    const isAM = /AM/i.test(timeString);

    const parts = cleaned.split(':');
    if (parts.length >= 2) {
      let hour = parseInt(parts[0], 10);
      const minute = parts[1].padStart(2, '0');

      if (isAM && hour === 12) hour = 0;
      if (isPM && hour !== 12) hour += 12;

      return `${String(hour).padStart(2, '0')}:${minute}`;
    }
    return '00:00';
  }

  formatTimeArabic(timeKey: string): string {
  if (!timeKey) return '';

  const arabicNums: { [k: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
  };
  const toArabic = (n: string) =>
    n.split('').map((c) => arabicNums[c] ?? c).join('');

  const isPM = /PM/i.test(timeKey);
  const isAM = /AM/i.test(timeKey);
  const cleaned = timeKey.replace(/\s*(AM|PM)\s*/i, '').trim();
  const [hourStr, minuteStr] = cleaned.split(':');

  let hour = parseInt(hourStr, 10);
  const minute = (minuteStr || '00').substring(0, 2);

  // لو فيه AM/PM استخدمهم، لو مفيش اعتبره 24h
  if (isAM && hour === 12) hour = 0;
  if (isPM && hour !== 12) hour += 12;

  const period = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${toArabic(String(hour12))}:${toArabic(minute)} ${period}`;
}

  private getWeekStart(date: Date): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const d = new Date(year, month, day);

    const dayOfWeek = d.getDay();
    const diff = dayOfWeek === 6 ? 0 : -(dayOfWeek + 1);
    d.setDate(d.getDate() + diff);
    return d;
  }

  get hasUpcomingSession(): boolean {
    return this.upcomingSession !== null && this.upcomingSession !== undefined;
  }

  getSessionNumber(sessionId: number): number {
  const ids = Array.from(this.trackSessionIds).sort((a, b) => a - b);
  return ids.indexOf(sessionId) + 1;
}

  openLink(url: string): void {
    window.open(url, '_blank');
  }
}