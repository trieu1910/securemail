import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLang } from './useLang'

describe('useLang', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to "en" when no localStorage value', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.lang).toBe('en')
  })

  it('reads initial value from localStorage', () => {
    localStorage.setItem('sm_lang', 'vi')
    const { result } = renderHook(() => useLang())
    expect(result.current.lang).toBe('vi')
  })

  it('toggle switches from en to vi', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.lang).toBe('en')

    act(() => {
      result.current.toggle()
    })
    expect(result.current.lang).toBe('vi')
  })

  it('toggle switches from vi to en', () => {
    localStorage.setItem('sm_lang', 'vi')
    const { result } = renderHook(() => useLang())
    expect(result.current.lang).toBe('vi')

    act(() => {
      result.current.toggle()
    })
    expect(result.current.lang).toBe('en')
  })

  it('t() returns correct string based on language', () => {
    const { result } = renderHook(() => useLang())

    // Default is 'en'
    expect(result.current.t('Hello', 'Xin chao')).toBe('Hello')

    act(() => {
      result.current.toggle()
    })

    expect(result.current.t('Hello', 'Xin chao')).toBe('Xin chao')
  })

  it('setLang persists to localStorage', () => {
    const { result } = renderHook(() => useLang())

    act(() => {
      result.current.setLang('vi')
    })
    expect(localStorage.getItem('sm_lang')).toBe('vi')

    act(() => {
      result.current.setLang('en')
    })
    expect(localStorage.getItem('sm_lang')).toBe('en')
  })

  it('toggle persists to localStorage', () => {
    const { result } = renderHook(() => useLang())

    act(() => {
      result.current.toggle()
    })
    expect(localStorage.getItem('sm_lang')).toBe('vi')
  })
})
