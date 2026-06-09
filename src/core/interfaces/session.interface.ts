// models/session.interface.ts

export type SessionStatus = 'Upcoming' | 'Completed' | 'Missed' | 'Ongoing';

export interface Session {
  studentName: string;
  trackName: string;
  numberOfSession: number;
  sessionId: number;
  sessionStatus: SessionStatus;
  sessionTime: string; // مثال: "6/9/2026 1:15:00 PM - 6/9/2026 2:00:00 PM"
  sessionMeetLink: string | null;
}

// optional: enum للاستخدام داخل المكونات
export enum SessionStatusEnum {
  Upcoming = 'Upcoming',
  Completed = 'Completed',
  Missed = 'Missed',
  Ongoing = 'Ongoing',
}
