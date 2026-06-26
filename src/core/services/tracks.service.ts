// tracks.service.ts - النسخة النهائية المصححة
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Track, normalizeTrack } from '../interfaces/track';

@Injectable({
  providedIn: 'root',
})
export class TracksService {
  private apiUrl = 'https://masaar.runasp.net/api/Track';

  constructor(private http: HttpClient) {}

  getAllTracks(): Observable<Track[]> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    headers = headers.set('Accept', 'application/json');

    return this.http
      .get<any[]>(`${this.apiUrl}/GetAllTracks`, { headers })
      .pipe(
        map((response) => {
          console.log('API Response:', response);
          if (Array.isArray(response)) {
            return response.map((item) => normalizeTrack(item));
          } else {
            throw new Error('تنسيق البيانات غير متوقع');
          }
        }),
        catchError(this.handleError),
      );
  }
  addTrack(trackData: any): Observable<any> {
    const token = this.getToken();
    const formData = new FormData();

    formData.append('TrackName', String(trackData.TrackName).trim());
    formData.append('description', String(trackData.description).trim());
    formData.append('NumberOfSessions', String(trackData.NumberOfSessions));
    formData.append('SessionMinutes', String(trackData.SessionMinutes));
    formData.append('SessionPrice', String(trackData.SessionPrice));
    formData.append('Price', String(trackData.Price));

    if (trackData.File && trackData.File instanceof File) {
      formData.append('File', trackData.File, trackData.File.name);
    }

    if (trackData.TrackPhoto && trackData.TrackPhoto instanceof File) {
      formData.append(
        'TrackPhoto',
        trackData.TrackPhoto,
        trackData.TrackPhoto.name,
      );
    }

    // ✅ طريقة بديلة: إنشاء headers جديدة بدون Content-Type
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    // لا نضيف Content-Type هنا

    return this.http
      .post<any>(`${this.apiUrl}/AddTrack`, formData, { headers })
      .pipe(
        map((response) => {
          console.log('✅ Add Track Response:', response);
          return response;
        }),
        catchError(this.handleError),
      );
  }
  // tracks.service.ts - أضف هذه الدالة
  updateTrack(trackId: number, trackData: any): Observable<any> {
    const token = this.getToken();
    const formData = new FormData();

    // إضافة جميع الحقول (مع TrackId)
    formData.append('TrackId', String(trackId));
    formData.append('TrackName', String(trackData.TrackName).trim());
    formData.append('description', String(trackData.description).trim());
    formData.append('NumberOfSessions', String(trackData.NumberOfSessions));
    formData.append('SessionMinutes', String(trackData.SessionMinutes));
    formData.append('SessionPrice', String(trackData.SessionPrice));
    formData.append('Price', String(trackData.Price));

    // إضافة الملفات الجديدة فقط إذا تم اختيارها
    if (trackData.File && trackData.File instanceof File) {
      formData.append('File', trackData.File, trackData.File.name);
    }

    if (trackData.TrackPhoto && trackData.TrackPhoto instanceof File) {
      formData.append(
        'TrackPhoto',
        trackData.TrackPhoto,
        trackData.TrackPhoto.name,
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put<any>(`${this.apiUrl}/UpdateTrack/${trackId}`, formData, { headers })
      .pipe(
        map((response) => {
          console.log('✅ Update Track Response:', response);
          return response;
        }),
        catchError(this.handleError),
      );
  }
  // tracks.service.ts - أضف هذه الدالة الجديدة
  // tracks.service.ts
  // tracks.service.ts - أضف هذه الدالة الجديدة
  getTrackById(id: number): Observable<Track> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    headers = headers.set('Accept', 'application/json');

    return this.http
      .get<any>(`${this.apiUrl}/GetTrackById/${id}`, { headers })
      .pipe(
        map((response) => {
          console.log('📥 Track details response:', response);
          return normalizeTrack(response);
        }),
        catchError(this.handleError),
      );
  }
  // ================ حذف المسار ================
  deleteTrack(trackId: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<any>(`${this.apiUrl}/DeleteTrack/${trackId}`, { headers })
      .pipe(
        map((response) => {
          console.log('✅ Delete Track Response:', response);
          return response;
        }),
        catchError(this.handleError),
      );
  }
  // 🔑 التصحيح الأهم: البحث عن التوكن في المكان الصحيح
  private getToken(): string | null {
    return (
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('token') || // ✅新增
      sessionStorage.getItem('token') // ✅新增
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'حدث خطأ غير متوقع';
    let errorCode = error.status || 500;

    console.error('❌ API Error Details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error,
    });

    if (errorCode === 401) {
      errorMessage = 'جلسة العمل منتهية. يرجى تسجيل الدخول مرة أخرى';
    } else if (errorCode === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
    } else if (errorCode === 400) {
      if (error.error?.errors) {
        const validationErrors = Object.values(error.error.errors).flat();
        errorMessage = validationErrors.join(', ');
        console.error('📝 Validation errors:', validationErrors);
      } else {
        errorMessage =
          error.error?.message || 'لا يمكن حذف مسار مرتبط بطلبة او معلمين ';
      }
    } else if (errorCode === 404) {
      errorMessage = 'الخدمة غير متاحة حالياً';
    } else if (errorCode === 500) {
      errorMessage = 'حدث خطأ في الخادم';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      message: errorMessage,
      status: errorCode,
      originalError: error,
    }));
  }

  //  جلب جميع المسارات المتاحة للطالب
  getAllTracksForStu(): Observable<any> {
    return this.http.get<any[]> (`${this.apiUrl}/GetAllTracksForStu`)
  }
}
