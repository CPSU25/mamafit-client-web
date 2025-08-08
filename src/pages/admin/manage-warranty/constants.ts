import { 
  Clock, 
  Truck, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react';
import { StatusConfig, RequestTypeConfig } from './types';

export const statusConfig: Record<string, StatusConfig> = {
  PENDING: { 
    label: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock 
  },
  IN_TRANSIT: { 
    label: 'Đang vận chuyển', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Truck 
  },
  REPAIRING: { 
    label: 'Đang sửa chữa', 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: Package 
  },
  COMPLETED: { 
    label: 'Hoàn thành', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle 
  },
  PARTIALLY_REJECTED: { 
    label: 'Từ chối một phần', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: AlertTriangle 
  },
  FULLY_REJECTED: { 
    label: 'Từ chối hoàn toàn', 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: XCircle 
  }
};

export const requestTypeConfig: Record<string, RequestTypeConfig> = {
  REPAIR: { 
    label: 'Sửa chữa', 
    color: 'bg-violet-100 text-violet-800 border-violet-200' 
  },
  EXCHANGE: { 
    label: 'Đổi hàng', 
    color: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  REFUND: { 
    label: 'Hoàn tiền', 
    color: 'bg-green-100 text-green-800 border-green-200' 
  }
};
