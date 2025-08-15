import { ListBaseResponse } from "@/@types/response";
import { TransactionQueryParams, TransactionType } from "@/@types/transaction.types";
import { api } from "@/lib/axios/axios";

const transactionAPI = {
    getTransactionList: (params?: TransactionQueryParams) => {
        const queryParams = new URLSearchParams();
    // Append when defined (avoid dropping 0 values)
    if (params?.index !== undefined) queryParams.append("index", params.index.toString());
    if (params?.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());
        if(params?.startDate) queryParams.append("startDate", params.startDate);
        if(params?.endDate) queryParams.append("endDate", params.endDate);
        const queryString = queryParams.toString();
        const url = queryString? `/transaction?${queryString}` : "/transaction";
        return api.get<ListBaseResponse<TransactionType>>(url);
    },
}

export default transactionAPI;