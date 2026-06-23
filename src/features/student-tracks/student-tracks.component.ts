import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { StudentTracks } from '../../core/interfaces/student-tracks';
import { CommonModule } from '@angular/common'
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-student-tracks',
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './student-tracks.component.html',
  styleUrl: './student-tracks.component.scss'
})
export class StudentTracksComponent implements OnInit{

  studentTracksData!: StudentTracks[]
  isLoading: boolean = false
  hasError: boolean = false

  private readonly studentService = inject(StudentService)
  private readonly router = inject(Router)

  ngOnInit(): void {
    this.getStudentTracks()
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
        console.log(res)
        this.studentTracksData = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('خطأ في تحميل المسارات:', err);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  getProgressPercent(track: any): number {
    if (!track.totalSessions || track.totalSessions === 0) return 0;
    return Math.round((track.completedSessions / track.totalSessions) * 100);
  }

  navigateToTrack(track: StudentTracks): void {
    this.router.navigate(['student-tracks-details', track.trackId]);
  }
}
