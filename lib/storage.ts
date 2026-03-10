'use client';

import LZString from 'lz-string';
import { Expense, ParsedInput, STORAGE_KEY, CURRENCY_KEY, CURRENCIES } from './types';

// Compression helpers
function compressData(data: unknown): string {
  const json = JSON.stringify(data);
  return LZString.compressToUTF16(json);
}

function decompressData(compressed: string): unknown {
  const json = LZString.decompressFromUTF16(compressed);
  return json ? JSON.parse(json) : null;
}

export function parseInput(input: string): ParsedInput {
  const trimmed = input.trim();
  if (!trimmed) return { amount: null, note: '', tags: [] };

  // Extract tags (words starting with #)
  const tags: string[] = [];
  const withoutTags = trimmed.replace(/#(\w+)/g, (match, tag) => {
    tags.push(tag.toLowerCase());
    return '';
  }).trim();

  // Try to extract amount (first number)
  const amountMatch = withoutTags.match(/^-?\d+(?:\.\d{1,2})?/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

  // Remaining text is the note
  let note = amountMatch 
    ? withoutTags.slice(amountMatch[0].length).trim()
    : withoutTags;

  return { amount, note, tags };
}

export function saveExpense(expense: Expense): void {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses();
  expenses.unshift(expense);
  localStorage.setItem(STORAGE_KEY, compressData(expenses));
}

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    // Try decompressing first (new format)
    const decompressed = decompressData(stored);
    if (decompressed) return decompressed as Expense[];
    
    // Fallback to uncompressed (old format, backward compatibility)
    return JSON.parse(stored) as Expense[];
  } catch {
    return [];
  }
}

export function deleteExpense(id: string): void {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, compressData(expenses));
}

export function updateExpense(updated: Expense): void {
  if (typeof window === 'undefined') return;
  const expenses = getExpenses().map(e => e.id === updated.id ? updated : e);
  localStorage.setItem(STORAGE_KEY, compressData(expenses));
}

export function getCurrency(): string {
  if (typeof window === 'undefined') return 'INR';
  return localStorage.getItem(CURRENCY_KEY) || 'INR';
}

export function setCurrency(currency: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENCY_KEY, currency);
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES.find(c => c.code === currencyCode)?.symbol || '₹';
}

export function formatAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENCY_KEY);
}

// Calculate localStorage size for this app
export function getDataSize(): string {
  if (typeof window === 'undefined') return '0 B';
  
  let totalSize = 0;
  const keys = [STORAGE_KEY, CURRENCY_KEY];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // Calculate size in bytes (UTF-16 characters are 2 bytes each)
      totalSize += value.length * 2;
    }
  });
  
  // Format size
  if (totalSize < 1024) return `${totalSize} B`;
  if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
  return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
}
