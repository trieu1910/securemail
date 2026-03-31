import { describe, it, expect } from 'vitest'
import { highlightJson } from './highlightJson'

describe('highlightJson', () => {
  it('highlights JSON keys in blue', () => {
    const result = highlightJson('{\n  "mode": "password"\n}')
    expect(result).toContain('text-blue-400')
    expect(result).toContain('"mode"')
  })

  it('highlights string values in green', () => {
    const result = highlightJson('{\n  "mode": "password"\n}')
    expect(result).toContain('text-green-400')
    expect(result).toContain('"password"')
  })

  it('highlights numbers in amber', () => {
    const result = highlightJson('{\n  "count": 42\n}')
    expect(result).toContain('text-amber-400')
    expect(result).toContain('42')
  })

  it('highlights null/boolean in amber', () => {
    const result = highlightJson('{\n  "salt": null\n}')
    expect(result).toContain('text-amber-400')
    expect(result).toContain('null')
  })

  it('escapes HTML entities', () => {
    const result = highlightJson('{"key": "<script>alert(1)</script>"}')
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })
})
