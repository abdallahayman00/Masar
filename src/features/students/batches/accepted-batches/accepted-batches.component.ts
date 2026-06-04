import { Component, OnInit } from '@angular/core';
import { AcceptedBatch } from '../../../../core/interfaces/accepted-batch';
import { AcceptedBatchesService } from '../../../../core/services/accepted-batches.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accepted-batches',
  templateUrl: './accepted-batches.component.html',
  imports: [CommonModule], // 🔥 الحل الأساسي
  styleUrls: ['./accepted-batches.component.scss'],
})
export class AcceptedBatchesComponent implements OnInit {
  acceptedBatches: AcceptedBatch[] = [];
  filteredBatches: AcceptedBatch[] = [];

  totalCount = 0;
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';

  constructor(private acceptedBatchesService: AcceptedBatchesService) {}

  ngOnInit(): void {
    this.loadAcceptedBatches();
  }

  loadAcceptedBatches(): void {
    this.acceptedBatchesService.getAcceptedBatches().subscribe({
      next: (data) => {
        this.acceptedBatches = data;
        this.filteredBatches = [...data];
        this.totalCount = data.length;
      },
      error: (err) => {
        console.error('Error loading accepted batches', err);
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.searchTerm = value;

    this.filteredBatches = this.acceptedBatches.filter(
      (batch) =>
        batch.studentName.toLowerCase().includes(value) ||
        batch.teacherName.toLowerCase().includes(value) ||
        batch.trackName.toLowerCase().includes(value),
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  viewBatch(batch: AcceptedBatch): void {
    console.log('View Batch', batch);
  }

  getInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#E8F5E9', '#FFF8E1', '#E3F2FD', '#F3E5F5', '#FBE9E7'];

    const index = name.length % colors.length;
    return colors[index];
  }

  getAvatarTextColor(name: string): string {
    const colors = ['#2E7D32', '#B28704', '#1565C0', '#7B1FA2', '#D84315'];

    const index = name.length % colors.length;
    return colors[index];
  }

  trackByBooking(index: number, item: AcceptedBatch): number {
    return item.bookingId;
  }
}
