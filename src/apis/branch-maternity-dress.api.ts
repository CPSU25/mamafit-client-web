import { BranchMaternityDressDetailForm, BranchMaternityDressDetailType } from '@/@types/branch-maternity-dress.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

const branchMaternityDressAPI = {
  getAll: () => api.get<ListBaseResponse<BranchMaternityDressDetailType[]>>('/branch-maternity-dress'),
  assignQuantityForBranch: (data: BranchMaternityDressDetailForm) =>
    api.post<ItemBaseResponse<[]>>('/branch-maternity-dress-detail', data)
}
export default branchMaternityDressAPI
