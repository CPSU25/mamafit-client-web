import { Badge } from '@/components/ui/badge';
import { statusConfig } from '../constants';
import { StatusBadgeProps } from '../types';

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
