import React, { useState } from 'react'
import { Component } from '../data/schema'
import useDialogState from '@/hooks/use-dialog-state'

type ComponentsDialogType = 'add' | 'edit' | 'delete'

interface ComponentsContextType {
  open: ComponentsDialogType | null
  setOpen: (str: ComponentsDialogType | null) => void
  currentRow: Component | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Component | null>>
}

const ComponentsContext = React.createContext<ComponentsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ComponentsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ComponentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Component | null>(null)

  return <ComponentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</ComponentsContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useComponents = () => {
  const componentsContext = React.useContext(ComponentsContext)

  if (!componentsContext) {
    throw new Error('useComponents has to be used within <ComponentsContext>')
  }

  return componentsContext
}
