// available-times.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AvailableSlotsService,
  AvailableSlot,
  DeleteResponse,
  CreateSlotRequest,
  CreateSlotResponse,
} from '../../core/services/available-slots.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-available-times',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './available-times.component.html',
  styleUrl: './available-times.component.scss',
})
export class AvailableTimesComponent implements OnInit {
  availableSlots: AvailableSlot[] = [];
  filteredSlots: AvailableSlot[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  isDeleting: boolean = false;
  isCreating: boolean = false;
  submitted: boolean = false; // للتحقق من الـ Form Submit

  // Stats
  availableCount: number = 0;
  bookedCount: number = 0;
  availablePercentage: number = 0;
  bookedPercentage: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // View Modal
  showModal: boolean = false;
  selectedSlot: AvailableSlot | null = null;

  // Create Modal
  showCreateModal: boolean = false;
  newSlot: CreateSlotRequest = {
    teacherId: 36,
    firstDay: '',
    secondDay: '',
    sessionTime: '',
    color: '#e8d5c4',
  };

  // Time Picker Variables (12-hour format with AM/PM)
  selectedHour: string = '12';
  selectedMinute: string = '00';
  selectedSecond: string = '00';
  selectedPeriod: string = 'ص';

  // Time options (1-12)
  hours: string[] = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0'),
  );
  minutes: string[] = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  seconds: string[] = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  periods: string[] = ['ص', 'م'];

  // أيام الأسبوع
  daysOfWeek: string[] = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  // ألوان مقترحة (ألوان هادية)
  presetColors: string[] = [
    '#e8d5c4',
    '#d4c5b5',
    '#f5e6d3',
    '#e8dcc8',
    '#d5c5b0',
    '#f0e3d5',
    '#e0d0c0',
    '#c9bdb0',
    '#dccfc4',
    '#e8ddd0',
  ];

  teacherId: number = 36;

  constructor(private availableSlotsService: AvailableSlotsService) {}

  ngOnInit(): void {
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.availableSlotsService.getAvailableSlots(this.teacherId).subscribe({
      next: (data) => {
        this.availableSlots = data;
        this.filteredSlots = data;
        this.calculateStats();
        this.updatePagination();
        this.isLoading = false;
        console.log('Available slots loaded:', data);
      },
      error: (err) => {
        this.errorMessage =
          'فشل في تحميل المواعيد المتاحة. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
        console.error('Error loading available slots:', err);
      },
    });
  }

