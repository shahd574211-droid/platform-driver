'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CALL_BACK', label: 'Call Back' },
];

const REGISTRATION_STEP_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'STEP_1', label: 'Step 1' },
  { value: 'STEP_2', label: 'Step 2' },
  { value: 'STEP_3', label: 'Step 3' },
];

const CALL_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'ANSWERED', label: 'Answered' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'BUSY', label: 'Switch off' },
];

const COMPLETED_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

interface FilterBarProps {
  status: string;
  onStatusChange: (value: string) => void;
  registrationStep: string;
  onRegistrationStepChange: (value: string) => void;
  callStatus: string;
  onCallStatusChange: (value: string) => void;
  carStatus: string;
  onCarStatusChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  completed: string;
  onCompletedChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  whatsappPhone: string;
  onWhatsappPhoneChange: (value: string) => void;
  onWhatsappPhoneSearch: () => void;
  cities: string[];
  carStatuses: string[];
}

export function FilterBar({
  status,
  onStatusChange,
  registrationStep,
  onRegistrationStepChange,
  callStatus,
  onCallStatusChange,
  carStatus,
  onCarStatusChange,
  city,
  onCityChange,
  completed,
  onCompletedChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  whatsappPhone,
  onWhatsappPhoneChange,
  onWhatsappPhoneSearch,
  cities,
  carStatuses,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Row 1: الستة قوائم أولاً – بدون أرقام */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Registration step</Label>
          <Select value={registrationStep} onValueChange={onRegistrationStepChange}>
            <SelectTrigger className="w-[160px]" aria-label="Registration step">
              <SelectValue placeholder="Registration step" />
            </SelectTrigger>
            <SelectContent>
              {REGISTRATION_STEP_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Call status</Label>
          <Select value={callStatus} onValueChange={onCallStatusChange}>
            <SelectTrigger className="w-[140px]" aria-label="Call status">
              <SelectValue placeholder="Call status" />
            </SelectTrigger>
            <SelectContent>
              {CALL_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Car status</Label>
          <Select value={carStatus} onValueChange={onCarStatusChange}>
            <SelectTrigger className="w-[140px]" aria-label="Car status">
              <SelectValue placeholder="Car status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {carStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">City</Label>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger className="w-[160px]" aria-label="City">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Cities</SelectItem>
              {cities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Completed</Label>
          <Select value={completed} onValueChange={onCompletedChange}>
            <SelectTrigger className="w-[120px]" aria-label="Completed">
              <SelectValue placeholder="Completed" />
            </SelectTrigger>
            <SelectContent>
              {COMPLETED_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Data between, WhatsApp phone */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Data between
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-[160px]"
              aria-label="From date"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-[160px]"
              aria-label="To date"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">WhatsApp phone</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="WhatsApp number..."
              value={whatsappPhone}
              onChange={(e) => onWhatsappPhoneChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onWhatsappPhoneSearch()}
              className="w-[180px]"
              aria-label="WhatsApp phone"
            />
            <Button type="button" size="sm" onClick={onWhatsappPhoneSearch} aria-label="Search by WhatsApp phone">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
