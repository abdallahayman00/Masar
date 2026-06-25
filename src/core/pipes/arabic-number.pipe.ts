import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arabicNumber',
  standalone: true
})
export class ArabicNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
