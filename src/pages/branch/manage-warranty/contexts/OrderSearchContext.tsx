import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import type { OrderItemType } from '@/@types/manage-order.types'

// Local interface for Order
interface OrderType {
  code: string
  status: string
  totalAmount?: number
  items?: OrderItemType[]
}

// Order Search Context
interface OrderSearchContextType {
  sku: string
  orderCode: string
  selectedItems: OrderItemType[]
  showCreateDialog: boolean
  order: OrderType | null
  setSku: (sku: string) => void
  setOrderCode: (code: string) => void
  setSelectedItems: (items: OrderItemType[]) => void
  setShowCreateDialog: (show: boolean) => void
  setOrder: (order: OrderType | null) => void
}

const OrderSearchContext = createContext<OrderSearchContextType | null>(null)

export function OrderSearchProvider({ children }: { children: React.ReactNode }) {
  const [sku, setSku] = useState<string>('')
  const [orderCode, setOrderCode] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<OrderItemType[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false)
  const [order, setOrder] = useState<OrderType | null>(null)

  // Memoize setter functions to prevent recreating on every render
  const memoizedSetSku = useCallback((newSku: string) => setSku(newSku), [])
  const memoizedSetOrderCode = useCallback((newCode: string) => setOrderCode(newCode), [])
  const memoizedSetSelectedItems = useCallback((items: OrderItemType[]) => setSelectedItems(items), [])
  const memoizedSetShowCreateDialog = useCallback((show: boolean) => setShowCreateDialog(show), [])
  const memoizedSetOrder = useCallback((newOrder: OrderType | null) => setOrder(newOrder), [])

  const value = useMemo(
    () => ({
      sku,
      orderCode,
      selectedItems,
      showCreateDialog,
      order,
      setSku: memoizedSetSku,
      setOrderCode: memoizedSetOrderCode,
      setSelectedItems: memoizedSetSelectedItems,
      setShowCreateDialog: memoizedSetShowCreateDialog,
      setOrder: memoizedSetOrder
    }),
    [
      sku,
      orderCode,
      selectedItems,
      showCreateDialog,
      order,
      memoizedSetSku,
      memoizedSetOrderCode,
      memoizedSetSelectedItems,
      memoizedSetShowCreateDialog,
      memoizedSetOrder
    ]
  )

  return <OrderSearchContext.Provider value={value}>{children}</OrderSearchContext.Provider>
}

export function useOrderSearch() {
  const context = useContext(OrderSearchContext)
  if (!context) {
    throw new Error('useOrderSearch must be used within OrderSearchProvider')
  }
  return context
}

export type { OrderType, OrderSearchContextType }
