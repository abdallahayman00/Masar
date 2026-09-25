// app.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { interval } from 'rxjs';
import { StudentCad } from '../core/interfaces/student-cad';
import { AuthService } from '../core/services/auth.service';
import { StudentService } from '../core/services/student.service';
import { TeacherService } from '../core/services/teacher.service'; // المسار حسب مشروعك
import { PendingBatchesService } from '../core/services/pending-batches.service';
import { ToastService } from '../core/services/toast.service';
import { ToastComponent } from '../features/toast/toast/toast.component'; // أضف هذا
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { ArabicNumberPipe } from '../core/pipes/arabic-number.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    SpinnerComponent,
    ToastComponent, 
    ArabicNumberPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isMobileSidebarOpen = false;
  isAuthRoute = false;
  isAppLoading = true;
  teacherData: any;
  studentData!: StudentCad;
  selectedImageFile: File | null = null;

  // عدّادات الطلبات المعلقة (للأدمن في السايدبار)
  teacherRequestsCount = 0;
  pendingBatchesCount = 0;

  // ⚠️ لم نعد نعتمد على this.role المخزنة في ngOnInit
  // بل سنقرأ الدور ديناميكياً من التخزين عند الحاجة (في الـ getters)

  constructor(
    private router: Router,
    private authService: AuthService,
    private teacherService: TeacherService, // <-- حقن الخدمة
    private studentService: StudentService,
    private pendingBatchesService: PendingBatchesService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isAppLoading = false;
    }, 1500);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAuthRoute = event.urlAfterRedirects.startsWith('/auth');
        // تحديث العدّادات عند كل تنقل
        this.refreshPendingCounts();
      });

    this.refreshPendingCounts();
    // تحديث دوري كل دقيقة عشان الأدمن يشوف الطلبات الجديدة
    interval(60000).subscribe(() => this.refreshPendingCounts());

    // ✅ استدعاء جلب بيانات المعلم إذا كان المستخدم معلمًا
    if (this.isTeacher) {
      this.loadTeacherData();
    }

    if (this.isStudent) {
      this.loadStudentData();
    }
  }

  // جلب عدد طلبات المعلمين والدفعات المعلقة (للأدمن فقط)
  refreshPendingCounts(): void {
    if (!this.isAdmin) {
      this.teacherRequestsCount = 0;
      this.pendingBatchesCount = 0;
      return;
    }

    this.teacherService.getNotApprovedTeachers(1).subscribe({
      next: (res) => {
        this.teacherRequestsCount = res?.totalCount ?? 0;
      },
      error: () => {},
    });

    this.pendingBatchesService.getWaitingCount().subscribe({
      next: (res) => {
        this.pendingBatchesCount = res?.totalCount ?? 0;
      },
      error: () => {},
    });
  }

  private loadTeacherData() {
    const teacherId =
      localStorage.getItem('teacherId') || sessionStorage.getItem('teacherId');
    if (!teacherId) {
      console.warn('لا يوجد teacherId مخزن');
      return;
    }
    this.teacherService.getTeacherDetails(+teacherId).subscribe({
      next: (data) => {
        this.teacherData = data;
        console.log('تم جلب بيانات المعلم:', this.teacherData);
      },
      error: (err) => {
        console.error('فشل في جلب بيانات المعلم:', err);
      },
    });
  }

  private loadStudentData() {
    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('لا يوجد studentId مخزن');
      return;
    }
    this.studentService.getStudentCardInfo(+studentId).subscribe({
      next: (res) => {
        this.studentData = res
      }
    })

  }

  // ================= ROLE HELPERS (المعدلة) =================
  get isAdmin(): boolean {
    // نقرأ الدور فوراً من التخزين عند كل استدعاء
    const role =
      localStorage.getItem('role') || sessionStorage.getItem('role') || '';
    // نقارن بطريقة غير حساسة لحالة الأحرف (للتأكد)
    return role.toLowerCase() === 'admin';
  }

  get isTeacher(): boolean {
    const role =
      localStorage.getItem('role') || sessionStorage.getItem('role') || '';
    return role.toLowerCase() === 'teacher';
  }

   get isStudent(): boolean {
    const role =
      localStorage.getItem('role') || sessionStorage.getItem('role') || '';
    return role.toLowerCase() === 'student';
  }

  // ================= LOGOUT =================
  logout() {
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: (err) => {
        console.error('Logout Error:', err);
        this.finishLogout();
      },
    });
  }

  private finishLogout() {
    this.authService.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  // ================= UI CONTROLS (بدون تغيير) =================
  toggleCollapse() {
    if (window.innerWidth > 640) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  onNavigate() {
    if (window.innerWidth <= 640) {
      this.closeMobileSidebar();
    }
    const mainArea = document.querySelector('.main-area');
    if (mainArea) {
      mainArea.scrollTop = 0;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 640) {
      this.isMobileSidebarOpen = false;
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      this.uploadTeacherImage(); // رفع فوري مع إظهار التوست
    }
  }

  uploadTeacherImage() {
    if (!this.selectedImageFile) {
      this.toastService.warning('الرجاء اختيار صورة أولاً');
      return;
    }
    const teacherId =
      localStorage.getItem('teacherId') || sessionStorage.getItem('teacherId');
    if (!teacherId) {
      this.toastService.error('لم يتم العثور على معرف المعلم');
      return;
    }

    this.teacherService
      .uploadProfileImage(+teacherId, this.selectedImageFile)
      .subscribe({
        next: (res) => {
          this.toastService.success('تم رفع الصورة بنجاح');
          this.loadTeacherData(); // تحديث البيانات
          this.selectedImageFile = null; // إعادة تعيين الملف المختار
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('فشل رفع الصورة، حاول مرة أخرى');
        },
      });
  }
}
