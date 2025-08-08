import { Badge } from '@/components/ui/badge';
import { requestTypeConfig } from '../constants';
import { RequestTypeBadgeProps } from '../types';

export const RequestTypeBadge = ({ type }: RequestTypeBadgeProps) => {
  const config = requestTypeConfig[type];
  
  return (
    <Badge variant="outline" className={`${config.color} border`}>
      {config.label}
    </Badge>
  );
};
