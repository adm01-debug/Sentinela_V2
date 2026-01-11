// Duration Utils Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import {
  toMilliseconds, fromMilliseconds, formatDuration,
  humanReadableDuration, addDuration, subtractDuration
} from '../duration';

describe('duration utilities', () => {
  describe('toMilliseconds', () => {
    it('should convert hours to ms', () => {
      expect(toMilliseconds({ hours: 1 })).toBe(3600000);
    });

    it('should convert minutes to ms', () => {
      expect(toMilliseconds({ minutes: 30 })).toBe(1800000);
    });

    it('should combine multiple units', () => {
      expect(toMilliseconds({ hours: 1, minutes: 30 })).toBe(5400000);
    });
  });

  describe('fromMilliseconds', () => {
    it('should convert ms to duration object', () => {
      const result = fromMilliseconds(3661000);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
    });
  });

  describe('formatDuration', () => {
    it('should format short duration', () => {
      const result = formatDuration(65000, { short: true });
      expect(result).toBe('1min 5s');
    });

    it('should format long duration', () => {
      const result = formatDuration(3665000);
      expect(result).toContain('hora');
    });

    it('should respect maxUnits', () => {
      const result = formatDuration(3665000, { maxUnits: 1 });
      expect(result.split(' e ')).toHaveLength(1);
    });
  });

  describe('humanReadableDuration', () => {
    it('should format seconds', () => {
      expect(humanReadableDuration(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(humanReadableDuration(125)).toBe('2m 5s');
    });

    it('should format hours and minutes', () => {
      expect(humanReadableDuration(3665)).toBe('1h 1m');
    });
  });

  describe('addDuration', () => {
    it('should add duration to date', () => {
      const date = new Date('2023-01-01T00:00:00');
      const result = addDuration(date, { hours: 1 });
      expect(result.getHours()).toBe(1);
    });
  });

  describe('subtractDuration', () => {
    it('should subtract duration from date', () => {
      const date = new Date('2023-01-01T02:00:00');
      const result = subtractDuration(date, { hours: 1 });
      expect(result.getHours()).toBe(1);
    });
  });
});
