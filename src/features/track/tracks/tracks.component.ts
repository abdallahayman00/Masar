// tracks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TracksService } from '../../../core/services/tracks.service';
import { Track } from '../../../core/interfaces/track';
import { ToastService } from '../../../core/services/toast.service'; // ✅ أضف هذا
import { ToastComponent } from '../../../features/toast/toast/toast.component'; // ✅ أضف هذا
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tracks',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss'],
})
export class TracksComponent implements OnInit {
  // قائمة المسارات
  tracks: Track[] = [];
  filteredTracks: Track[] = [];

  // نموذج إضافة مسار جديد
  newTrack: any = {
    TrackName: '',
    description: '',
    NumberOfSessions: 0,
    SessionMinutes: 0,
    SessionPrice: 0,
    Price: 0,
    File: undefined,
    TrackPhoto: undefined,
  };

  // ✅ متغير للتحكم في صلاحيات المستخدم
  isAdmin: boolean = false;
  isTeacher: boolean = false;
  isStudent: boolean = false;
  // الملفات المرفوعة
  selectedFile: File | null = null;
  selectedPhoto: File | null = null;

  // حالات التحميل
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // البحث والفلترة
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // التقسيم (Pagination)
  currentPage: number = 1;
  pageSize: number = 10; // changed to 10 for better display in table
  totalPages: number = 1;

  // المودالات
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  selectedTrack: Track | null = null;
  // أضف هذه المتغيرات الجديدة
  showEditModal: boolean = false;
  editingTrack: any = {
    TrackId: null,
    TrackName: '',
    description: '',
    NumberOfSessions: 0,
    SessionMinutes: 0,
    SessionPrice: 0,
    Price: 0,
    existingFile: null,
    existingPhoto: null,
  };
  editSelectedFile: File | null = null;
  editSelectedPhoto: File | null = null;

  constructor(
    private tracksService: TracksService,
    private toastService: ToastService, // ✅ أضف هذا السطر
  ) {}
  ngOnInit(): void {
    this.loadTracks();
    this.checkStoredTokens(); // اتصل بها هنا مؤقتاً
    this.loadUserRole(); // ✅ تحميل دور المستخدم
  }

