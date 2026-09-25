import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SessionAdminResponse,
  SessionAdminFilterParams,
} from '../interfaces/session-admin';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private baseUrl = `${environment.apiUrl}/api/Sessions`;

  constructor(private http: HttpClient) {}

  getAllSessionsForAdmin(
    page: number,
    pageSize: number,
    filters?: SessionAdminFilterParams,
  ): Observable<SessionAdminResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.teacherName)
        params = params.set('teacherName', filters.teacherName);
      if (filters.studentName)
        params = params.set('studentName', filters.studentName);
      if (filters.trackName)
        params = params.set('trackName', filters.trackName);
      if (filters.from) params = params.set('from', filters.from);
      if (filters.to) params = params.set('to', filters.to);
    }

    return this.http
      .get<SessionAdminResponse>(`${this.baseUrl}/GetAllSessionsForAdmin`, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((session) => ({
            ...session,
            // تحويل القيم إلى Boolean صريح
            isCompleted: !!session.isCompleted,
            isStudentAttended: !!session.isStudentAttended,
            // تصحيح الاسم إذا كان الخطأ من الخادم (isTeacherAttended بدلاً من isTeachertAttended)
            isTeachertAttended: !!session.isTeachertAttended, // إذا كان الاسم كما هو
            // أو إضافة حقل جديد إذا كان الخادم يرسل isTeacherAttended:
            // isTeacherAttended: !!session.isTeacherAttended,
          })),
        })),
      );
  }
}
