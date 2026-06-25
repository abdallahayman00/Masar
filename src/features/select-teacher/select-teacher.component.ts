import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TeacherService } from '../../core/services/teacher.service';
import { StudentService } from '../../core/services/student.service';
import { Teacher, Slot } from '../../core/interfaces/select-teacher';
import { TracksService } from '../../core/services/tracks.service';
import { AvailableTracks } from '../../core/interfaces/available-tracks';

@Component({
  selector: 'app-select-teacher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-teacher.component.html',
  styleUrl: './select-teacher.component.scss'
})
export class SelectTeacherComponent implements OnInit {

  private readonly teacherService = inject(TeacherService);
  private readonly studentService = inject(StudentService);
  private readonly tracksService = inject(TracksService)
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly TRANSFER_NUMBER = '01012345678';

  trackId!: number;
  trackPrice: number | null = null;

  teachers: Teacher[] = [];
  slots: { [teacherId: number]: Slot[] } = {};
  slotsLoading: { [teacherId: number]: boolean } = {};
  openTeacherId: number | null = null;
  isLoading = true;
  error = false;

  // Dialog state
  showDialog = false;
  showPending = false;
  selectedTeacher: Teacher | null = null;
  selectedSlot: Slot | null = null;
  isBooking = false;
  showError = false;
  bookingError = '';

  ngOnInit(): void {
    this.trackId = Number(this.route.snapshot.paramMap.get('trackId'));
    this.getAllTeachers();
    this.getAvailableTracksForStu();
  }

  getAvailableTracksForStu(): void {
    this.tracksService.getAllTracksForStu().subscribe({
      next: (res) => {
        const currentTrack = res.find((track: AvailableTracks) => track.trackId === this.trackId);
        this.trackPrice = currentTrack ? currentTrack.price : null;
      }
    });
  }

  getAllTeachers(): void {
    this.isLoading = true;
    this.error = false;
    this.teacherService.getAllTeachersForStu().subscribe({
      next: (res) => {
        this.teachers = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  toggleTeacher(teacher: Teacher): void {
    if (this.openTeacherId === teacher.teacherId) {
      this.openTeacherId = null;
      return;
    }
    this.openTeacherId = teacher.teacherId;
    if (!this.slots[teacher.teacherId]) {
      this.slotsLoading[teacher.teacherId] = true;
      this.teacherService.getAvailableDate(teacher.teacherId).subscribe({
        next: (res) => {
          this.slots[teacher.teacherId] = res;
          this.slotsLoading[teacher.teacherId] = false;
        },
        error: () => {
          this.slotsLoading[teacher.teacherId] = false;
        }
      });
    }
  }

  isOpen(teacherId: number): boolean {
    return this.openTeacherId === teacherId;
  }

  getSlots(teacherId: number): Slot[] {
    return this.slots[teacherId] || [];
  }

  getInitial(name: string): string {
    return name.trim()[0];
  }

  openDialog(teacher: Teacher, slot: Slot): void {
    this.selectedTeacher = teacher;
    this.selectedSlot = slot;
    this.showDialog = true;
    this.showPending = false;
    this.showError = false;
    this.bookingError = '';
  }

  closeDialog(): void {
    this.showDialog = false;
    this.showPending = false;
    this.selectedTeacher = null;
    this.selectedSlot = null;
    this.showError = false;
    this.bookingError = '';
  }

  confirmBooking(): void {
    if (!this.selectedTeacher || !this.selectedSlot) return;

    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');

    if (!studentId) {
      this.bookingError = 'حدث خطأ في بيانات الطالب، يرجى تسجيل الدخول مرة أخرى';
      this.showError = true;
      return;
    }

    this.isBooking = true;

    const bookingData = {
      studentId: Number(studentId),
      teacherId: this.selectedTeacher.teacherId,
      availabilityId: this.selectedSlot.id,
      trackId: this.trackId
    };

    this.studentService.booking(bookingData).subscribe({
      next: () => {
        this.isBooking = false;
        this.showPending = true;
      },
      error: (err) => {
        this.isBooking = false;
        const msg = err?.error;
        if (typeof msg === 'string') {
          this.bookingError = msg;
        } else {
          this.bookingError = 'حدث خطأ أثناء الحجز، حاول مرة أخرى';
        }
        this.showError = true;
      }
    });
  }

  getTimeLabel(time: string): { formatted: string; period: string } {
    if (!time) return { formatted: '', period: '' };
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours < 12 ? 'صباحاً' : 'مساءً';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return { formatted: `${h}:${m}`, period };
  }

  goToTracks(): void {
    this.closeDialog();
    this.router.navigate(['/available-tracks']);
  }
}