  // ================ تحميل المسارات ================
  loadTracks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tracksService.getAllTracks().subscribe({
      next: (tracks) => {
        this.tracks = tracks;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }
  private loadUserRole(): void {
    const role =
      localStorage.getItem('role') || sessionStorage.getItem('role') || '';
    this.isAdmin = role.toLowerCase() === 'admin';
    this.isTeacher = role.toLowerCase() === 'teacher';
    this.isStudent = role.toLowerCase() === 'student';

    console.log('👤 User role:', role);
    console.log('isAdmin:', this.isAdmin);
    console.log('isTeacher:', this.isTeacher);
    console.log('isStudent:', this.isStudent);
  }
  // ================ تطبيق الفلترة ================
  applyFilters(): void {
    let filtered = [...this.tracks];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (track) =>
          track.name?.toLowerCase().includes(term) ||
          false ||
          track.description?.toLowerCase().includes(term) ||
          false,
      );
    }

    if (this.minPrice) {
      filtered = filtered.filter(
        (track) => (this.calculateTotalPrice(track) || 0) >= this.minPrice!,
      );
    }

    if (this.maxPrice) {
      filtered = filtered.filter(
        (track) => (this.calculateTotalPrice(track) || 0) <= this.maxPrice!,
      );
    }

    this.filteredTracks = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  // ================ إعادة تعيين الفلترة ================
  resetFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  // ================ تحديث التقسيم ================
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTracks.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  // ================ الحصول على المسارات المعروضة في الصفحة الحالية ================
  getPaginatedTracks(): Track[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTracks.slice(startIndex, startIndex + this.pageSize);
  }

  // ================ تغيير الصفحة ================
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ================ الحصول على أرقام الصفحات ================
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ================ الحصول على القيمة الأصغر (لصفحات الترقيم) ================
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ================ حساب السعر الإجمالي للمسار ================
  calculateTotalPrice(track: Track): number {
    // إذا كان السعر الإجمالي موجوداً من الـ API
    if (track.trackPrice) return track.trackPrice;
    if (track.price) return track.price;

    // حساب السعر الإجمالي = سعر الحصة × عدد الحصص
    const sessionPrice = track.sessionPrice || 0;
    const numberOfSessions = track.numberOfSessions || 0;
    return sessionPrice * numberOfSessions;
  }

  // ================ تنسيق السعر ================
  formatPrice(price: number = 0): string {
    return price.toLocaleString('ar-EG') + ' ج.م';
  }

  // ================ الحصول على الحروف الأولى من الاسم ================
  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // ================ الحصول على لون عشوائي ================
  getRandomColor(seed: string = ''): string {
    const colors = [
      '#10B981',
      '#3B82F6',
      '#6366F1',
      '#8B5CF6',
      '#EC4899',
      '#F43F5E',
      '#F59E0B',
      '#84CC16',
      '#06B6D4',
      '#EF4444',
      '#A855F7',
      '#14B8A6',
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // ================ معالجة اختيار الملفات ================
  onFileSelected(event: Event, type: 'file' | 'photo'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'file') {
        this.selectedFile = file;
        this.newTrack.File = file;
      } else {
        this.selectedPhoto = file;
        this.newTrack.TrackPhoto = file;
      }
    }
  }
  // أضف هذه الدالة في TracksComponent
  checkStoredTokens() {
    console.log('========== CHECKING STORED TOKENS ==========');
    console.log(
      'localStorage.getItem("token"):',
      localStorage.getItem('token'),
    );
    console.log(
      'localStorage.getItem("authToken"):',
      localStorage.getItem('authToken'),
    );
    console.log(
      'sessionStorage.getItem("token"):',
      sessionStorage.getItem('token'),
    );
    console.log(
      'sessionStorage.getItem("authToken"):',
      sessionStorage.getItem('authToken'),
    );
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('=============================================');
  }
  // ================ إضافة مسار جديد ================
  addNewTrack(): void {
    // تحويل القيم إلى أرقام
    const numberOfSessions = Number(this.newTrack.NumberOfSessions);
    const sessionMinutes = Number(this.newTrack.SessionMinutes);
    const sessionPrice = Number(this.newTrack.SessionPrice);
    const price = Number(this.newTrack.Price);

    // التحقق من صحة البيانات
    if (!this.newTrack.TrackName?.trim()) {
      this.toastService.error('يرجى إدخال اسم المسار', 'بيانات ناقصة');
      return;
    }

    if (!this.newTrack.description?.trim()) {
      this.toastService.error('يرجى إدخال وصف المسار', 'بيانات ناقصة');
      return;
    }

    if (isNaN(numberOfSessions) || numberOfSessions <= 0) {
      this.toastService.error(
        'يرجى إدخال عدد حصص صحيح (أكبر من 0)',
        'بيانات غير صحيحة',
      );
      return;
    }

    if (isNaN(sessionMinutes) || sessionMinutes <= 0) {
      this.toastService.error(
        'يرجى إدخال مدة حصة صحيحة (أكبر من 0)',
        'بيانات غير صحيحة',
      );
      return;
    }

    if (isNaN(sessionPrice) || sessionPrice < 0) {
      this.toastService.error('يرجى إدخال سعر حصة صحيح', 'بيانات غير صحيحة');
      return;
    }

    if (isNaN(price) || price < 0) {
      this.toastService.error('يرجى إدخال سعر مسار صحيح', 'بيانات غير صحيحة');
      return;
    }

    this.isSubmitting = true;

    const trackData = {
      TrackName: this.newTrack.TrackName.trim(),
      description: this.newTrack.description.trim(),
      NumberOfSessions: numberOfSessions,
      SessionMinutes: sessionMinutes,
      SessionPrice: sessionPrice,
      Price: price,
      File: this.selectedFile,
      TrackPhoto: this.selectedPhoto,
    };

    console.log('📤 Sending track data:', trackData);

    this.tracksService.addTrack(trackData).subscribe({
      next: (response) => {
        console.log('✅ Add response:', response);
        this.toastService.success('تم إضافة المسار بنجاح!', 'عملية ناجحة');
        this.resetForm();
        this.closeAddModal();
        this.loadTracks();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Add error:', error);

        let errorMsg = 'حدث خطأ أثناء إضافة المسار';
        if (error.originalError?.error?.errors) {
          const errors = error.originalError.error.errors;
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errors)) {
            errorMessages.push(`${field}: ${(messages as any).join(', ')}`);
          }
          errorMsg = errorMessages.join(' | ');
        } else if (error.message) {
          errorMsg = error.message;
        }

        this.toastService.error(errorMsg, 'فشل الإضافة');
        this.isSubmitting = false;
      },
    });
  }

  // ================ إعادة تعيين النموذج ================
  resetForm(): void {
    this.newTrack = {
      TrackName: '',
      description: '',
      NumberOfSessions: 0,
      SessionMinutes: 0,
      SessionPrice: 0,
      Price: 0,
      File: undefined,
      TrackPhoto: undefined,
    };
    this.selectedFile = null;
    this.selectedPhoto = null;
  }

  // ================ عرض تفاصيل المسار ================
  viewTrackDetails(track: Track): void {
    this.selectedTrack = track;
    this.showViewModal = true;
  }

  // ================ فتح/إغلاق المودالات ================
  openAddModal(): void {
    this.resetForm();
    this.errorMessage = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTrack = null;
  }

  // ================ فتح مودال التعديل ================
  openEditModal(): void {
    if (!this.selectedTrack) return;

    // تجهيز بيانات المسار للتعديل
    this.editingTrack = {
      TrackId: this.selectedTrack.trackId || this.selectedTrack.id,
      TrackName: this.selectedTrack.name || '',
      description: this.selectedTrack.description || '',
      NumberOfSessions: this.selectedTrack.numberOfSessions || 0,
      SessionMinutes:
        this.selectedTrack.sessionDuration ||
        this.selectedTrack.sessionMinutes ||
        0,
      SessionPrice: this.selectedTrack.sessionPrice || 0,
      Price: this.selectedTrack.trackPrice || this.selectedTrack.price || 0,
      existingFile: this.selectedTrack.attachments?.[0] || null,
      existingPhoto:
        this.selectedTrack.coverImagePath ||
        this.selectedTrack.trackPhoto ||
        null,
    };

    this.showEditModal = true;
    this.closeViewModal();
  }
  // ================ فتح مودال التعديل من الجدول مباشرة ================
  openEditModalFromTrack(track: Track): void {
    this.selectedTrack = track;
    this.openEditModal();
  }
  // ================ إغلاق مودال التعديل ================
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingTrack = {
      TrackId: null,
      TrackName: '',
      description: '',
      NumberOfSessions: 0,
      SessionMinutes: 0,
      SessionPrice: 0,
      Price: 0,
      existingFile: null,
      existingPhoto: null,
    };
    this.editSelectedFile = null;
    this.editSelectedPhoto = null;
  }

  // ================ معالجة اختيار الملفات في التعديل ================
  onEditFileSelected(event: Event, type: 'file' | 'photo'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'file') {
        this.editSelectedFile = file;
      } else {
        this.editSelectedPhoto = file;
      }
    }
  }

  // ================ تحديث المسار ================// ================ تحديث المسار ================
  updateTrack(): void {
    // التحقق من صحة البيانات
    if (!this.editingTrack.TrackName?.trim()) {
      this.toastService.error('يرجى إدخال اسم المسار', 'بيانات ناقصة');
      return;
    }

    if (!this.editingTrack.description?.trim()) {
      this.toastService.error('يرجى إدخال وصف المسار', 'بيانات ناقصة');
      return;
    }

    const numberOfSessions = Number(this.editingTrack.NumberOfSessions);
    const sessionMinutes = Number(this.editingTrack.SessionMinutes);
    const sessionPrice = Number(this.editingTrack.SessionPrice);
    const price = Number(this.editingTrack.Price);

    if (isNaN(numberOfSessions) || numberOfSessions <= 0) {
      this.toastService.error(
        'يرجى إدخال عدد حصص صحيح (أكبر من 0)',
        'بيانات غير صحيحة',
      );
      return;
    }

    if (isNaN(sessionMinutes) || sessionMinutes <= 0) {
      this.toastService.error(
        'يرجى إدخال مدة حصة صحيحة (أكبر من 0)',
        'بيانات غير صحيحة',
      );
      return;
    }

    if (isNaN(sessionPrice) || sessionPrice < 0) {
      this.toastService.error('يرجى إدخال سعر حصة صحيح', 'بيانات غير صحيحة');
      return;
    }

    if (isNaN(price) || price < 0) {
      this.toastService.error('يرجى إدخال سعر مسار صحيح', 'بيانات غير صحيحة');
      return;
    }

    this.isSubmitting = true;

    const trackData = {
      TrackId: this.editingTrack.TrackId,
      TrackName: this.editingTrack.TrackName.trim(),
      description: this.editingTrack.description.trim(),
      NumberOfSessions: numberOfSessions,
      SessionMinutes: sessionMinutes,
      SessionPrice: sessionPrice,
      Price: price,
      File: this.editSelectedFile,
      TrackPhoto: this.editSelectedPhoto,
    };

    console.log('📤 Updating track:', trackData);

    this.tracksService
      .updateTrack(this.editingTrack.TrackId, trackData)
      .subscribe({
        next: (response) => {
          console.log('✅ Update response:', response);
          this.toastService.success('تم تحديث المسار بنجاح!', 'عملية ناجحة');
          this.closeEditModal();
          this.loadTracks();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Update error:', error);

          let errorMsg = 'حدث خطأ أثناء تحديث المسار';
          if (error.originalError?.error?.errors) {
            const errors = error.originalError.error.errors;
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errors)) {
              errorMessages.push(`${field}: ${(messages as any).join(', ')}`);
            }
            errorMsg = errorMessages.join(' | ');
          } else if (error.message) {
            errorMsg = error.message;
          }

          this.toastService.error(errorMsg, 'فشل التحديث');
          this.isSubmitting = false;
        },
      });
  }
  // ================ حذف المسار (نسخة متقدمة) ================
  // ================ حذف المسار ================
  deleteTrack(track: Track): void {
    const trackId = track.trackId || track.id;
    const trackName = track.name || 'هذا المسار';

    // SweetAlert2 للتأكيد
    Swal.fire({
      title: '🗑️ حذف المسار',
      html: `هل أنت متأكد من حذف <strong>"${trackName}"</strong>؟`,
      text: 'هذا الإجراء لا يمكن التراجع عنه!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true, // ترتيب الأزرار (إلغاء ثم حذف)
      background: '#f7f4ec',
      customClass: {
        title: 'swal-title',
        popup: 'swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // عرض Toast جاري الحذف

        this.tracksService.deleteTrack(trackId!).subscribe({
          next: () => {
            // Toast نجاح
            this.toastService.success(
              `تم حذف "${trackName}" بنجاح`,
              '✅ تم الحذف',
            );
            this.loadTracks();
          },
          error: (error) => {
            // Toast خطأ
            let errorMsg =
              error.message || 'لا يمكن حذف مسار مرتبط بطلبة او معلمين ';
            if (error.status === 401) {
              errorMsg = 'غير مصرح لك بالحذف. يرجى تسجيل الدخول مرة أخرى';
            }
            this.toastService.error(errorMsg, '❌ فشل الحذف');
          },
        });
      } else {
        // Toast إلغاء
        this.toastService.info('تم إلغاء عملية الحذف', 'إلغاء');
      }
    });
  }
  // ================ استخراج اسم الملف من الرابط ================
  getFileNameFromUrl(url: string): string {
    if (!url) return 'ملف';
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    // فك تشفير الاسم إذا كان مشفراً
    try {
      return decodeURIComponent(fileName);
    } catch {
      return fileName;
    }
  }
}
