import HttpStatusCode from '@/lib/utils/httpStatusCode.enum'

export interface ConfigType {
  name: string
  designRequestServiceFee: number //phi yeu cau thiet ke rieng voi designer
  depositRate: number //ti le dat coc
  presetVersions: number //so luong version mac dinh
  warrantyTime: number //so lan mien phi bao hanh
  appointmentSlotInterval: number //thoi gian giua cac slot trong 1 ngay
  maxAppointmentPerDay: number //so luong toi da appointment trong 1 ngay
  maxAppointmentPerUser: number //so luong toi da user co the dat appointment
  warrantyPeriod: number //thoi gian bao hanh
}

export interface ConfigFormData {
  name: string
  designRequestServiceFee: number
  depositRate: number
  presetVersions: number
  warrantyTime: number
  appointmentSlotInterval: number
  maxAppointmentPerDay: number
  maxAppointmentPerUser: number
  warrantyPeriod: number
}

export interface ConfigResponse<T> {
  data: {
    fields: T
  }
  statusCode: HttpStatusCode
  message: string
  additionalData?: string
  code: string
}
