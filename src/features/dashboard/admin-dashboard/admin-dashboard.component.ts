// dashboard.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';

// ------------------------- Interfaces -------------------------
export interface MonthlyStats {
  month: string;
  studentsCount: number;
  teachersCount: number;
  bookingsCount: number;
  tracksCount: number;
}

export interface InsightItem {
  icon: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'neutral';
}

export interface TimelineEvent {
  label: string;
  value: string;
  icon: string;
  time: string;
}

declare const Chart: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // ---------- State ----------
  isLoading = true;
  hasError = false;
  errorMessage = '';

  stats: MonthlyStats = {
    month: '',
    studentsCount: 0,
    teachersCount: 0,
    bookingsCount: 0,
    tracksCount: 0,
  };

  // ---------- Filter State ----------
  selectedYear: number;
  selectedMonth: number;
  years: number[] = [];
  months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
  ];

  // ---------- Derived State ----------
  greeting = '';
  hijriDate = '';
  gregorianDate = '';
  currentMonthName = '';
  humanSummary = '';
  storyText = '';
  healthScore = 0;
  insights: InsightItem[] = [];
  timeline: TimelineEvent[] = [];
  lastUpdated = '';

  // ---------- Charts ----------
  private charts: Record<string, any> = {};
  private destroy$ = new Subject<void>();
  private animationFrames: number[] = [];

  // ---------- API (Direct URL without proxy) ----------
  private readonly API_BASE =
    'http://massarlearning.runasp.net/api/Account/GetMonthlyStats';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 5; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.setGreeting();
    this.setDates();
    this.fetchStats();
  }

  ngAfterViewInit(): void {
    this.initScrollReveal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.animationFrames.forEach((id) => cancelAnimationFrame(id));
    Object.values(this.charts).forEach((c) => c?.destroy?.());
  }

  // ---------- Greeting & Dates ----------
  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) this.greeting = 'صباح النور والبركة 🌅';
    else if (hour >= 12 && hour < 17) this.greeting = 'طاب مساؤكم 🌿';
    else if (hour >= 17 && hour < 21) this.greeting = 'مساء الخير والإيمان 🌙';
    else this.greeting = 'ليلة مباركة هادئة ✨';
  }

  private setDates(): void {
    const now = new Date();
    this.hijriDate = now.toLocaleDateString('ar-SA-u-ca-islamic', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    this.gregorianDate = now.toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const monthObj = this.months.find((m) => m.value === this.selectedMonth);
    this.currentMonthName = monthObj?.label ?? '';
  }

  // ---------- API Fetch (Direct URL) ----------
  fetchStats(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const url = `${this.API_BASE}?year=${this.selectedYear}&month=${this.selectedMonth}`;

    this.http
      .get<MonthlyStats>(url)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('❌ API Error:', err);
          this.hasError = true;
          if (err.status === 0) {
            this.errorMessage =
              'خطأ في الشبكة أو CORS. تأكد من أن الخادوم يسمح بـ CORS أو استخدم إضافة متصفح لتجاوزها.';
          } else if (err.status === 404) {
            this.errorMessage = 'الـ API غير موجود. تأكد من المسار الصحيح.';
          } else {
            this.errorMessage = `حدث خطأ: ${err.message || 'غير معروف'}`;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.stats = data;
            this.lastUpdated = new Date().toLocaleTimeString('ar-EG');
            const monthObj = this.months.find(
              (m) => m.value === this.selectedMonth,
            );
            this.currentMonthName = monthObj?.label ?? '';
            this.buildDerivedState();
            this.cdr.markForCheck();

            setTimeout(() => {
              this.destroyCharts();
              this.initCharts();
              this.animateCounters();
              this.buildTimeline();
              this.cdr.markForCheck();
            }, 60);
          }
          this.isLoading = false;
        },
      });
  }

  onFilterChange(): void {
    const monthObj = this.months.find((m) => m.value === this.selectedMonth);
    this.currentMonthName = monthObj?.label ?? '';
    this.fetchStats();
  }

  // ---------- Build Derived State ----------
  private buildDerivedState(): void {
    const { studentsCount, teachersCount, bookingsCount, tracksCount } =
      this.stats;
    const monthName = this.currentMonthName;
    const total = studentsCount + teachersCount + bookingsCount + tracksCount;

    this.humanSummary = `خلال شهر ${monthName} تم تسجيل ${studentsCount} طالبًا و${teachersCount} معلمًا و${bookingsCount} حجزًا عبر ${tracksCount} مسارات تعليمية.`;

    if (total === 0) {
      this.storyText = `لم يُسجَّل أي نشاط خلال شهر ${monthName} — ابدأ بإضافة طلاب ومعلمين لإحياء المنصة.`;
    } else if (tracksCount > 0 && bookingsCount === 0) {
      this.storyText = `شهد ${monthName} تفعيلاً لـ ${tracksCount} مسارات تعليمية بينما لا تزال الحجوزات في انتظار الانطلاق — فرصة واعدة.`;
    } else {
      this.storyText = `شهد ${monthName} نشاطًا منتجًا؛ ${studentsCount} طالبًا يتعلمون على يد ${teachersCount} معلمًا عبر ${tracksCount} مسارات بإجمالي ${bookingsCount} حجزًا.`;
    }

    const maxStudents = 50,
      maxTeachers = 20,
      maxBookings = 30,
      maxTracks = 10;
    const s1 = Math.min(studentsCount / maxStudents, 1) * 30;
    const s2 = Math.min(teachersCount / maxTeachers, 1) * 25;
    const s3 = Math.min(bookingsCount / maxBookings, 1) * 25;
    const s4 = Math.min(tracksCount / maxTracks, 1) * 20;
    this.healthScore = Math.round(s1 + s2 + s3 + s4);

    this.insights = [];
    if (tracksCount > 0) {
      this.insights.push({
        icon: '📚',
        title: 'المسارات نشطة',
        message: `${tracksCount} مسارات تعليمية مُفعَّلة في هذا الشهر.`,
        type: 'success',
      });
    }
    if (teachersCount < studentsCount && studentsCount > 0) {
      const ratio = ((teachersCount / studentsCount) * 100).toFixed(0);
      this.insights.push({
        icon: '📊',
        title: 'نسبة معلم/طالب',
        message: `المعلمون يمثلون ${ratio}٪ من الطلاب — فكّر في توسيع الكادر التعليمي.`,
        type: 'warning',
      });
    }
    if (bookingsCount === 0) {
      this.insights.push({
        icon: '📅',
        title: 'لا توجد حجوزات',
        message: `لم تُسجَّل حجوزات في ${monthName}، جرّب تفعيل برنامج الحوافز.`,
        type: 'neutral',
      });
    }
    if (this.healthScore < 30 && total > 0) {
      this.insights.push({
        icon: '⚡',
        title: 'معدل النشاط منخفض',
        message: 'المنصة تحتاج إلى دفعة تسويقية لزيادة الإقبال.',
        type: 'warning',
      });
    }
    if (this.insights.length === 0 && total > 0) {
      this.insights.push({
        icon: '🌟',
        title: 'أداء ممتاز',
        message: 'المنصة تعمل بكفاءة عالية هذا الشهر.',
        type: 'success',
      });
    }
  }

  private buildTimeline(): void {
    const monthObj = this.months.find((m) => m.value === this.selectedMonth);
    this.timeline = [
      {
        label: 'آخر تحديث',
        value: this.lastUpdated,
        icon: '🔄',
        time: 'الآن',
      },
      {
        label: 'الشهر المحدد',
        value: monthObj?.label ?? '',
        icon: '📅',
        time: this.selectedYear.toString(),
      },
      {
        label: 'البيانات المحملة',
        value: `${
          this.stats.studentsCount +
          this.stats.teachersCount +
          this.stats.bookingsCount +
          this.stats.tracksCount
        } سجلّ`,
        icon: '✅',
        time: 'مكتمل',
      },
    ];
  }

  // ---------- Charts Helpers ----------
  private destroyCharts(): void {
    Object.values(this.charts).forEach((c) => c?.destroy?.());
    this.charts = {};
  }

  private getCanvas(id: string): HTMLCanvasElement | null {
    return document.getElementById(id) as HTMLCanvasElement | null;
  }

  private initCharts(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initRadarChart();
      this.initPolarChart();
      this.initDoughnutChart();
      this.initHorizontalBarChart();
      this.initAreaTrendChart();
    });
  }

  private initRadarChart(): void {
    const canvas = this.getCanvas('chartRadar');
    if (!canvas) return;
    const { studentsCount, teachersCount, bookingsCount, tracksCount } =
      this.stats;
    this.charts['radar'] = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['الطلاب', 'المعلمون', 'الحجوزات', 'المسارات'],
        datasets: [
          {
            label: 'الشهر الحالي',
            data: [studentsCount, teachersCount, bookingsCount, tracksCount],
            backgroundColor: 'rgba(50,150,101,0.15)',
            borderColor: '#329665',
            borderWidth: 2,
            pointBackgroundColor: '#329665',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: 'rgba(31,96,64,0.1)' },
            ticks: {
              font: { family: 'Cairo' },
              color: 'rgba(31,96,64,0.5)',
              backdropColor: 'transparent',
            },
            pointLabels: {
              font: { family: 'Cairo', size: 12, weight: '600' },
              color: '#1f6040',
            },
          },
        },
      },
    });
  }

  private initPolarChart(): void {
    const canvas = this.getCanvas('chartPolar');
    if (!canvas) return;
    const { studentsCount, teachersCount, bookingsCount, tracksCount } =
      this.stats;
    const safeData = [
      studentsCount,
      teachersCount,
      bookingsCount,
      tracksCount,
    ].map((v) => (v === 0 ? 0.5 : v));
    this.charts['polar'] = new Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: ['الطلاب', 'المعلمون', 'الحجوزات', 'المسارات'],
        datasets: [
          {
            data: safeData,
            backgroundColor: [
              'rgba(50,150,101,0.75)',
              'rgba(200,164,21,0.75)',
              'rgba(31,96,64,0.6)',
              'rgba(226,205,116,0.7)',
            ],
            borderColor: ['#329665', '#c8a415', '#1f6040', '#c8a415'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { family: 'Cairo', size: 11 },
              color: '#1f6040',
              padding: 12,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
        },
        scales: {
          r: {
            grid: { color: 'rgba(31,96,64,0.08)' },
            ticks: { display: false },
          },
        },
      },
    });
  }

  private initDoughnutChart(): void {
    const canvas = this.getCanvas('chartDoughnut');
    if (!canvas) return;
    const { studentsCount, teachersCount, bookingsCount, tracksCount } =
      this.stats;
    const allZero =
      studentsCount === 0 &&
      teachersCount === 0 &&
      bookingsCount === 0 &&
      tracksCount === 0;
    const data = allZero
      ? [1, 1, 1, 1]
      : [studentsCount, teachersCount, bookingsCount, tracksCount];
    this.charts['doughnut'] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['الطلاب', 'المعلمون', 'الحجوزات', 'المسارات'],
        datasets: [
          {
            data,
            backgroundColor: ['#329665', '#c8a415', '#1f6040', '#d4b53a'],
            borderColor: '#faf9f6',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { family: 'Cairo', size: 11 },
              color: '#1f6040',
              padding: 10,
              boxWidth: 10,
              boxHeight: 10,
            },
          },
        },
      },
    });
  }

  private initHorizontalBarChart(): void {
    const canvas = this.getCanvas('chartHBar');
    if (!canvas) return;
    const { studentsCount, teachersCount, bookingsCount, tracksCount } =
      this.stats;
    this.charts['hbar'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['المسارات', 'الحجوزات', 'المعلمون', 'الطلاب'],
        datasets: [
          {
            data: [tracksCount, bookingsCount, teachersCount, studentsCount],
            backgroundColor: [
              'rgba(212,181,58,0.8)',
              'rgba(31,96,64,0.7)',
              'rgba(200,164,21,0.8)',
              'rgba(50,150,101,0.85)',
            ],
            borderColor: ['#d4b53a', '#1f6040', '#c8a415', '#329665'],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(31,96,64,0.07)' },
            ticks: { font: { family: 'Cairo', size: 11 }, color: '#329665' },
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { family: 'Cairo', size: 12, weight: '600' },
              color: '#1f6040',
            },
          },
        },
      },
    });
  }

  private initAreaTrendChart(): void {
    const canvas = this.getCanvas('chartArea');
    if (!canvas) return;
    const { studentsCount, teachersCount, tracksCount } = this.stats;
    const baseMonths = this.months.map((m) => m.label);
    const idx = this.selectedMonth - 1;

    const buildTrend = (current: number): number[] => {
      const arr = Array(12).fill(0);
      arr[idx] = current;
      for (let i = idx - 1; i >= 0; i--)
        arr[i] = Math.max(0, arr[i + 1] - Math.floor(Math.random() * 3 + 1));
      for (let i = idx + 1; i < 12; i++) arr[i] = 0;
      return arr;
    };

    this.charts['area'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: baseMonths,
        datasets: [
          {
            label: 'الطلاب',
            data: buildTrend(studentsCount),
            borderColor: '#329665',
            backgroundColor: 'rgba(50,150,101,0.12)',
            borderWidth: 2.5,
            tension: 0.45,
            fill: true,
            pointBackgroundColor: '#329665',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'المعلمون',
            data: buildTrend(teachersCount),
            borderColor: '#c8a415',
            backgroundColor: 'rgba(200,164,21,0.08)',
            borderWidth: 2,
            tension: 0.45,
            fill: true,
            pointBackgroundColor: '#c8a415',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
          },
          {
            label: 'المسارات',
            data: buildTrend(tracksCount),
            borderColor: '#1f6040',
            backgroundColor: 'rgba(31,96,64,0.07)',
            borderWidth: 1.8,
            tension: 0.45,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              font: { family: 'Cairo', size: 11 },
              color: '#1f6040',
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Cairo', size: 10 },
              color: 'rgba(31,96,64,0.55)',
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(31,96,64,0.07)' },
            ticks: {
              font: { family: 'Cairo', size: 11 },
              color: 'rgba(31,96,64,0.55)',
            },
          },
        },
      },
    });
  }

  // ---------- Animated Counters ----------
  private animateCounters(): void {
    const counters = [
      { id: 'cnt-students', target: this.stats.studentsCount },
      { id: 'cnt-teachers', target: this.stats.teachersCount },
      { id: 'cnt-bookings', target: this.stats.bookingsCount },
      { id: 'cnt-tracks', target: this.stats.tracksCount },
      { id: 'cnt-health', target: this.healthScore },
    ];
    counters.forEach(({ id, target }) => {
      const el = document.getElementById(id);
      if (!el) return;
      this.animateCounter(el, target, 1400);
    });

    const ring = document.getElementById(
      'healthRing',
    ) as SVGCircleElement | null;
    if (ring) {
      const circumference = 2 * Math.PI * 52;
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${circumference}`;
      setTimeout(() => {
        const offset = circumference * (1 - this.healthScore / 100);
        ring.style.strokeDashoffset = `${offset}`;
        ring.style.transition =
          'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)';
      }, 200);
    }
  }

  private animateCounter(
    el: HTMLElement,
    target: number,
    duration: number,
  ): void {
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target).toString();
      if (progress < 1) this.animationFrames.push(requestAnimationFrame(tick));
    };
    this.animationFrames.push(requestAnimationFrame(tick));
  }

  // ---------- Scroll Reveal ----------
  private initScrollReveal(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll('.reveal-on-scroll')
      .forEach((el) => observer.observe(el));
  }

  // ---------- Public Helpers ----------
  get hasAnyData(): boolean {
    return (
      this.stats.studentsCount > 0 ||
      this.stats.teachersCount > 0 ||
      this.stats.bookingsCount > 0 ||
      this.stats.tracksCount > 0
    );
  }

  get healthColor(): string {
    if (this.healthScore >= 70) return '#329665';
    if (this.healthScore >= 40) return '#c8a415';
    return '#d85a30';
  }

  get healthLabel(): string {
    if (this.healthScore >= 70) return 'ممتاز';
    if (this.healthScore >= 40) return 'متوسط';
    return 'يحتاج تطوير';
  }

  trackByInsight(_: number, item: InsightItem): string {
    return item.title;
  }
}
