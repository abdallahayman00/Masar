// student.interface.ts
export interface Student {
  studentId: number;
  fullName: string;
  email: string;
  studentNationality: string;
  whatsAppNumber: string;
  parentWhatsAppNumber: string;
  age: string | number;
  nationalId: string;
  gender: string;
  residenceCountry: string;
  isFinishedExam?: boolean;
  profileImagePath?: string;
  userId?: number;
  summary?: string;
}
