export interface AvailableTracks {
  trackId: number;
  trackName: string;
  description: string | null;
  numberOfSessions: number;
  sessionMinutes: number;
  price: number;
  trackFilePath: string | null;
  trackPhoto: string | null;
  sessionPrice: number;
}
