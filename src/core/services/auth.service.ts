import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  of,
} from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  studentNationality: string;
  whatsAppNumber: string;
  parentWhatsAppNumber?: string;
  studentNotes?: string;
  platformExpectations?: string;
  age: string;
  nationalId: string;
  gender: string;
  residenceCountry: string;
}

export interface ChangePasswordRequest {
  userId: number;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token?: string;
  role?: string;
  isApproved?: boolean;
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ------------------- JWT DECODING ---------------------------
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  // الحصول على التوكن المخزن
  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // التحقق من انتهاء صلاحية التوكن (exp claim)
  isTokenExpired(token?: string | null): boolean {
    const t = token ?? this.getToken();
    if (!t) return true;
    const decoded = this.decodeToken(t);
    if (!decoded) return true;
    if (!decoded.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  }

  // هل المستخدم مسجل دخول بتوكن صالح؟
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // الدور المخزن (من أي تخزين)
  getStoredRole(): string {
    return (
      localStorage.getItem('role') ||
      sessionStorage.getItem('role') ||
      this.getRoleFromToken() ||
      ''
    );
  }

  // مسح كل بيانات الجلسة من التخزينين
  clearAuthData(): void {
    ['token', 'role', 'teacherId', 'studentId'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  // حفظ بيانات الجلسة بعد تسجيل دخول ناجح، وإرجاع الدور بصيغة موحدة
  saveSession(response: LoginResponse | null | undefined): string {
    let role = response?.role;
    if (typeof role === 'string' && role.length) {
      role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      localStorage.setItem('role', role);
    }

    if (response?.token) {
      localStorage.setItem('token', response.token);
      const userId = this.getUserIdFromToken();
      if (userId != null && role === 'Teacher') {
        localStorage.setItem('teacherId', String(userId));
      }
      if (userId != null && role === 'Student') {
        localStorage.setItem('studentId', String(userId));
      }
    }

    return role || '';
  }

  // استخراج UserId من التوكن (هو نفسه TeacherId للمعلم)
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    const userId =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    return userId ? parseInt(userId, 10) : null;
  }

  // الحصول على دور المستخدم من التوكن
  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    const role =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role || null;
  }

  // (احتفظ بالدالة القديمة للتخزين المؤقت)
  getTeacherId(): number | null {
    const id = localStorage.getItem('teacherId');
    return id ? parseInt(id, 10) : null;
  }

  // ------------------- LOGIN ---------------------------
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Login`, data);
  }

  // ------------------- REGISTER ---------------------------
  registerStudent(data: StudentRegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/StudentRegister`, data);
  }

  registerTeacher(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/TeacherRegister`, formData);
  }

  // ------------------- LOGOUT ---------------------------
  logout(): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/Account/Logout`, {})
      .pipe(finalize(() => this.clearAuthData()));
  }

  // ------------------- CHANGE PASSWORD --------------------
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Account/ChangePassword`, data);
  }

  // ------------------- APP INIT ---------------------------
  async initializeApp(): Promise<boolean> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return true;

    try {
      await firstValueFrom(
        this.http.get(`${this.baseUrl}/api/Account/Me`).pipe(
          catchError((err) => {
            if (err.status === 401) {
              this.clearAuthData();
            }
            return of(null);
          }),
        ),
      );
      return true;
    } catch {
      return true;
    }
  }
}
