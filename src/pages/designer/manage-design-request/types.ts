// Extended interface to match actual API response
export interface ExtendedOrderTaskItem {
  orderCode: string
  orderStatus?: string
  orderItem: {
    id: string
    parentOrderItemId: string | null
    createdBy: string
    updatedBy: string
    createdAt: string
    updatedAt: string
    warrantyRound: number
    maternityDressDetail: unknown | null
    preset: unknown | null
    designRequest: {
      id: string
      userId: string
      username: string | null
      description: string | null
      images: string[]
      createdAt: string
      updatedAt: string
      createdBy: string
      updatedBy: string | null
    }
    addOnOptions: string[]
    feedbacks: unknown[]
    orderId: string
    maternityDressDetailId: string | null
    presetId: string | null
    itemType: string
    price: number
    quantity: number
    warrantyDate: string | null
  }
  milestones?: Array<{
    id: string
    name: string
    description: string
    applyFor: string[]
    sequenceOrder: number
    progress: number
    maternityDressTasks: Array<{
      id: string
      name: string
      description: string
      sequenceOrder: number
      estimateTimeSpan: number
      status: string
      deadline: string
      image: string | null
      note: string | null
      createdAt: string
      createdBy: string
      updatedAt: string
      updatedBy: string
    }>
  }>
  measurement?: unknown
  addressId?: string | null
}

export interface ChatMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  timestamp: string
  chatRoomId: string
  type: string
  isOwnMessage?: boolean
}

export interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  activeRequest: ExtendedOrderTaskItem | null
  onSendMessage: (message: string) => void
  messages: ChatMessage[]
  isLoadingMessages: boolean
  newMessage: string
  onNewMessageChange: (message: string) => void
  isMinimized: boolean
  onToggleMinimize: () => void
  onSendPreset?: () => void
}

export interface QuickStartDialogProps {
  isOpen: boolean
  onClose: () => void
  request: ExtendedOrderTaskItem | null
  onConfirm: () => void
}

export interface CompleteDesignDialogProps {
  isOpen: boolean
  onClose: () => void
  request: ExtendedOrderTaskItem | null
  note: string
  onNoteChange: (note: string) => void
  image: string
  onImageChange: (image: string) => void
  onConfirm: () => void
}
