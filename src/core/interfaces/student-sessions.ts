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


// ============================================
//  getMonthlySessions
// ============================================
export interface MonthlySession {
  sessionId: number;
  sessionDate: string; // ISO date string
  status: SessionStatus;
  bookingId: number;
}

export type MonthlySessions = MonthlySession[];

// ============================================
// getStuTrackSessionStatuses
// ============================================
export interface SessionStatusItem {
  sessionId: number;
  status: SessionStatus;
  bookingId: number;
}

export type SessionStatuses = SessionStatusItem[];

// ============================================
// getWeeklyStuSessions
// (re-uses your existing Session / DaySessions interfaces above,
// no separate WeeklySession type needed)
// ============================================
export interface WeeklySessionsResponse {
  weekStart: string;
  weekEnd: string;
  days: DaySessions[];
}

// ============================================
// View-model helpers used inside the component
// ============================================
export interface CalendarDayCell {
  dayNumber: number;
  date: Date | null; // null for empty/padding cells
  status: 'completed' | 'upcoming' | 'missed' | 'none';
  isToday: boolean;
}

export interface ProgressMarker {
  index: number; // 1-based session order
  isCompleted: boolean;
}

export interface UpcomingSession {
  sessionId: number;
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
  time: string;
  durationMinutes: number;
  meetingLink: string | null;
}