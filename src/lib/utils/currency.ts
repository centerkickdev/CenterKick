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
 * Parses raw or prefixed market values (e.g. "$2000", "€50000", "2000")
 * into a clean numerical string and CurrencyCode.
 */
export function parseCurrencyAndAmount(
  val: number | string | null | undefined,
  currencyCodeFromProfile?: string | null
): { amount: string; currency: CurrencyCode } {
  if (val === null || val === undefined || val === '') {
    const curr = (currencyCodeFromProfile?.toUpperCase() as CurrencyCode) || 'EUR';
    return { amount: '', currency: CURRENCIES.some(c => c.code === curr) ? curr : 'EUR' };
  }

  const str = String(val).trim();
  
  const symbolMatch = str.match(/^([$€£₦])\s*(.*)$/);
  if (symbolMatch) {
    const sym = symbolMatch[1];
    const rawAmt = symbolMatch[2].replace(/,/g, '');
    const foundCurrency = CURRENCIES.find(c => c.symbol === sym)?.code || 'EUR';
    return { amount: rawAmt, currency: foundCurrency };
  }

  const cleanNum = str.replace(/,/g, '');
  const foundCurrency = (currencyCodeFromProfile?.toUpperCase() as CurrencyCode) || 'EUR';
  const validCurrency = CURRENCIES.some(c => c.code === foundCurrency) ? foundCurrency : 'EUR';

  return { amount: cleanNum, currency: validCurrency };
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

  // If input already contains an embedded currency symbol, preserve and format cleanly
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
