import { createContext, useContext, useState, ReactNode } from 'react'
import { TicketList } from '@/@types/ticket.types'

interface TicketContextType {
  selectedTicket: TicketList | null
  setSelectedTicket: (ticket: TicketList | null) => void
}

const TicketContext = createContext<TicketContextType | undefined>(undefined)

interface TicketProviderProps {
  children: ReactNode
}

export function TicketProvider({ children }: TicketProviderProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketList | null>(null)

  return <TicketContext.Provider value={{ selectedTicket, setSelectedTicket }}>{children}</TicketContext.Provider>
}

export function useTickets() {
  const context = useContext(TicketContext)
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}
