import warrantyAPI, { WarrantyRequestListParams } from "@/apis/warranty-request.api"
import { useQuery } from "@tanstack/react-query"

export const warrantyKey = {
    all: ['warranty'] as const,
    lists: () => [...warrantyKey.all, 'list'] as const,
    list: (params: WarrantyRequestListParams) => [...warrantyKey.lists(), params] as const,
    details: () => [...warrantyKey.all, 'detail'] as const,
    detail: (id: string) => [...warrantyKey.details(), id] as const
}

export const useWarrantyRequestList = (params: WarrantyRequestListParams) => {
    return useQuery({
        queryKey: warrantyKey.list(params),
        queryFn: () => warrantyAPI.getWarrantyRequestList(params),
        select: (data) => data.data.data,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    })
}   

export const useWarrantyRequestById = (id: string) => {
    return useQuery({
        queryKey: warrantyKey.detail(id),
        queryFn: () => warrantyAPI.getWarrantyRequestById(id),
        select: (data) => data.data.data,
    })
}