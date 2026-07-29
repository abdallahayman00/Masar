export interface AvailableSeatItem {
  slotId: number;
  teacherId: number;
  teacherName: string;
  trackName: string | null;
  firstDay: string; // اسم اليوم بالعربية
  secondDay: string; // اسم اليوم بالعربية
  time: string; // HH:mm:ss
  isBooked: boolean;
  isCompleted: boolean;
}

export interface AvailableSeatsResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: AvailableSeatItem[];
}
