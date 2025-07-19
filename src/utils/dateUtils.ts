export class DateUtils {
  static formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };

    return date.toLocaleDateString('en-US', options[format]);
  }

  static formatDateRange(startDate: Date, endDate: Date): string {
    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    if (sameMonth && sameYear) {
      return `${this.formatDate(startDate, 'short')} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }

    return `${this.formatDate(startDate, 'short')} - ${this.formatDate(endDate, 'short')}`;
  }

  static getDaysBetween(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  static isWeekend(date: Date): boolean {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  static getNightsCount(startDate: Date, endDate: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
  }
} 