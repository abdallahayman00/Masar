// weekly-schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WeeklyScheduleService,
  WeeklyScheduleResponse,
  DaySchedule,
  Session,
} from '../../core/services/weekly-schedule.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-weekly-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-schedule.component.html',
  styleUrl: './weekly-schedule.component.scss',
})
export class WeeklyScheduleComponent implements OnInit {
  scheduleData: WeeklyScheduleResponse | null = null;
  loading = false;
  error: string | null = null;

  // 🔥 لم نعد نستخدم قيمة ثابتة 36، بل نأخذها من AuthService
  teacherId: number | null = null;
  selectedDate = new Date().toISOString().split('T')[0];

  // ── Arabic month names ─────────────────────────────────────
  private readonly MONTHS = [
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

  /**
   * Map English day names (from API) → Arabic.
   * Keys are lowercase to handle any casing from the backend.
   */
  private readonly DAY_AR: Record<string, string> = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    // also support full Arabic if already returned
    السبت: 'السبت',
    الأحد: 'الأحد',
    الإثنين: 'الإثنين',
    الثلاثاء: 'الثلاثاء',
    الأربعاء: 'الأربعاء',
    الخميس: 'الخميس',
    الجمعة: 'الجمعة',
  };

  // ── Chip color cycle by time-slot index ───────────────────
  private readonly CHIP_COLORS = ['sage', 'sand', 'mist', 'lavender', 'blush'];

  /**
   * SVG icons per slot index.
   * Injected via [innerHTML] on .chip__icon.
   */
  private readonly CHIP_ICONS: string[] = [
    // sage — period 1: open book
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17">
       <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
       <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
     </svg>`,
    // sand — period 2: pencil
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17">
       <path d="M12 20h9"/>
       <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
     </svg>`,
    // mist — period 3: clock
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17">
       <circle cx="12" cy="12" r="10"/>
       <polyline points="12 6 12 12 16 14"/>
     </svg>`,
    // lavender — period 4: laptop
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17">
       <rect x="2" y="3" width="20" height="14" rx="2"/>
       <path d="M8 21h8M12 17v4"/>
     </svg>`,
    // blush — period 5: chalkboard
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17">
       <rect x="2" y="3" width="20" height="14" rx="1"/>
       <path d="M8 21l4-4 4 4"/>
     </svg>`,
  ];

  /** Legend items rendered below the board */
  readonly legendItems = [
    { color: '#5a8f72', label: 'فترة ١ — صباحية' },
    { color: '#b89a5a', label: 'فترة ٢ — ظهرية' },
    { color: '#5a8aaa', label: 'فترة ٣ — مسائية' },
    { color: '#7a6aaa', label: 'فترة ٤' },
    { color: '#aa6a7a', label: 'فترة ٥' },
  ];

  // ── Derived month label from selected date ─────────────────
  get currentMonthLabel(): string {
    const d = new Date(this.selectedDate);
    return this.MONTHS[d.getMonth()];
  }

  constructor(
    private scheduleService: WeeklyScheduleService,
    private authService: AuthService, // حقن AuthService
  ) {}

  ngOnInit(): void {
    // الحصول على رقم المعلم من AuthService
    this.teacherId = this.authService.getTeacherId();

    if (!this.teacherId) {
      this.error =
        '⚠️ لم يتم العثور على رقم المعلم. يرجى تسجيل الدخول مرة أخرى.';
      return;
    }

    this.loadSchedule();
  }

  // ── Data loading ───────────────────────────────────────────

  loadSchedule(): void {
    if (!this.teacherId) {
      this.error = 'رقم المعلم غير موجود.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.scheduleService
      .getWeeklySchedule(this.teacherId, this.selectedDate)
      .subscribe({
        next: (data) => {
          this.scheduleData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'تعذّر تحميل الجدول. يرجى المحاولة مرة أخرى.';
          this.loading = false;
          console.error(err);
        },
      });
  }

  /** أيام مرتبة: السبت أول، الأحد، الاثنين... الجمعة */
  get orderedDays() {
    if (!this.scheduleData) return [];
    const order = [6, 0, 1, 2, 3, 4, 5]; // السبت=6 أول
    return [...this.scheduleData.days].sort((a, b) => {
      const da = new Date(a.date).getDay();
      const db = new Date(b.date).getDay();
      return order.indexOf(da) - order.indexOf(db);
    });
  }

  // ── Week navigation ────────────────────────────────────────

  prevWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 7);
    this.selectedDate = d.toISOString().split('T')[0];
    this.loadSchedule();
  }

  nextWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 7);
    this.selectedDate = d.toISOString().split('T')[0];
    this.loadSchedule();
  }

  close(): void {
    // wire to your router / emit an event as needed
  }

  // ── Arabic day name ────────────────────────────────────────

  /**
   * Converts whatever dayName the API returns (English or Arabic)
   * into the correct Arabic label.
   * Falls back to the raw value if not found in the map.
   */
  getArabicDayName(rawDayName: string): string {
    return this.DAY_AR[rawDayName?.toLowerCase()] ?? rawDayName;
  }

  // ── Session helpers ────────────────────────────────────────

  getSessionForTimeAndDay(day: DaySchedule, time: string): Session | null {
    return day.sessions.find((s) => s.time === time) ?? null;
  }

  /**
   * Builds the CSS class string for a session chip.
   */
  getChipClasses(timeIndex: number, dateStr: string): string {
    const color = this.CHIP_COLORS[timeIndex % this.CHIP_COLORS.length];
    const classes: string[] = [`chip--${color}`];
    if (this.isToday(dateStr)) classes.push('chip--today');
    if (this.isCurrentSession(dateStr, '')) classes.push('chip--now');
    return classes.join(' ');
  }

  /**
   * Returns true when the slot is actively happening right now.
   */
  isCurrentSession(dateStr: string, slotTime: string): boolean {
    if (!this.isToday(dateStr) || !slotTime) return false;
    const [sh, sm] = slotTime.split(':').map(Number);
    const slotStart = sh * 60 + sm;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= slotStart && nowMins < slotStart + 45;
  }

  getChipIcon(timeIndex: number): string {
    return this.CHIP_ICONS[timeIndex % this.CHIP_ICONS.length];
  }

  // ── Date helpers ───────────────────────────────────────────

  isToday(dateStr: string): boolean {
    const today = new Date();
    const d = new Date(dateStr);
    return (
      today.getFullYear() === d.getFullYear() &&
      today.getMonth() === d.getMonth() &&
      today.getDate() === d.getDate()
    );
  }

  getDayNum(dateStr: string): number {
    return new Date(dateStr).getDate();
  }

  // ── Stats ──────────────────────────────────────────────────

  getTotalSessions(): number {
    return (
      this.scheduleData?.days.reduce((n, d) => n + d.sessions.length, 0) ?? 0
    );
  }

  getActiveDays(): number {
    return (
      this.scheduleData?.days.filter((d) => d.sessions.length > 0).length ?? 0
    );
  }

  getEstimatedHours(): number {
    return Math.round((this.getTotalSessions() * 45) / 60);
  }
}
