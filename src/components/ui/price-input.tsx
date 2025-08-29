import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/utils'

export interface PriceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | undefined
  onChange: (value: number) => void
  minValue?: number
}

export function PriceInput({ value, onChange, minValue = 0, className, placeholder = '0', ...rest }: PriceInputProps) {
  const [display, setDisplay] = useState<string>('')
  const lastNumericValueRef = useRef<number>(value ?? 0)

  const formatNumber = useMemo(() => new Intl.NumberFormat('vi-VN'), [])

  // Sync from external value → display
  useEffect(() => {
    const numeric = typeof value === 'number' && !isNaN(value) ? Math.max(value, minValue) : 0
    lastNumericValueRef.current = numeric
    setDisplay(numeric > 0 ? formatNumber.format(numeric) : '')
  }, [value, minValue, formatNumber])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const onlyDigits = raw.replace(/\D/g, '')
    const numeric = onlyDigits ? Number(onlyDigits) : 0

    const clamped = Math.max(numeric, minValue)
    lastNumericValueRef.current = clamped
    setDisplay(clamped > 0 ? formatNumber.format(clamped) : '')
    onChange(clamped)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End']

    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
      return
    }

    if (allowedKeys.includes(e.key)) return

    if (e.key === '-' || e.key === '+' || e.key.toLowerCase() === 'e') {
      e.preventDefault()
      return
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Input
      inputMode='numeric'
      type='text'
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn(className)}
      {...rest}
    />
  )
}

export default PriceInput
