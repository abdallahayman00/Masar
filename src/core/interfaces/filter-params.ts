// shared/interfaces/filter-params.interface.ts
export interface FilterParams {
  page?: number;
  sortOrder?: string;
  searchName?: string;
  searchEmail?: string;
  searchWhatsApp?: string;
  gender?: string;
  minAge?: number | null;
  maxAge?: number | null;
}

export interface FilterConfig {
  showEmail?: boolean;
  showWhatsApp?: boolean;
  showGender?: boolean;
  showAgeRange?: boolean;
  showSortOrder?: boolean;
  showSearchName?: boolean;
  placeholderText?: string;
  title?: string;
}
