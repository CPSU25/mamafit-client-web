import { TicketList } from '@/@types/ticket.types'
import { api } from '@/lib/axios/axios'
import HttpStatusCode from '@/lib/utils/httpStatusCode.enum'

interface TicketResponse {
  data: TicketList[]
  message: string
  statusCode: HttpStatusCode
  code: string
}

const ticketAPI = {
  getTickets: () => api.get<TicketResponse>('/ticket')
}
export default ticketAPI
