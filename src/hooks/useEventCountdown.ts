import { useEffect, useMemo, useState } from 'react';

import { formatCountdownLabel, getEventStartDate } from '../utils/eventDate';
import type { Event } from '../data/events';

export function useEventCountdown(event: Pick<Event, 'startsAt' | 'date' | 'time'>) {
  const targetDate = useMemo(() => getEventStartDate(event), [event]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      targetDate,
      label: formatCountdownLabel(targetDate, now),
      isPast: targetDate.getTime() <= now.getTime(),
    }),
    [now, targetDate]
  );
}
