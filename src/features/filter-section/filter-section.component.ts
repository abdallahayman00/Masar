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
  styleUrl: './filter-section.component.scss',
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

  isExpanded: boolean = false;
  private filterDebounceTimer: any;

  filters: FilterParams = {
    searchName: '',
    searchEmail: '',
    searchWhatsApp: '',
    gender: '',
    minAge: null,
    maxAge: null,
    sortOrder: '',
  };

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.searchName ||
      this.filters.searchEmail ||
      this.filters.searchWhatsApp ||
      this.filters.gender ||
      this.filters.minAge ||
      this.filters.maxAge ||
      this.filters.sortOrder
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
    // Debounce for text inputs
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
    }
    this.applyFilters();
  }

  getSortOrderText(): string {
    const sortMap: { [key: string]: string } = {
      name_asc: 'الاسم (أ-ي)',
      name_desc: 'الاسم (ي-أ)',
      age_asc: 'العمر (تصاعدي)',
      age_desc: 'العمر (تنازلي)',
    };
    return sortMap[this.filters.sortOrder || ''] || 'الافتراضي';
  }

  getApiSortOrder(): string {
    return this.filters.sortOrder || '';
  }

  resetFilters(): void {
    this.clearAllFilters();
  }
}
