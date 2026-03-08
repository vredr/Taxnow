import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0.00'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return new Intl.NumberFormat('en-IN').format(value)
}
