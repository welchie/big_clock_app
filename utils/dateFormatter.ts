/**
 * Get ordinal suffix for day of month (e.g. 1st, 2nd, 3rd, 8th, 21st, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Returns formatted date string with ordinal suffix, e.g.:
 * "Tuesday 8th September"
 */
export function getOrdinalDateString(date: Date): string {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = months[date.getMonth()];

  return `${dayOfWeek} ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} ${monthName}`;
}

/**
 * Format time display string (e.g. 10:18:32 AM or 10:18)
 */
export function formatTimeComponents(date: Date, is12Hour: boolean) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  let period = '';

  if (is12Hour) {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }

  const hoursStr = is12Hour ? hours.toString() : hours.toString().padStart(2, '0');

  return {
    hours: hoursStr,
    minutes,
    seconds,
    period,
  };
}

/**
 * Get ISO date string formatted as YYYY-MM-DD
 */
export function getISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get ISO week number of the year
 */
export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Helper to generate calendar matrix for a month/year
 */
export interface CalendarDay {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthCalendarMatrix(year: number, month: number): CalendarDay[][] {
  const todayStr = getISODateString(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const matrix: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Fill preceding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    const dateStr = getISODateString(prevDate);
    currentWeek.push({
      dateString: dateStr,
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Fill current month days
  const totalDaysInMonth = lastDayOfMonth.getDate();
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = getISODateString(currentDate);

    currentWeek.push({
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining trailing days for next month
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const nextDate = new Date(year, month + 1, nextMonthDay);
      const dateStr = getISODateString(nextDate);
      currentWeek.push({
        dateString: dateStr,
        dayNumber: nextMonthDay,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
      nextMonthDay++;
    }
    matrix.push(currentWeek);
  }

  return matrix;
}
