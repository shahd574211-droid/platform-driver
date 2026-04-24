import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

export function formatPhoneNumber(phone: string): string {
  // Format phone number for display
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-warning-bg text-warning border-warning-border',
    COMPLETED: 'bg-success-bg text-success border-success-border',
    REJECTED: 'bg-error-bg text-error border-error-border',
    CALL_BACK: 'bg-primary-50 text-primary border-primary-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getCallStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ANSWERED: 'bg-success-bg text-success border-success-border',
    NO_ANSWER: 'bg-warning-bg text-warning border-warning-border',
    BUSY: 'bg-error-bg text-error border-error-border',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}
