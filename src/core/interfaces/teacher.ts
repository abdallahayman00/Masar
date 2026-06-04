// teacher-requests.component.ts
export interface Teacher {
  teacherId: number;
  userId: number;
  fullName: string;
  email: string;
  whatsAppNumber: string;
  gender: string;
  age: string | number;
  nationality: string;
  summary: string;
  profileImagePath: string | null;
  isApproved: boolean;
}

// واجهة للـ Response كاملة لتسهيل التعامل مع الـ Pagination
export interface ApiResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Teacher[];
}
