// pending-batches.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse, PendingBatch } from '../interfaces/pending-batches';

@Injectable({
  providedIn: 'root',
})
export class PendingBatchesService {
  private baseUrl = 'https://massarlearning.runasp.net/api/Student';
  constructor(private http: HttpClient) {}

  getWaitingBookings(
    pageNumber: number,
    searchTerm: string = '',
  ): Observable<PagedResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', '10');

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<PagedResponse>(
      `${this.baseUrl}/WaitingBookingsDetailsPaged`,
      { params },
    );
  }

  confirmPayment(bookingId: number): Observable<string> {
    // ✅ إضافة responseType: 'text' للتعامل مع الرد النصي
    return this.http.post(
      `${this.baseUrl}/ConfirmPayment/${bookingId}`,
      {},
      { responseType: 'text' },
    );
  }
}
