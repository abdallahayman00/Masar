import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { TracksService } from '../../core/services/tracks.service';
import { StudentTracks } from '../../core/interfaces/student-tracks';
import { AvailableTracks } from '../../core/interfaces/available-tracks';
import { CommonModule } from '@angular/common';
import { NgFor, NgIf } from '@angular/common';
import { ArabicNumberPipe } from '../../core/pipes/arabic-number.pipe';

@Component({
  selector: 'app-student-tracks',
  imports: [CommonModule, NgFor, NgIf, ArabicNumberPipe],
  templateUrl: './student-tracks.component.html',
  styleUrl: './student-tracks.component.scss',
})
export class StudentTracksComponent implements OnInit {
  studentTracksData: StudentTracks[] = [];
  isLoading: boolean = false;
  hasError: boolean = false;

  private readonly studentService = inject(StudentService);
  private readonly tracksService = inject(TracksService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getStudentTracks();
  }

  getStudentTracks() {
    const studentId =
      localStorage.getItem('studentId') || sessionStorage.getItem('studentId');

    if (!studentId) {
      console.warn('لا يوجد studentId مخزن');
      this.hasError = true;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.studentService.getStudentTracks(+studentId).subscribe({
      next: (res) => {
        console.log(res);
        this.studentTracksData = res;
        this.isLoading = false;
        this.mergeTrackSessionCounts();
      },
      error: (err) => {
        // الـ API بيرجع 404 لما الطالب ماعندوش مسارات — ده مش خطأ، ده حالة فاضية
        if (err?.status === 404) {
          this.studentTracksData = [];
        } else {
          console.error('خطأ في تحميل المسارات:', err);
          this.hasError = true;
        }
        this.isLoading = false;
      },
    });
  }

  // totalSessions اللي بيرجعها الحجز مش دايمًا بتوافق تعريف التراك —
  // نجيب numberOfSessions من GetAllTracksForStu ونركّبها بالـ trackId
  private mergeTrackSessionCounts(): void {
    this.tracksService.getAllTracksForStu().subscribe({
      next: (tracks: AvailableTracks[]) => {
        const byId = new Map(tracks.map((t) => [t.trackId, t.numberOfSessions]));
        for (const track of this.studentTracksData) {
          const total = byId.get(track.trackId);
          if (total != null) {
            track.totalSessions = total;
            track.remainingSessions = Math.max(
              total - track.completedSessions,
              0,
            );
          }
        }
      },
      error: () => {
        // لو فشل، نسيب أرقام الحجز زي ما هي
      },
    });
  }

  getProgressPercent(track: StudentTracks): number {
    if (!track.totalSessions || track.totalSessions === 0) return 0;
    return Math.round((track.completedSessions / track.totalSessions) * 100);
  }

  navigateToTrack(track: StudentTracks): void {
    this.router.navigate(['track-details', track.trackId]);
  }
}
