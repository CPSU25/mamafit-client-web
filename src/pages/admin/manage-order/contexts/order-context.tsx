import React, { useState } from 'react'
import { OrderType } from '@/@types/admin.types'
import useDialogState from '@/hooks/use-dialog-state'

type OrderDialogType = 'view' | 'update' | 'edit' | 'delete' | 'assign-task'

interface OrderContextType {
  open: OrderDialogType | null
  setOpen: (str: OrderDialogType | null) => void
  currentRow: OrderType | null
  setCurrentRow: React.Dispatch<React.SetStateAction<OrderType | null>>
}

const OrderContext = React.createContext<OrderContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function OrderProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<OrderDialogType>(null)
  const [currentRow, setCurrentRow] = useState<OrderType | null>(null)

  return <OrderContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</OrderContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const orderContext = React.useContext(OrderContext)
  if (!orderContext) {
    throw new Error('useOrders has to be used within <OrderProvider>')
  }
  return orderContext
}
