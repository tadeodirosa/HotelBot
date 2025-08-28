/**
 * Estados posibles de una reserva (basado en el schema de Prisma)
 */
export enum ReservationStatus {
  /** Reserva pendiente de confirmación */
  PENDING = 'PENDING',
  
  /** Reserva confirmada */
  CONFIRMED = 'CONFIRMED',
  
  /** Reserva cancelada */
  CANCELLED = 'CANCELLED',
  
  /** Reserva completada */
  COMPLETED = 'COMPLETED',
}

/**
 * Estados adicionales para lógica de negocio (no en DB)
 */
export enum ExtendedReservationStatus {
  /** Cliente ha hecho check-in */
  CHECKED_IN = 'CHECKED_IN',
  
  /** Cliente ha hecho check-out */
  CHECKED_OUT = 'CHECKED_OUT',
  
  /** Reserva no presentada (no-show) */
  NO_SHOW = 'NO_SHOW',
}

/**
 * Tipos de métodos de pago para reservas
 */
export enum PaymentMethod {
  /** Efectivo */
  CASH = 'CASH',
  
  /** Tarjeta de crédito */
  CREDIT_CARD = 'CREDIT_CARD',
  
  /** Transferencia bancaria */
  BANK_TRANSFER = 'BANK_TRANSFER',
  
  /** Pago pendiente */
  PENDING = 'PENDING',
}

/**
 * Tipos de descuentos aplicables
 */
export enum DiscountType {
  /** Sin descuento */
  NONE = 'NONE',
  
  /** Descuento por estancia larga */
  LONG_STAY = 'LONG_STAY',
  
  /** Descuento por cliente frecuente */
  FREQUENT_GUEST = 'FREQUENT_GUEST',
  
  /** Descuento corporativo */
  CORPORATE = 'CORPORATE',
  
  /** Descuento promocional */
  PROMOTIONAL = 'PROMOTIONAL',
}
