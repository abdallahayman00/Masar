import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  of,
  tap,
} from 'rxjs';

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
  // دالة مساعدة لفك تشفير الـ JWT
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Login`, data).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);

          // استخراج الـ nameidentifier من التوكن
          const decoded = this.decodeToken(response.token);
          const userId =
            decoded?.[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
            ];

          if (userId && response.role?.toLowerCase() === 'teacher') {
            localStorage.setItem('teacherId', userId);
          }
        }
        if (response.role) {
          localStorage.setItem('role', response.role);
        }
      }),
    );
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
    return this.http.post(`${this.baseUrl}/api/Account/Logout`, {}).pipe(
      finalize(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('teacherId');
        sessionStorage.clear();
      }),
    );
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
            if (err.status === 401) {
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
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
