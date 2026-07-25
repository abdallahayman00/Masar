import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AvailableSlot {
  id: number;
  firstDay: string;
  color: string;
  secondDay: string;
  isBooked: boolean;
  time: string;
}

export interface DeleteResponse {
  message: string;
}

export interface CreateSlotRequest {
  teacherId: number;
  firstDay: string;
  secondDay: string;
  sessionTime: string;
  color: string;
}

export interface CreateSlotResponse {
  message?: string;
  id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AvailableSlotsService {
  private baseUrl =
    'http://massarlearning.runasp.net/api/Teacher/AvailableSlots';
  private deleteUrl =
    'http://massarlearning.runasp.net/api/Teacher/available-dates';
  private createUrl =
    'http://massarlearning.runasp.net/api/Teacher/CreateSchedule';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log(
      '🔑 Token used:',
      token ? token.substring(0, 20) + '...' : 'No token',
    );
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getAvailableSlots(teacherId: number): Observable<AvailableSlot[]> {
    const url = `${this.baseUrl}?teacherId=${teacherId}`;
    return this.http.get<AvailableSlot[]>(url, { headers: this.getHeaders() });
  }

  deleteAvailableSlot(slotId: number): Observable<DeleteResponse> {
    const url = `${this.deleteUrl}/${slotId}`;
    return this.http.delete<DeleteResponse>(url, {
      headers: this.getHeaders(),
    });
  }

  createAvailableSlot(
    request: CreateSlotRequest,
  ): Observable<CreateSlotResponse> {
    console.log('📤 Sending to createUrl:', this.createUrl);
    console.log('📦 Request body:', request);
    return this.http.post<CreateSlotResponse>(this.createUrl, request, {
      headers: this.getHeaders(),
    });
  }
}
