'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface StatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}

const statuses = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CALL_BACK', label: 'Call Back' },
];

export function StatusTabs({ activeStatus, onStatusChange, counts }: StatusTabsProps) {
  return (
    <Tabs value={activeStatus} onValueChange={onStatusChange}>
      <TabsList className="bg-white border border-gray-200 p-1">
        {statuses.map((status) => (
          <TabsTrigger
            key={status.value}
            value={status.value}
            className={cn(
              'data-[state=active]:bg-primary data-[state=active]:text-white',
              'px-4 py-1.5 text-sm font-medium'
            )}
          >
            {status.label}
            <span
              className={cn(
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                activeStatus === status.value
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {counts[status.value] || 0}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
