import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FilterParams,
  FilterConfig,
} from '../../core/interfaces/filter-params';

@Component({
  selector: 'app-filter-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss'],
})
export class FilterSectionComponent implements OnInit, OnDestroy {
  @Input() config: FilterConfig = {
    showEmail: true,
    showWhatsApp: true,
    showGender: true,
    showAgeRange: true,
    showSortOrder: true,
    showSearchName: true,
    placeholderText: 'بحث بالاسم أو البريد...',
    title: 'فلترة متقدمة',
  };

  @Output() filterChange = new EventEmitter<FilterParams>();
  @Output() filterApply = new EventEmitter<FilterParams>();

  isExpanded = false;
  private filterDebounceTimer: any;

  filters: FilterParams = {
    searchName: '',
    searchEmail: '',
    searchWhatsApp: '',
    gender: '',
    minAge: null,
    maxAge: null,
    sortOrder: '',
    teacherName: '',
    studentName: '',
    trackName: '',
    from: '',
    to: '',
    // جدد
    teacherId: null,
    isBooked: null,
    isCompleted: null,
    searchTeacher: '',
    searchTrack: '',
  };

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.searchName ||
      this.filters.searchEmail ||
      this.filters.searchWhatsApp ||
      this.filters.gender ||
      this.filters.minAge ||
      this.filters.maxAge ||
      this.filters.sortOrder ||
      this.filters.teacherName ||
      this.filters.studentName ||
      this.filters.trackName ||
      this.filters.from ||
      this.filters.to ||
      this.filters.teacherId !== null ||
      this.filters.isBooked !== null ||
      this.filters.isCompleted !== null ||
      this.filters.searchTeacher ||
      this.filters.searchTrack
    );
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filters.searchName) count++;
    if (this.filters.searchEmail) count++;
    if (this.filters.searchWhatsApp) count++;
    if (this.filters.gender) count++;
    if (this.filters.minAge) count++;
    if (this.filters.maxAge) count++;
    if (this.filters.sortOrder) count++;
    if (this.filters.teacherName) count++;
    if (this.filters.studentName) count++;
    if (this.filters.trackName) count++;
    if (this.filters.from) count++;
    if (this.filters.to) count++;
    if (this.filters.teacherId !== null) count++;
    if (this.filters.isBooked !== null) count++;
    if (this.filters.isCompleted !== null) count++;
    if (this.filters.searchTeacher) count++;
    if (this.filters.searchTrack) count++;
    return count;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
    }
  }

  toggleFilter(): void {
    this.isExpanded = !this.isExpanded;
  }

  onFilterInputChange(): void {
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
    }
    this.filterDebounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  applyFilters(): void {
    this.filterApply.emit({ ...this.filters });
  }

  clearAllFilters(): void {
    this.filters = {
      searchName: '',
      searchEmail: '',
      searchWhatsApp: '',
      gender: '',
      minAge: null,
      maxAge: null,
      sortOrder: '',
      teacherName: '',
      studentName: '',
      trackName: '',
      from: '',
      to: '',
      teacherId: null,
      isBooked: null,
      isCompleted: null,
      searchTeacher: '',
      searchTrack: '',
    };
    this.applyFilters();
  }

  removeFilter(filterName: keyof FilterParams): void {
    switch (filterName) {
      case 'searchName':
        this.filters.searchName = '';
        break;
      case 'searchEmail':
        this.filters.searchEmail = '';
        break;
      case 'searchWhatsApp':
        this.filters.searchWhatsApp = '';
        break;
      case 'gender':
        this.filters.gender = '';
        break;
      case 'minAge':
        this.filters.minAge = null;
        break;
      case 'maxAge':
        this.filters.maxAge = null;
        break;
      case 'sortOrder':
        this.filters.sortOrder = '';
        break;
      case 'teacherName':
        this.filters.teacherName = '';
        break;
      case 'studentName':
        this.filters.studentName = '';
        break;
      case 'trackName':
        this.filters.trackName = '';
        break;
      case 'from':
        this.filters.from = '';
        break;
      case 'to':
        this.filters.to = '';
        break;
      case 'teacherId':
        this.filters.teacherId = null;
        break;
      case 'isBooked':
        this.filters.isBooked = null;
        break;
      case 'isCompleted':
        this.filters.isCompleted = null;
        break;
      case 'searchTeacher':
        this.filters.searchTeacher = '';
        break;
      case 'searchTrack':
        this.filters.searchTrack = '';
        break;
    }
    this.applyFilters();
  }

  getSortOrderText(): string {
    const map: Record<string, string> = {
      name_asc: 'الاسم (أ-ي)',
      name_desc: 'الاسم (ي-أ)',
      age_asc: 'العمر (تصاعدي)',
      age_desc: 'العمر (تنازلي)',
    };
    return map[this.filters.sortOrder || ''] || 'الافتراضي';
  }
}
