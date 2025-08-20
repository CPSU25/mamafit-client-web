import React, { createContext, useContext, useState } from 'react'
import type { OrderItemType } from '@/@types/manage-order.types'

// Simplified Order interface
interface OrderType {
  code: string
  status: string
  totalAmount?: number
  items?: OrderItemType[]
}

// Simple context without complex memoization
interface SimpleOrderSearchContextType {
  sku: string
  orderCode: string
  selectedItems: OrderItemType[]
  showCreateDialog: boolean
  order: OrderType | null
  setSku: (sku: string) => void
  setOrderCode: (code: string) => void
  setSelectedItems: (items: OrderItemType[] | ((prev: OrderItemType[]) => OrderItemType[])) => void
  setShowCreateDialog: (show: boolean) => void
  setOrder: (order: OrderType | null) => void
}

const SimpleOrderSearchContext = createContext<SimpleOrderSearchContextType | null>(null)

export function SimpleOrderSearchProvider({ children }: { children: React.ReactNode }) {
  const [sku, setSku] = useState<string>('')
  const [orderCode, setOrderCode] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<OrderItemType[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false)
  const [order, setOrder] = useState<OrderType | null>(null)

  // Simple value object without complex memoization
  const value: SimpleOrderSearchContextType = {
    sku,
    orderCode,
    selectedItems,
    showCreateDialog,
    order,
    setSku,
    setOrderCode,
    setSelectedItems,
    setShowCreateDialog,
    setOrder
  }

  return <SimpleOrderSearchContext.Provider value={value}>{children}</SimpleOrderSearchContext.Provider>
}

export function useSimpleOrderSearch() {
  const context = useContext(SimpleOrderSearchContext)
  if (!context) {
    throw new Error('useSimpleOrderSearch must be used within SimpleOrderSearchProvider')
  }
  return context
}

export type { OrderType, SimpleOrderSearchContextType }
