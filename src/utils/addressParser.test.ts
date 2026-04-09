import { describe, it, expect } from 'vitest'
import { extractName, extractEmail } from './addressParser'

describe('extractName', () => {
  it('extracts name from "Name <email>" format', () => {
    expect(extractName('John Doe <john@email.com>')).toBe('John Doe')
  })

  it('returns local part when no angle-bracket pattern', () => {
    expect(extractName('john@email.com')).toBe('john')
  })

  it('handles quoted name with angle brackets', () => {
    expect(extractName('"Alice Nguyen" <alice@example.com>')).toBe('Alice Nguyen')
  })

  it('trims whitespace in extracted name', () => {
    expect(extractName('  Bob Smith  <bob@test.com>')).toBe('Bob Smith')
  })

  it('handles name with special characters', () => {
    expect(extractName('Tran Van A <tran@vn.com>')).toBe('Tran Van A')
  })
})

describe('extractEmail', () => {
  it('extracts email from "Name <email>" format', () => {
    expect(extractEmail('John <john@email.com>')).toBe('john@email.com')
  })

  it('returns raw string when no angle-bracket pattern', () => {
    expect(extractEmail('john@email.com')).toBe('john@email.com')
  })

  it('handles complex display name with email in brackets', () => {
    expect(extractEmail('"Alice Nguyen" <alice@example.com>')).toBe('alice@example.com')
  })

  it('handles name with spaces before angle brackets', () => {
    expect(extractEmail('Bob Smith   <bob@test.com>')).toBe('bob@test.com')
  })
})
