// student.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../interfaces/student';
import { StudentTrack } from '../interfaces/student-tracks';

// واجهات البيانات المطلوبة
export interface BookingRequest {
  studentId: number;
  teacherId: number;
  availabilityId: number;
  trackId: number;
}

export interface RateTeacherRequest {
  studentId: number;
  teacherId: number;
  rating: number;
  comment?: string;
}

export interface CreateExtraSessionRequest {
  studentId: number;
  teacherId: number;
  trackId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export interface SubmitExamRequest {
  studentId: number;
  examId: number;
  answers: any[];
  score?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private baseUrl = 'https://masaar.runasp.net/api/Student';

  constructor(private http: HttpClient) {}

  // ============= GET METHODS =============

  // جلب كل الطلاب
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/GetAllStudents`);
  }

  // جلب طالب بواسطة ID
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/GetStudent/${id}`);
  }

  // جلب جميع مسارات الطالب
  getStudentTracks(studentId: number): Observable<StudentTrack> {
    return this.http.get<StudentTrack>(
      `${this.baseUrl}/GetStudentTracks/${studentId}`,
    );
  }

  // جلب الجلسات اليومية للطالب
  getDailySessions(studentId: number, todayDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/DailySessions/${studentId}?date=${todayDate}`);
  }

  // جلب الجلسات الأسبوعية
  getWeeklySessions(studentId: number, startDate: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/WeeklySessions?studentId=${studentId}&startDate=${startDate}`);
  }

  // جلب الجلسات الشهرية
  getMonthlySessions(studentId: number, trackId: number): Observable<any> {
    return this.http.get<any[]>(
      `${this.baseUrl}/MonthlySessions/${studentId}/${trackId}`,
    );
  }

  // جلب حالات جلسات الطالب في مسار معين
  getStudentTrackSessionStatuses(studentId: number, trackId: number): Observable<any> {
    return this.http.get<any[]>(
      `${this.baseUrl}/GetStudentTrackSessionStatuses/${studentId}/${trackId}`,
    );
  }

  // جلب مسارات الجلسات الإضافية
  getExtraSessionTracks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ExtraSessionTracks`);
  }

  // جلب جميع الجلسات الإضافية للطالب
  getAllExtraSessions(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/AllExtraSessions/${studentId}`,
    );
  }

  // جلب بطاقة معلومات الطالب
  getStudentCardInfo(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/StudentCardInfo/${studentId}`);
  }

  // جلب المصفوفة للأيام السبعة القادمة
  getNext7DaysMatrix(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Next7DaysMatrix`);
  }

  // جلب عدد جميع الطلاب
  getAllStudentsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/AllStudentsCount`);
  }

  // جلب جميع تفاصيل الطلاب مع Pagination

  // جلب عدد الحجوزات المنتظرة
  getWaitingBookingsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/WaitingBookingsCount`);
  }

  // جلب تفاصيل الحجوزات المنتظرة مع Pagination
  getWaitingBookingsDetailsPaged(
    pageNumber: number,
    pageSize: number,
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.baseUrl}/WaitingBookingsDetailsPaged`, {
      params,
    });
  }

  // ============= POST METHODS =============

  // حجز موعد مع معلم
  booking(request: BookingRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Booking`, request);
  }

  // تأكيد الدفع
  confirmPayment(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/ConfirmPayment/${id}`, {});
  }

  // حضور جلسة
  attendSession(sessionId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/StudentAttendSession/${sessionId}`,
      {},
    );
  }

  // إنشاء جلسة إضافية
  createExtraSession(request: CreateExtraSessionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateExtraSession`, request);
  }

  // تقديم امتحان
  submitExam(id: number, request: SubmitExamRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/SubmitExam/${id}`, request);
  }

  // تقييم معلم
  rateTeacher(request: RateTeacherRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/StudnetRateTeacher`, request);
  }
  // في student.service.ts - أضف هذه الدالة المعدلة
  getAllStudentsDetailsPaged(
    pageNumber: number,
    pageSize: number,
    filters?: {
      fullName?: string;
      email?: string;
      whatsApp?: string;
      gender?: string;
      nationality?: string;
      minAge?: number;
      maxAge?: number;
      sortOrder?: string;
    },
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // إضافة الفلاتر إذا وجدت
    if (filters) {
      if (filters.fullName) params = params.set('fullName', filters.fullName);
      if (filters.email) params = params.set('email', filters.email);
      if (filters.whatsApp) params = params.set('whatsApp', filters.whatsApp);
      if (filters.gender) params = params.set('gender', filters.gender);
      if (filters.nationality)
        params = params.set('nationality', filters.nationality);
      if (filters.minAge)
        params = params.set('minAge', filters.minAge.toString());
      if (filters.maxAge)
        params = params.set('maxAge', filters.maxAge.toString());
      if (filters.sortOrder)
        params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<any>(`${this.baseUrl}/AllStudentsDetailsPaged`, {
      params,
    });
  }
}
