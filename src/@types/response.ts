import HttpStatusCode from '@/lib/utils/httpStatusCode.enum'

export interface ItemBaseResponse<T> {
  statusCode: HttpStatusCode
  message: string
  data: T
  additionalData?: string
}

export interface ListBaseResponse<T> {
  status: HttpStatusCode
  message: string
  size: number
  page: number
  totalSize: number
  totalPage: number
  data: T[]
}
