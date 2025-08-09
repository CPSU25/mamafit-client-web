import { ItemBaseResponse } from './../@types/response';
import { ListBaseResponse } from "@/@types/response"
import { WarrantyRequestById, WarrantyRequestList } from "@/@types/warranty-request.types"
import { api } from "@/lib/axios/axios"

export type WarrantyRequestListParams = {
    page: number 
    limit: number 
    search: string 
    sortBy: "CREATED_AT_DESC" | "CREATED_AT_ASC"
    // status: StatusWarrantyRequest
}
const warrantyAPI = {
    getWarrantyRequestList:  (params: WarrantyRequestListParams) => api.get<ListBaseResponse<WarrantyRequestList>>("/warranty-request", { params }),
    getWarrantyRequestById: (id: string) => api.get<ItemBaseResponse<WarrantyRequestById>>(`/warranty-request/${id}`),
}
export default warrantyAPI