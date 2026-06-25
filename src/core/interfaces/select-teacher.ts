export interface Teacher {
  teacherId: number;
  teacherName: string;
  summary: string;
  gender: string;
  profileImagePath: string | null;
}

export interface Slot {
  id: number;
  firstDay: string;
  secondDay: string;
  timeFormatted: string;
  isBooked: boolean;
}
