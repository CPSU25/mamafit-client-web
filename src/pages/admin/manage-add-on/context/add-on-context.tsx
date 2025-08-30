import React, { useState } from 'react'
import { AddOn, AddOnOption, PositionSchema, SizeSchema } from '../data/schema'
import { AddOnTabType } from '../data/data'
import useDialogState from '@/hooks/use-dialog-state'

type AddOnDialogType =
  | 'add-add-on'
  | 'edit-add-on'
  | 'delete-add-on'
  | 'add-add-on-option'
  | 'edit-add-on-option'
  | 'delete-add-on-option'
  | 'add-position'
  | 'edit-position'
  | 'delete-position'
  | 'add-size'
  | 'edit-size'
  | 'delete-size'

interface AddOnContextType {
  // Dialog management
  open: AddOnDialogType | null
  setOpen: (str: AddOnDialogType | null) => void

  // Current row data
  currentAddOn: AddOn | null
  setCurrentAddOn: React.Dispatch<React.SetStateAction<AddOn | null>>
  currentAddOnOption: AddOnOption | null
  setCurrentAddOnOption: React.Dispatch<React.SetStateAction<AddOnOption | null>>
  currentPosition: PositionSchema | null
  setCurrentPosition: React.Dispatch<React.SetStateAction<PositionSchema | null>>
  currentSize: SizeSchema | null
  setCurrentSize: React.Dispatch<React.SetStateAction<SizeSchema | null>>

  // Tab management
  activeTab: AddOnTabType
  setActiveTab: React.Dispatch<React.SetStateAction<AddOnTabType>>
}

const AddOnContext = React.createContext<AddOnContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AddOnProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AddOnDialogType>(null)
  const [currentAddOn, setCurrentAddOn] = useState<AddOn | null>(null)
  const [currentAddOnOption, setCurrentAddOnOption] = useState<AddOnOption | null>(null)
  const [currentPosition, setCurrentPosition] = useState<PositionSchema | null>(null)
  const [currentSize, setCurrentSize] = useState<SizeSchema | null>(null)
  const [activeTab, setActiveTab] = useState<AddOnTabType>('add-ons')

  return (
    <AddOnContext
      value={{
        open,
        setOpen,
        currentAddOn,
        setCurrentAddOn,
        currentAddOnOption,
        setCurrentAddOnOption,
        currentPosition,
        setCurrentPosition,
        currentSize,
        setCurrentSize,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </AddOnContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAddOn = () => {
  const addOnContext = React.useContext(AddOnContext)

  if (!addOnContext) {
    throw new Error('useAddOn has to be used within <AddOnContext>')
  }

  return addOnContext
}
