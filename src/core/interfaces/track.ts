// track.interface.ts
export interface Track {
  id?: number;
  trackId?: number; // الـ API يستخدم trackId
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
  attachments?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
}

// دالة حساب السعر الإجمالي
export function calculateTotalPrice(track: Track): number {
  // إذا كان السعر الإجمالي موجوداً من الـ API
  if (track.trackPrice) return track.trackPrice;
  if (track.price) return track.price;

  // حساب السعر الإجمالي = سعر الحصة × عدد الحصص
  const sessionPrice = track.sessionPrice || 0;
  const numberOfSessions = track.numberOfSessions || 0;
  return sessionPrice * numberOfSessions;
}

// دالة مساعدة لتوحيد بيانات المسار من الـ API
export function normalizeTrack(apiTrack: any): Track {
  // استخراج القيم الأساسية
  const sessionPrice = apiTrack.sessionPrice || 0;
  const numberOfSessions = apiTrack.numberOfSessions || 0;

  // حساب السعر الإجمالي (إذا كان موجوداً من API استخدمه، وإلا احسبه)
  const totalPrice = apiTrack.price || sessionPrice * numberOfSessions;

  return {
    id: apiTrack.trackId || apiTrack.id,
    trackId: apiTrack.trackId,
    name: apiTrack.trackName || apiTrack.name,
    trackName: apiTrack.trackName,
    description: apiTrack.description,
    numberOfSessions: numberOfSessions,
    sessionDuration: apiTrack.sessionMinutes, // API uses sessionMinutes
    sessionMinutes: apiTrack.sessionMinutes,
    sessionPrice: sessionPrice,
    trackPrice: totalPrice, // السعر الإجمالي المحسوب
    price: totalPrice, // نفس القيمة للتأكد
    coverImagePath: apiTrack.trackPhoto || apiTrack.coverImagePath,
    trackPhoto: apiTrack.trackPhoto,
    attachments: apiTrack.attachments,
    createdAt: apiTrack.createdAt,
    updatedAt: apiTrack.updatedAt,
    isActive: apiTrack.isActive,
  };
}

// دالة لتنسيق السعر
export function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG') + ' ج.م';
}

// دالة للحصول على نص يوضح تفاصيل السعر
export function getPriceDetails(track: Track): string {
  const sessionPrice = track.sessionPrice || 0;
  const numberOfSessions = track.numberOfSessions || 0;
  const totalPrice = calculateTotalPrice(track);

  return `${sessionPrice} ج.م × ${numberOfSessions} حصة = ${formatPrice(totalPrice)}`;
}
