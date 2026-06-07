import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private baseUrl = 'https://masaar.runasp.net/api/Teacher';

  constructor(private http: HttpClient) {}

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
}
