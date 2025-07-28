import React, { useState } from 'react'
import { VoucherBatch, VoucherDiscount } from '../data/schema'
import { VoucherTabType } from '../data/data'
import useDialogState from '@/hooks/use-dialog-state'

type VoucherDialogType = 'add-batch' | 'edit-batch' | 'delete-batch' | 'delete-discount' | 'assign-voucher'

interface VoucherContextType {
  // Dialog management
  open: VoucherDialogType | null
  setOpen: (str: VoucherDialogType | null) => void

  // Current row data
  currentVoucherBatch: VoucherBatch | null
  setCurrentVoucherBatch: React.Dispatch<React.SetStateAction<VoucherBatch | null>>
  currentVoucherDiscount: VoucherDiscount | null
  setCurrentVoucherDiscount: React.Dispatch<React.SetStateAction<VoucherDiscount | null>>

  // Tab management
  activeTab: VoucherTabType
  setActiveTab: React.Dispatch<React.SetStateAction<VoucherTabType>>
}

const VoucherContext = React.createContext<VoucherContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VoucherProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<VoucherDialogType>(null)
  const [currentVoucherBatch, setCurrentVoucherBatch] = useState<VoucherBatch | null>(null)
  const [currentVoucherDiscount, setCurrentVoucherDiscount] = useState<VoucherDiscount | null>(null)
  const [activeTab, setActiveTab] = useState<VoucherTabType>('batch')

  return (
    <VoucherContext
      value={{
        open,
        setOpen,
        currentVoucherBatch,
        setCurrentVoucherBatch,
        currentVoucherDiscount,
        setCurrentVoucherDiscount,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </VoucherContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVoucher = () => {
  const voucherContext = React.useContext(VoucherContext)

  if (!voucherContext) {
    throw new Error('useVoucher has to be used within <VoucherContext>')
  }

  return voucherContext
}
