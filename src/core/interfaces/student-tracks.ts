export interface StudentTracks {
  bookingId: number;
  trackId: number;
  trackName: string;
  teacherName: string;
  bookingStatus: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  trackPhoto: string;
}

export type StudentTrack = StudentTracks[];