import { z } from 'zod'

const configSchema = z.object({
  name: z.string(),
  designRequestServiceFee: z
    .number()
    .min(0, 'Phí dịch vụ thiết kế không được âm')
    .max(10000000, 'Phí dịch vụ thiết kế quá cao'),
  depositRate: z.number().min(0, 'Tỷ lệ đặt cọc không được âm').max(1, 'Tỷ lệ đặt cọc không được vượt quá 100%'),
  presetVersions: z
    .number()
    .int('Số lượng version phải là số nguyên')
    .min(1, 'Số lượng version tối thiểu là 1')
    .max(50, 'Số lượng version tối đa là 50'),
  warrantyTime: z
    .number()
    .int('Số lần bảo hành phải là số nguyên')
    .min(0, 'Số lần bảo hành không được âm')
    .max(10, 'Số lần bảo hành tối đa là 10'),
  appointmentSlotInterval: z
    .number()
    .int('Khoảng thời gian slot phải là số nguyên')
    .min(15, 'Khoảng thời gian slot tối thiểu là 15 phút')
    .max(480, 'Khoảng thời gian slot tối đa là 8 giờ'),
  maxAppointmentPerDay: z
    .number()
    .int('Số appointment mỗi ngày phải là số nguyên')
    .min(1, 'Số appointment mỗi ngày tối thiểu là 1')
    .max(100, 'Số appointment mỗi ngày tối đa là 100'),
  maxAppointmentPerUser: z
    .number()
    .int('Số appointment mỗi user phải là số nguyên')
    .min(1, 'Số appointment mỗi user tối thiểu là 1')
    .max(20, 'Số appointment mỗi user tối đa là 20'),
  warrantyPeriod: z
    .number()
    .int('Thời gian bảo hành phải là số nguyên')
    .min(1, 'Thời gian bảo hành tối thiểu là 1 ngày')
    .max(365, 'Thời gian bảo hành tối đa là 365 ngày')
})

export default configSchema
