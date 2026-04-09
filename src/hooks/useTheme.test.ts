import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    // Mock matchMedia so 'system' theme can be tested
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // default: light system theme
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('defaults to "system" when no localStorage value', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  it('reads initial value from localStorage', () => {
    localStorage.setItem('sm_theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('setTheme("dark") adds "dark" class to documentElement', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme("light") removes "dark" class from documentElement', () => {
    // Start with dark
    document.documentElement.classList.add('dark')
    localStorage.setItem('sm_theme', 'dark')

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })
    expect(localStorage.getItem('sm_theme')).toBe('dark')

    act(() => {
      result.current.setTheme('light')
    })
    expect(localStorage.getItem('sm_theme')).toBe('light')
  })

  it('system theme respects prefers-color-scheme: dark', () => {
    // Mock system dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())

    // system theme + dark preference should add dark class
    expect(result.current.theme).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('system theme with light preference does not add dark class', () => {
    // matchMedia already returns false (light) by default in beforeEach
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
