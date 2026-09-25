// services/session.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../interfaces/session.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private baseUrl = `${environment.apiUrl}/api/Sessions`;
  private teacherApiUrl = `${environment.apiUrl}/api/Teacher`;
  constructor(private http: HttpClient) {}

  /**
   * جلب جميع الجلسات (بدون فلتر)
   * @returns Observable<Session[]>
   */
  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/GetAllSessions`);
  }

  getTeacherSessionsForToday(teacherId: number): Observable<Session[]> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.get<Session[]>(
      `${this.baseUrl}/GetAllDSessionsOfDayForTeacher`,
      { params },
    );
  }

  categorizeSessions(sessions: Session[]): {
    upcoming: Session[];
    completed: Session[];
    missed: Session[];
    ongoing: Session[];
  } {
    return {
      upcoming: sessions.filter((s) => s.sessionStatus === 'Upcoming'),
      completed: sessions.filter((s) => s.sessionStatus === 'Completed'),
      missed: sessions.filter((s) => s.sessionStatus === 'Missed'),
      ongoing: sessions.filter((s) => s.sessionStatus === 'Ongoing'),
    };
  }
  addMeetingLink(sessionId: number, link: string): Observable<string> {
    const params = new HttpParams().set('link', link);
    return this.http.post<string>(
      `${this.teacherApiUrl}/AddSessionMeetingLink/${sessionId}`,
      null,
      { params, responseType: 'text' as 'json' },
    );
  }
}
