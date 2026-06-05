import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://masaar.runasp.net';

  constructor(private http: HttpClient) {}

  // ---------------- LOGIN ----------------
  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Login`, data);
  }

  // ---------------- REGISTER STUDENT ----------------
  registerStudent(data: StudentRegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/StudentRegister`, data);
  }

  // ---------------- REGISTER TEACHER ----------------
  registerTeacher(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/TeacherRegister`, formData);
  }

  // ---------------- LOGOUT ----------------
  logout(): Observable<any> {
    // ✅ الـ interceptor يضيف التوكن تلقائياً، لا حاجة لإضافته يدوياً
    return this.http.post(`${this.baseUrl}/api/Account/Logout`, {});
  }
  // ---------------- CHANGE PASSWORD ----------------
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Account/ChangePassword`, data);
  }

  // ======================================================
  // 🔥 APP BOOTSTRAP INITIALIZATION (IMPORTANT)
  // ======================================================
  async initializeApp(): Promise<boolean> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return true;

    try {
      await firstValueFrom(
        this.http.get(`${this.baseUrl}/api/Account/Me`).pipe(
          catchError((err) => {
            // فقط إذا كان 401 (غير مصرح) نمسح التوكن
            if (err.status === 401) {
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
            }
            // أي خطأ آخر (CORS, 404, 500) لا نمسح التوكن
            return of(null);
          }),
        ),
      );
      return true;
    } catch {
      // أي خطأ غير متوقع (نادر) لا نمسح التوكن
      return true;
    }
  }
}
