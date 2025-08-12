import React, { useState } from 'react'
import { BranchOrderType } from '@/@types/branch-order.types'
import useDialogState from '@/hooks/use-dialog-state'

type OrderDialogType = 'view' | 'update' | 'edit' | 'delete' | 'assign-task'

interface BranchOrderContextType {
  open: OrderDialogType | null
  setOpen: (str: OrderDialogType | null) => void
  currentRow: BranchOrderType | null
  setCurrentRow: React.Dispatch<React.SetStateAction<BranchOrderType | null>>
}

const BranchOrderContext = React.createContext<BranchOrderContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function BranchOrderProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<OrderDialogType>(null, 'direct')
  const [currentRow, setCurrentRow] = useState<BranchOrderType | null>(null)

  return <BranchOrderContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</BranchOrderContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBranchOrders = () => {
  const orderContext = React.useContext(BranchOrderContext)
  if (!orderContext) {
    throw new Error('useBranchOrders has to be used within <BranchOrderProvider>')
  }
  return orderContext
}
