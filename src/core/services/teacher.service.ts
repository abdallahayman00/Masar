import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/teacher';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private baseUrl = `${environment.apiUrl}/api/Teacher`;

  constructor(private http: HttpClient) {}

  // جلب المعلمين غير المعتمدين (طلبات المعلمين)
  getNotApprovedTeachers(page: number = 1): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/not-approved`, {
      params: { page },
    });
  }

  // جلب تفاصيل المعلم باستخدام teacherId
  getTeacherDetails(teacherId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/teacherId/details?teacherId=${teacherId}`,
    );
  }
  // teacher.service.ts
  uploadProfileImage(teacherId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('TeacherId', teacherId.toString());
    formData.append('ProfileImage', file);
    return this.http.post(`${this.baseUrl}/upload-profile-image`, formData);
  }
  // جلب جميع المعلمين المتاحين للطلاب
  getAllTeachersForStu(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAllTeachersForStudent`);
  }
  //جلب المواعيد لمعلم معين
  getAvailableDate(teacherTd: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${teacherTd}/available-dates`);
  }
}
