import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcceptedBatch } from '../../core/interfaces/accepted-batch';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AcceptedBatchesService {
  private readonly apiUrl = `${environment.apiUrl}/api/Student/GetAllBookings`;
  constructor(private http: HttpClient) {}

  getAcceptedBatches(): Observable<AcceptedBatch[]> {
    return this.http.get<AcceptedBatch[]>(this.apiUrl);
  }
}
