import { ConfigFormData, ConfigResponse, ConfigType } from '@/@types/system-config.types'
import { api } from '@/lib/axios/axios'

const configAPI = {
  getConfigs: () => api.get<ConfigResponse<ConfigType>>('/config'),
  updateConfig: (data: ConfigFormData) => api.post<ConfigResponse<ConfigType>>('/config', data)
}
export default configAPI
