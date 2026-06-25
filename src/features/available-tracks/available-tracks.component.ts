import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TracksService } from '../../core/services/tracks.service';
import { AvailableTracks } from '../../core/interfaces/available-tracks';
import { CurrencyFormatPipe } from '../../core/pipes/currency-format.pipe';


@Component({
  selector: 'app-available-tracks',
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './available-tracks.component.html',
  styleUrl: './available-tracks.component.scss'
})
export class AvailableTracksComponent implements OnInit {

  private readonly tracksService = inject(TracksService);
  private readonly router = inject(Router);

  tracks: AvailableTracks[] = [];
  selectedTrack: AvailableTracks | null = null;
  showDialog = false;
  isLoading = true;
  error = false;

  ngOnInit(): void {
    this.getAllTracksForStu();
  }

  getAllTracksForStu(): void {
    this.isLoading = true;
    this.error = false;
    this.tracksService.getAllTracksForStu().subscribe({
      next: (res) => {
        this.tracks = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  openDialog(track: AvailableTracks): void {
    this.selectedTrack = track;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedTrack = null;
  }

  goToSelectTeacher(): void {
    if (!this.selectedTrack) return;
    const trackId = this.selectedTrack.trackId;
    this.closeDialog();
    this.router.navigate(['/select-teacher', trackId]);
  }

  truncateDesc(desc: string | null, maxLength = 80): string {
    if (!desc) return '';
    return desc.length > maxLength ? desc.slice(0, maxLength) + '...' : desc;
  }
}