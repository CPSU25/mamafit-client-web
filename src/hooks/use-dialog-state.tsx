import { useState, useCallback } from 'react'

/**
 * Custom hook for dialog state management
 * @param initialState T | null - initial state
 * @param mode 'toggle' | 'direct' - toggle mode behaves like original, direct mode sets value directly
 * @returns A stateful value, and a function to update it.
 * @example const [open, setOpen] = useDialogState<"add" | "edit" | "delete">()
 */
export default function useDialogState<T extends string | boolean>(
  initialState: T | null = null,
  mode: 'toggle' | 'direct' = 'toggle'
) {
  const [open, _setOpen] = useState<T | null>(initialState)

  const setOpen = useCallback(
    (str: T | null) => {
      if (mode === 'toggle') {
        _setOpen((prev) => (prev === str ? null : str))
      } else {
        _setOpen(str)
      }
    },
    [mode]
  )

  const reset = useCallback(() => {
    _setOpen(null)
  }, [])

  return [open, setOpen, reset] as const
}
