// services/available-slots.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = 'https://masaar.runasp.net/api/Teacher/AvailableSlots';
  private deleteUrl = 'https://masaar.runasp.net/api/Teacher/available-dates';
  private createUrl = 'https://masaar.runasp.net/api/Teacher/CreateSchedule';

  constructor(private http: HttpClient) {}

  getAvailableSlots(teacherId: number): Observable<AvailableSlot[]> {
    const url = `${this.baseUrl}?teacherId=${teacherId}`;
    return this.http.get<AvailableSlot[]>(url);
  }

  deleteAvailableSlot(slotId: number): Observable<DeleteResponse> {
    const url = `${this.deleteUrl}/${slotId}`;
    return this.http.delete<DeleteResponse>(url);
  }

  createAvailableSlot(
    request: CreateSlotRequest,
  ): Observable<CreateSlotResponse> {
    return this.http.post<CreateSlotResponse>(this.createUrl, request);
  }
}
