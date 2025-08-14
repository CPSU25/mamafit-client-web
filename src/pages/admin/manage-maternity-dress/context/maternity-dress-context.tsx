import React, { useState } from 'react'
import { MaternityDress } from '../data/schema'
import useDialogState from '@/hooks/use-dialog-state'

type MaternityDressDialogType = 'add' | 'edit' | 'delete'

interface MaternityDressContextType {
  open: MaternityDressDialogType | null
  setOpen: (str: MaternityDressDialogType | null) => void
  currentRow: MaternityDress | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MaternityDress | null>>
}

const MaternityDressContext = React.createContext<MaternityDressContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function MaternityDressProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MaternityDressDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MaternityDress | null>(null)

  return (
    <MaternityDressContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MaternityDressContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMaternityDress = () => {
  const maternityDressContext = React.useContext(MaternityDressContext)

  if (!maternityDressContext) {
    throw new Error('useMaternityDress has to be used within <MaternityDressContext>')
  }

  return maternityDressContext
}