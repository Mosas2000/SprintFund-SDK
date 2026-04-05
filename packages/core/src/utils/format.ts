/**
 * String and formatting utilities
 */

// Address formatting
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function isValidStacksAddress(address: string): boolean {
  return /^SP[0-9A-Z]{39}$/.test(address) || /^ST[0-9A-Z]{39}$/.test(address);
}

// Number formatting
export function formatSTX(microSTX: bigint | number, decimals = 6): string {
  const value = typeof microSTX === 'bigint' ? Number(microSTX) : microSTX;
  return (value / 1_000_000).toFixed(decimals);
}

export function parseSTX(stx: string | number): bigint {
  const value = typeof stx === 'string' ? parseFloat(stx) : stx;
  return BigInt(Math.round(value * 1_000_000));
}

export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// Date formatting
export function formatDate(date: Date | number, locale = 'en-US'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date | number, locale = 'en-US'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString(locale);
}

export function formatRelativeTime(date: Date | number): string {
  const now = Date.now();
  const then = typeof date === 'number' ? date : date.getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

// Hash utilities
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}
