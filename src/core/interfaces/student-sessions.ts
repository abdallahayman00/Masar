
export interface DailySessions {
  bookingId: number;
  meetingLink: string | null;
  sessionDate: string;
  sessionId: number;
  sessionMinutes: number;
  status: string;
  statusText: string | null;
  teacherName: string;
  timeString: string;
  trackName: string;
}

export type SessionStatus = 'Upcoming' | 'Completed' | 'Missed' | 'Ongoing';

export enum SessionStatusEnum {
  Upcoming = 'Upcoming',
  Completed = 'Completed',
  Missed = 'Missed',
  Ongoing = 'Ongoing',
}


export interface DaySessions {
  date: string;
  sessions: Session[];
}

export interface Session {
  bookingId: number;
  meetingLink: string | null;
  sessionDate: string;
  sessionId: number;
  sessionMinutes: number;
  status: string;
  teacherName: string;
  timeString: string;
  trackName: string;
}
