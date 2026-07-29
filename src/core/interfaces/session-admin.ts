export interface SessionAdminItem {
  sessionId: number;
  studentName: string;
  teacherName: string;
  trackName: string;
  sessionDate: string; // ISO string
  sessionTime: string;
  day: string;
  isStudentAttended: boolean;
  isTeachertAttended: boolean;
  isCompleted: boolean;
}

export interface SessionAdminResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: SessionAdminItem[];
}

export interface SessionAdminFilterParams {
  teacherName?: string;
  studentName?: string;
  trackName?: string;
  from?: string; // ISO date string
  to?: string;
}
