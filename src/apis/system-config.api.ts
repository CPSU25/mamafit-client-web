import { ConfigFormData, ConfigResponse, ConfigFields } from '@/@types/system-config.types'
import { api } from '@/lib/axios/axios'

const configAPI = {
  getConfigs: () => api.get<ConfigResponse<ConfigFields>>('/config'),
  updateConfig: (data: ConfigFormData) => api.patch<ConfigResponse<ConfigFields>>('/config', data)
}
export default configAPI
