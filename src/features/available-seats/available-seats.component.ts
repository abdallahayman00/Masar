import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailableSeatsService } from '../../core/services/available-seats.service';
import { AvailableSeatItem } from '../../core/interfaces/available-seats';
import { FilterSectionComponent } from '../filter-section/filter-section.component';
import { FilterParams } from '../../core/interfaces/filter-params';

@Component({
  selector: 'app-available-seats',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSectionComponent],
  templateUrl: './available-seats.component.html',
  styleUrls: ['./available-seats.component.scss'],
})
export class AvailableSeatsComponent implements OnInit {
  slots: AvailableSeatItem[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  filterParams: Partial<FilterParams> = {};

  // استخدام الخدمة الجديدة
  constructor(private availableSeatsService: AvailableSeatsService) {}

  ngOnInit(): void {
    this.loadSlots();
  }

  loadSlots(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.availableSeatsService
      .getAvailableSeats(this.currentPage, this.pageSize, {
        teacherId: this.filterParams.teacherId,
        isBooked: this.filterParams.isBooked,
        isCompleted: this.filterParams.isCompleted,
        searchTeacher: this.filterParams.searchTeacher,
        searchTrack: this.filterParams.searchTrack,
      })
      .subscribe({
        next: (response) => {
          this.slots = response.data;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading available seats:', err);
          this.errorMessage =
            'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
          this.isLoading = false;
        },
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSlots();
  }

  onFilterApplied(filters: FilterParams): void {
    this.filterParams = {
      teacherId: filters.teacherId,
      isBooked: filters.isBooked,
      isCompleted: filters.isCompleted,
      searchTeacher: filters.searchTeacher,
      searchTrack: filters.searchTrack,
    };
    this.currentPage = 1;
    this.loadSlots();
  }

  getBookedText(isBooked: boolean): string {
    return isBooked ? 'محجوز' : 'متاح';
  }

  getCompletedText(isCompleted: boolean): string {
    return isCompleted ? 'مكتمل' : 'قيد الانتظار';
  }
}
