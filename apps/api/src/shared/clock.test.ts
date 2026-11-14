import { describe, expect, it } from 'vitest';
import { fixedClock, systemClock } from './clock.ts';

const at = (iso: string) => systemClock(() => new Date(iso)).today();

describe('systemClock', () => {
  it('returns today as YYYY-MM-DD in Europe/Istanbul', () => {
    expect(at('2026-06-15T09:00:00Z')).toBe('2026-06-15');
  });

  it('is still the same day just before midnight in Istanbul', () => {
    // 20:59:59 UTC = 23:59:59 in Istanbul (UTC+3)
    expect(at('2026-03-01T20:59:59Z')).toBe('2026-03-01');
  });

  it('is already the next day just after midnight in Istanbul while UTC is still the day before', () => {
    // 21:00:00 UTC = 00:00:00 in Istanbul — the UTC date is 2026-03-01
    expect(at('2026-03-01T21:00:00Z')).toBe('2026-03-02');
  });

  it('crosses the year boundary in Istanbul before UTC does', () => {
    expect(at('2026-12-31T21:30:00Z')).toBe('2027-01-01');
  });
});

describe('systemClock now', () => {
  it('returns the current instant as UTC ISO-8601', () => {
    expect(systemClock(() => new Date('2026-03-01T21:00:00Z')).now()).toBe(
      '2026-03-01T21:00:00.000Z',
    );
  });
});

describe('fixedClock', () => {
  it('returns the instant it was given, or midnight UTC of its date', () => {
    expect(fixedClock('2027-02-28', '2027-02-28T10:00:00.000Z').now()).toBe(
      '2027-02-28T10:00:00.000Z',
    );
    expect(fixedClock('2027-02-28').now()).toBe('2027-02-28T00:00:00.000Z');
  });

  it('returns exactly the date it was given', () => {
    expect(fixedClock('2027-02-28').today()).toBe('2027-02-28');
  });
});
