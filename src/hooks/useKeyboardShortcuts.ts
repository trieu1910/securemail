import { useEffect } from 'react'

/**
 * Map of keyboard shortcut keys to their handler functions.
 * Key format: single key like 'j', 'k', 'Escape',
 * or modifier combo like 'Shift+?' for shifted keys.
 */
export interface ShortcutMap {
  [key: string]: () => void
}

/**
 * Registers global keydown shortcuts that are context-aware:
 * - Disabled when focus is inside INPUT, TEXTAREA, or contentEditable elements
 * - Supports single keys (j, k, Enter, Escape) and Shift combos (Shift+?)
 * - Automatically cleans up listeners on unmount
 *
 * @param shortcuts - mapping of key strings to handler functions
 * @param enabled  - toggle to disable all shortcuts (e.g. when compose modal is open)
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function handler(e: KeyboardEvent) {
      // Skip when the user is typing in a form element
      const target = e.target as HTMLElement
      const tag = target.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Build the key identifier — prepend Shift+ for shifted combos
      let key = e.key
      if (e.shiftKey && key !== 'Shift') {
        key = `Shift+${key}`
      }

      const action = shortcuts[key]
      if (action) {
        e.preventDefault()
        action()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}
