import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T10:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns time only for today', () => {
    const result = formatDate('Wed, 18 Mar 2026 08:15:00 +0000')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns weekday for dates within 7 days', () => {
    const result = formatDate('Mon, 16 Mar 2026 14:00:00 +0000')
    expect(result.length).toBeLessThan(10)
    expect(result).not.toBe('Invalid Date')
  })

  it('returns day + month for same year', () => {
    const result = formatDate('Thu, 15 Jan 2026 12:00:00 +0000')
    expect(result).not.toBe('Invalid Date')
    expect(result).toMatch(/\d{1,2}/)
  })

  it('returns full date for different year', () => {
    const result = formatDate('Sun, 25 Dec 2025 09:00:00 +0000')
    expect(result).toMatch(/2025/)
  })

  it('returns original string for unparseable dates', () => {
    expect(formatDate('not a date')).toBe('not a date')
    expect(formatDate('')).toBe('')
  })

  it('never returns "Invalid Date"', () => {
    expect(formatDate('garbage')).not.toBe('Invalid Date')
    expect(formatDate(undefined as unknown as string)).not.toBe('Invalid Date')
  })
})
