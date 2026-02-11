import { Language } from '@app/core';

export interface FilterOptions {
  languages: Language[];
  statuses: string[];
  // Add more filters as needed in future
}
