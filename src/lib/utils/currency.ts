export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'NGN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  name: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'EUR', symbol: '€', label: 'EUR (€)', name: 'Euros' },
  { code: 'USD', symbol: '$', label: 'USD ($)', name: 'US Dollars' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', name: 'British Pounds' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)', name: 'Nigerian Naira' },
];

/**
 * Gets currency symbol for a given currency code. Defaults to '€'.
 */
export function getCurrencySymbol(currencyCode?: string | null): string {
  if (!currencyCode) return '€';
  const match = CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
  return match ? match.symbol : '€';
}

/**
 * Formats market values and fees into clean currency strings (e.g. €500,000, $1,200,000, ₦50,000,000)
 */
export function formatCurrencyAmount(
  val: number | string | null | undefined,
  currencyCode: string = 'EUR'
): string {
  if (val === null || val === undefined || val === '') return '—';
  
  const str = String(val).trim();
  if (!str || str === '—' || str === 'N/A') return '—';

  // If input already contains an embedded currency symbol, preserve or update it cleanly
  const existingSymbolMatch = str.match(/^([$€£₦])\s*(.*)$/);
  if (existingSymbolMatch) {
    const symbol = existingSymbolMatch[1];
    const amountStr = existingSymbolMatch[2];
    const cleanNum = parseFloat(amountStr.replace(/,/g, ''));
    if (!isNaN(cleanNum)) {
      return `${symbol}${cleanNum.toLocaleString('en-US')}`;
    }
    return str;
  }

  // Parse raw numerical value
  const cleanStr = str.replace(/,/g, '');
  const num = parseFloat(cleanStr);
  if (isNaN(num) || num === 0) return '—';

  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${num.toLocaleString('en-US')}`;
}
