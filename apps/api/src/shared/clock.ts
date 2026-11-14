// The one source of "today" (docs/conventions.md, Data rules). Services never call new Date().
export const BUSINESS_TIME_ZONE = 'Europe/Istanbul';

export interface Clock {
  /** Today's date in the business time zone, as YYYY-MM-DD. */
  today(): string;
  /** The current instant, as a UTC ISO-8601 timestamp. */
  now(): string;
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function systemClock(now: () => Date = () => new Date()): Clock {
  return {
    today() {
      const parts = formatter.formatToParts(now());
      const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      return `${part('year')}-${part('month')}-${part('day')}`;
    },
    now: () => now().toISOString(),
  };
}

/** A clock stopped at `date`; `instant` (UTC ISO-8601) defaults to that date's midnight UTC. */
export function fixedClock(date: string, instant = `${date}T00:00:00.000Z`): Clock {
  return { today: () => date, now: () => instant };
}
