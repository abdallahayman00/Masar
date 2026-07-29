import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailableSeatsResponse } from '../interfaces/available-seats';
import { FilterParams } from '../interfaces/filter-params';

@Injectable({
  providedIn: 'root',
})
export class AvailableSeatsService {
  private baseUrl = 'http://massarlearning.runasp.net/api/Teacher';

  constructor(private http: HttpClient) {}

  /**
   * الحصول على قائمة المقاعد المتاحة مع دعم الترقيم والفلترة
   * @param page رقم الصفحة
   * @param pageSize عدد العناصر في الصفحة
   * @param filters معاملات الفلترة (اختياري)
   * @returns Observable<AvailableSeatsResponse>
   */
  getAvailableSeats(
    page: number,
    pageSize: number = 10,
    filters?: Pick<
      FilterParams,
      'teacherId' | 'isBooked' | 'isCompleted' | 'searchTeacher' | 'searchTrack'
    >,
  ): Observable<AvailableSeatsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.teacherId !== undefined && filters.teacherId !== null) {
        params = params.set('teacherId', filters.teacherId.toString());
      }
      if (filters.isBooked !== undefined && filters.isBooked !== null) {
        params = params.set('isBooked', String(filters.isBooked));
      }
      if (filters.isCompleted !== undefined && filters.isCompleted !== null) {
        params = params.set('isCompleted', String(filters.isCompleted));
      }
      if (filters.searchTeacher) {
        params = params.set('searchTeacher', filters.searchTeacher);
      }
      if (filters.searchTrack) {
        params = params.set('searchTrack', filters.searchTrack);
      }
    }

    return this.http.get<AvailableSeatsResponse>(
      `${this.baseUrl}/AvailableSeats`,
      { params },
    );
  }
}
