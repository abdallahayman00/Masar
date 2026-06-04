// app.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    SpinnerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isMobileSidebarOpen = false;
  isAuthRoute = false;
  isAppLoading = true;

  // ⚠️ لم نعد نعتمد على this.role المخزنة في ngOnInit
  // بل سنقرأ الدور ديناميكياً من التخزين عند الحاجة (في الـ getters)

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // لا نحتاج لتعيين this.role بعد الآن
    // سنقرأ الدور من localStorage/sessionStorage مباشرة في get isAdmin

    // loading spinner (مثل ما هو)
    setTimeout(() => {
      this.isAppLoading = false;
    }, 1500);

    // detect auth routes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAuthRoute = event.urlAfterRedirects.startsWith('/auth');
      });
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

  // ================= LOGOUT (بدون تغيير) =================
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.clear();
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout Error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.clear();
        this.router.navigate(['/auth/login']);
      },
    });
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
}
