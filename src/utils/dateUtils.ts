import { format, startOfDay, subDays, isSameDay } from 'date-fns';
import { DateColumn } from '../types';

/**
 * Parse DISTRIBUTION Time from ActiveCampaign
 * Handles ISO 8601 format: 2025-10-22T08:03:35+01:00
 * Returns Date in local browser timezone
 */
export function parseDistributionTime(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Try parsing as ISO 8601 (most common from ActiveCampaign)
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Fallback: Try mm-dd-yyyy hh:mm format
  const mmddyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year, hour, minute] = mmddyyyyMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );
  }
  
  return null;
}

/**
 * Get last 7 days (today + 6 days before) as DateColumn array
 */
export function getLast7Days(): DateColumn[] {
  const columns: DateColumn[] = [];
  const today = startOfDay(new Date());
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    columns.push({
      date,
      label: format(date, 'dd/MM'), // dd/mm format
    });
  }
  
  return columns;
}

/**
 * Get today as single DateColumn
 */
export function getToday(): DateColumn[] {
  const today = startOfDay(new Date());
  return [{
    date: today,
    label: format(today, 'dd/MM'),
  }];
}

/**
 * Check if a date falls within a specific day
 */
export function isDateInDay(date: Date, targetDay: Date): boolean {
  return isSameDay(date, targetDay);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}