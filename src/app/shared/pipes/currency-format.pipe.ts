import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | string,
    currency = 'XAF',
    showSymbol = true,
  ): string {
    if (value === null || value === undefined) return '';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';

    const symbols: Record<string, string> = {
      XAF: 'XAF',
      EUR: '€',
      USD: '$',
      CAD: 'CA$',
    };

    const formatted = new Intl.NumberFormat('fr-CM', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

    const symbol = showSymbol ? ` ${symbols[currency] || currency}` : '';
    return `${formatted}${symbol}`;
  }
}
