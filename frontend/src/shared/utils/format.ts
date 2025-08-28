/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number, currency: string = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format a date string to localized format
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  return new Date(dateString).toLocaleDateString('es-AR', options || defaultOptions)
}

/**
 * Format a date with time
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a number with separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-AR').format(num)
}

/**
 * Calculate difference in days between two dates
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (+54) 11 1234-5678
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, 2)
    const areaCode = cleaned.slice(2, 4)
    const firstPart = cleaned.slice(4, 8)
    const secondPart = cleaned.slice(8, 12)
    
    return `(+${countryCode}) ${areaCode} ${firstPart}-${secondPart}`
  }
  
  return phone
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
