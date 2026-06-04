// pending-batches.interface.ts
export interface PendingBatch {
  bookingId: number; // ✅ الحقل الصحيح للـ ID
  studentName: string;
  teacherName: string;
  trackName: string; // اسم المسار
  firstDay: string; // اليوم الأول
  secondDay: string; // اليوم الثاني
  time: string; // الوقت
  bookingStatus: string; // حالة الحجز (Waiting, Approved, etc.)
  createdAt: string; // تاريخ الإنشاء
}

export interface PagedResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: PendingBatch[];
}
// booking.interface.ts
export interface Booking {
  bookingId: number;
  studentName: string;
  teacherName: string;
  status: string; // "Confirmed" أو "Waiting" إلخ
  trackName: string;
  firstDay: string;
  secondDay: string;
  time: string;
}
