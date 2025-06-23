import React, { useState } from 'react'
import { Branch } from '../data/schema'
import useDialogState from '@/hooks/use-dialog-state'

type BranchDialogType = 'add' | 'edit' | 'delete'

interface BranchContextType {
  open: BranchDialogType | null
  setOpen: (str: BranchDialogType | null) => void
  currentRow: Branch | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Branch | null>>
}

const BranchContext = React.createContext<BranchContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function BranchProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<BranchDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Branch | null>(null)

  return <BranchContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</BranchContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBranch = () => {
  const branchContext = React.useContext(BranchContext)

  if (!branchContext) {
    throw new Error('useBranch has to be used within <BranchContext>')
  }

  return branchContext
}
