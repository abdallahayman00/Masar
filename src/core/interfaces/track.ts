// track.interface.ts - أضف هذه الخاصية
export interface Track {
  id?: number;
  trackId?: number;
  name?: string;
  trackName?: string;
  description?: string;
  numberOfSessions?: number;
  sessionDuration?: number;
  sessionMinutes?: number;
  sessionPrice?: number;
  trackPrice?: number;
  price?: number;
  coverImagePath?: string;
  trackPhoto?: string;
  trackFilePath?: string; // ✅ أضف هذا السطر
  attachments?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
}

// تحديث دالة normalizeTrack
export function normalizeTrack(apiTrack: any): Track {
  const sessionPrice = apiTrack.sessionPrice || 0;
  const numberOfSessions = apiTrack.numberOfSessions || 0;
  const totalPrice =
    apiTrack.price || apiTrack.trackPrice || sessionPrice * numberOfSessions;

  return {
    id: apiTrack.trackId || apiTrack.id,
    trackId: apiTrack.trackId,
    name: apiTrack.trackName || apiTrack.name,
    trackName: apiTrack.trackName,
    description: apiTrack.description,
    numberOfSessions: numberOfSessions,
    sessionDuration: apiTrack.sessionMinutes,
    sessionMinutes: apiTrack.sessionMinutes,
    sessionPrice: sessionPrice,
    trackPrice: totalPrice,
    price: totalPrice,
    coverImagePath: apiTrack.trackPhoto || apiTrack.coverImagePath,
    trackPhoto: apiTrack.trackPhoto,
    trackFilePath: apiTrack.trackFilePath, // ✅ أضف هذا السطر
    attachments: apiTrack.attachments,
    createdAt: apiTrack.createdAt,
    updatedAt: apiTrack.updatedAt,
    isActive: apiTrack.isActive,
  };
}
