// The one source of "today" (docs/conventions.md, Data rules). Services never call new Date().
export const BUSINESS_TIME_ZONE = 'Europe/Istanbul';

export interface Clock {
  /** Today's date in the business time zone, as YYYY-MM-DD. */
  today(): string;
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
  };
}

export function fixedClock(date: string): Clock {
  return { today: () => date };
}