  calculateStats(): void {
    this.availableCount = this.availableSlots.filter((s) => !s.isBooked).length;
    this.bookedCount = this.availableSlots.filter((s) => s.isBooked).length;
    const total = this.availableSlots.length;
    this.availablePercentage =
      total > 0 ? Math.round((this.availableCount / total) * 100) : 0;
    this.bookedPercentage =
      total > 0 ? Math.round((this.bookedCount / total) * 100) : 0;
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSlots.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();
    if (searchTerm) {
      this.filteredSlots = this.availableSlots.filter(
        (slot) =>
          slot.time.includes(searchTerm) ||
          slot.firstDay.includes(searchTerm) ||
          slot.secondDay.includes(searchTerm),
      );
    } else {
      this.filteredSlots = [...this.availableSlots];
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  viewSlotDetails(slot: AvailableSlot): void {
    this.selectedSlot = slot;
    this.showModal = true;
  }

  // ============================================================
  // TIME PICKER CONTROLS (12-hour format with AM/PM)
  // ============================================================
  updateTime(): void {
    // Convert 12-hour to 24-hour format
    let hour = parseInt(this.selectedHour);
    if (this.selectedPeriod === 'م' && hour !== 12) {
      hour += 12;
    } else if (this.selectedPeriod === 'ص' && hour === 12) {
      hour = 0;
    }
    const hour24 = hour.toString().padStart(2, '0');
    this.newSlot.sessionTime = `${hour24}:${this.selectedMinute}:${this.selectedSecond}`;
  }

  isTimeInvalid(): boolean {
    return (
      this.selectedHour === '00' &&
      this.selectedMinute === '00' &&
      this.selectedSecond === '00'
    );
  }

  incrementHour(): void {
    let hour = parseInt(this.selectedHour);
    hour = (hour % 12) + 1;
    this.selectedHour = hour.toString().padStart(2, '0');
    this.updateTime();
  }

  decrementHour(): void {
    let hour = parseInt(this.selectedHour);
    hour = hour === 1 ? 12 : hour - 1;
    this.selectedHour = hour.toString().padStart(2, '0');
    this.updateTime();
  }

  incrementMinute(): void {
    let minute = parseInt(this.selectedMinute);
    minute = (minute + 1) % 60;
    this.selectedMinute = minute.toString().padStart(2, '0');
    this.updateTime();
  }

  decrementMinute(): void {
    let minute = parseInt(this.selectedMinute);
    minute = (minute - 1 + 60) % 60;
    this.selectedMinute = minute.toString().padStart(2, '0');
    this.updateTime();
  }

  incrementSecond(): void {
    let second = parseInt(this.selectedSecond);
    second = (second + 1) % 60;
    this.selectedSecond = second.toString().padStart(2, '0');
    this.updateTime();
  }

  decrementSecond(): void {
    let second = parseInt(this.selectedSecond);
    second = (second - 1 + 60) % 60;
    this.selectedSecond = second.toString().padStart(2, '0');
    this.updateTime();
  }

  togglePeriod(): void {
    this.selectedPeriod = this.selectedPeriod === 'ص' ? 'م' : 'ص';
    this.updateTime();
  }

  // ============================================================
  // CREATE SLOT
  // ============================================================
  openCreateModal(): void {
    this.showCreateModal = true;
    this.submitted = false;
    this.newSlot = {
      teacherId: this.teacherId,
      firstDay: '',
      secondDay: '',
      sessionTime: '',
      color: '#e8d5c4',
    };
    // Reset time picker
    this.selectedHour = '12';
    this.selectedMinute = '00';
    this.selectedSecond = '00';
    this.selectedPeriod = 'ص';
    this.updateTime();
  }

  selectColor(color: string): void {
    this.newSlot.color = color;
  }

  createSlot(): void {
    this.submitted = true;

    // Validation - اليوم الأول
    if (!this.newSlot.firstDay) {
      Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'يرجى اختيار اليوم الأول',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    // Validation - اليوم الثاني
    if (!this.newSlot.secondDay) {
      Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'يرجى اختيار اليوم الثاني',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    // Validation - الوقت
    if (this.isTimeInvalid()) {
      Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'يرجى اختيار الوقت',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    this.isCreating = true;

    this.availableSlotsService.createAvailableSlot(this.newSlot).subscribe({
      next: (response: CreateSlotResponse) => {
        Swal.fire({
          icon: 'success',
          title: 'تم الإضافة بنجاح',
          text: response.message || 'تم إضافة الموعد الجديد بنجاح',
          confirmButtonColor: '#22c55e',
          confirmButtonText: 'حسناً',
          timer: 3000,
          timerProgressBar: true,
        });

        this.closeCreateModal();
        this.loadAvailableSlots();
        this.isCreating = false;
      },
      error: (err) => {
        let errorMessage = 'حدث خطأ أثناء إضافة الموعد';

        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'فشل الإضافة',
          text: errorMessage,
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'حسناً',
        });

        this.isCreating = false;
        console.error('Error creating slot:', err);
      },
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.isCreating = false;
    this.submitted = false;
  }

  // ============================================================
  // DELETE SLOT
  // ============================================================
  deleteSlot(slotId: number): void {
    const slot = this.availableSlots.find((s) => s.id === slotId);
    if (slot?.isBooked) {
      Swal.fire({
        icon: 'error',
        title: 'لا يمكن الحذف',
        text: 'لا يمكن حذف هذا الموعد لأنه محجوز بالفعل',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `هل تريد حذف الموعد الساعة ${slot?.time} في يوم ${slot?.firstDay}؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDelete(slotId);
      }
    });
  }

  performDelete(slotId: number): void {
    this.isDeleting = true;

    this.availableSlotsService.deleteAvailableSlot(slotId).subscribe({
      next: (response: DeleteResponse) => {
        Swal.fire({
          icon: 'success',
          title: 'تم الحذف بنجاح',
          text: response.message || 'تم حذف الموعد بنجاح',
          confirmButtonColor: '#22c55e',
          confirmButtonText: 'حسناً',
          timer: 3000,
          timerProgressBar: true,
        });

        this.availableSlots = this.availableSlots.filter(
          (s) => s.id !== slotId,
        );
        this.filteredSlots = this.filteredSlots.filter((s) => s.id !== slotId);

        this.calculateStats();
        this.updatePagination();
        this.isDeleting = false;

        if (this.showModal && this.selectedSlot?.id === slotId) {
          this.closeModal();
        }
      },
      error: (err) => {
        let errorMessage = 'حدث خطأ أثناء حذف الموعد';

        if (err.status === 400 && err.error?.includes('already booked')) {
          errorMessage = 'لا يمكن حذف هذا الموعد لأنه محجوز بالفعل';
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'فشل الحذف',
          text: errorMessage,
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'حسناً',
        });

        this.isDeleting = false;
        console.error('Error deleting slot:', err);
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSlot = null;
  }
}
