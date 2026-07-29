export interface FilterParams {
  page?: number;
  sortOrder?: string;
  searchName?: string;
  searchEmail?: string;
  searchWhatsApp?: string;
  gender?: string;
  minAge?: number | null;
  maxAge?: number | null;

  // خصائص الجلسات
  teacherName?: string;
  studentName?: string;
  trackName?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD

  // خصائص المقاعد المتاحة (جديدة)
  teacherId?: number | null;
  isBooked?: boolean | null;
  isCompleted?: boolean | null;
  searchTeacher?: string;
  searchTrack?: string;
}

export interface FilterConfig {
  showEmail?: boolean;
  showWhatsApp?: boolean;
  showGender?: boolean;
  showAgeRange?: boolean;
  showSortOrder?: boolean;
  showSearchName?: boolean;
  placeholderText?: string;
  title?: string;

  // خصائص الجلسات
  showTeacherName?: boolean;
  showStudentName?: boolean;
  showTrackName?: boolean;
  showDateRange?: boolean;

  // خصائص المقاعد (جديدة)
  showTeacherId?: boolean;
  showIsBooked?: boolean;
  showIsCompleted?: boolean;
  showSearchTeacher?: boolean;
  showSearchTrack?: boolean;
}
