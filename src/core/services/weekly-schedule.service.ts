// services/weekly-schedule.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Session {
  sessionId: number;
  time: string;
  slotId: number;
  sessionType: string;
  color: string;
  status: string;
}

export interface DaySchedule {
  dayName: string;
  date: string;
  sessions: Session[];
}

export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
  allSessionTimes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class WeeklyScheduleService {
  private baseUrl = `${environment.apiUrl}/api/Teacher/WeeklyScheduleMatrix`;

  constructor(private http: HttpClient) {}

  getWeeklySchedule(
    teacherId: number,
    selectedDate: string,
  ): Observable<WeeklyScheduleResponse> {
    const url = `${this.baseUrl}?TeacherId=${teacherId}&SelectedDate=${selectedDate}`;
    return this.http.get<WeeklyScheduleResponse>(url);
  }
}
