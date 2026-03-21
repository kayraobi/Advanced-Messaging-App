import { parse, isValid } from 'date-fns';

import type { Event } from '../data/events';

const EVENT_DATE_TIME_FORMAT = 'MMM d, yyyy h:mm a';

export function getEventStartDate(event: Pick<Event, 'startsAt' | 'date' | 'time'>) {
  if (event.startsAt) {
    const isoDate = new Date(event.startsAt);
    if (isValid(isoDate)) return isoDate;
  }

  return parse(`${event.date} ${event.time}`, EVENT_DATE_TIME_FORMAT, new Date());
}

export function getCountdownParts(targetDate: Date, now = new Date()) {
  const diffMs = targetDate.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const safeDiffMs = Math.max(diffMs, 0);

  const totalSeconds = Math.floor(safeDiffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { isPast, days, hours, minutes, seconds };
}

export function formatCountdownLabel(targetDate: Date, now = new Date()) {
  const { isPast, days, hours, minutes, seconds } = getCountdownParts(targetDate, now);

  if (isPast) return 'Event started';
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
