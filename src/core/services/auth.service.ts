import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Login`, data);
  }

  registerStudent(data: StudentRegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/StudentRegister`, data);
  }

  registerTeacher(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/TeacherRegister`, formData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Account/Logout`, {});
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Account/ChangePassword`, data);
  }
}
