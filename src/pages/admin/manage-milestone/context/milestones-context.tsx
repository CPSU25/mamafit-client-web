import React, { useState } from 'react'
import { Milestone } from '../data/schema'
import useDialogState from '@/hooks/use-dialog-state'

type MilestonesDialogType = 'add' | 'edit' | 'delete'

interface MilestonesContextType {
  open: MilestonesDialogType | null
  setOpen: (str: MilestonesDialogType | null) => void
  currentRow: Milestone | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Milestone | null>>
}

const MilestonesContext = React.createContext<MilestonesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function MilestonesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MilestonesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Milestone | null>(null)

  return <MilestonesContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</MilestonesContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMilestones = () => {
  const milestonesContext = React.useContext(MilestonesContext)

  if (!milestonesContext) {
    throw new Error('useMilestones has to be used within <MilestonesContext>')
  }

  return milestonesContext
}
