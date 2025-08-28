import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador que verifica que una fecha sea futura (posterior a hoy)
 */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: string): boolean {
    if (!date) return false;
    
    const inputDate = new Date(date);
    const today = new Date();
    
    // Resetear la hora para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    
    return inputDate >= today;
  }

  defaultMessage(): string {
    return 'La fecha debe ser hoy o una fecha futura';
  }
}

/**
 * Validador que verifica que la fecha de salida sea posterior a la de entrada
 */
@ValidatorConstraint({ name: 'isAfterCheckIn', async: false })
export class IsAfterCheckIn implements ValidatorConstraintInterface {
  validate(checkOut: string, args: ValidationArguments): boolean {
    if (!checkOut) return false;
    
    const object = args.object as any;
    const checkIn = object.checkInDate;
    
    if (!checkIn) return false;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    return checkOutDate > checkInDate;
  }

  defaultMessage(): string {
    return 'La fecha de salida debe ser posterior a la fecha de entrada';
  }
}

/**
 * Validador que verifica que la duración de estadía esté dentro de límites aceptables
 */
@ValidatorConstraint({ name: 'isValidStayDuration', async: false })
export class IsValidStayDuration implements ValidatorConstraintInterface {
  validate(checkOut: string, args: ValidationArguments): boolean {
    if (!checkOut) return false;
    
    const object = args.object as any;
    const checkIn = object.checkInDate;
    
    if (!checkIn) return false;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const nights = this.calculateNights(checkInDate, checkOutDate);
    
    // Mínimo 1 noche, máximo 30 noches
    return nights >= 1 && nights <= 30;
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    return Math.round((checkOut.getTime() - checkIn.getTime()) / oneDay);
  }

  defaultMessage(): string {
    return 'La estadía debe ser mínimo 1 noche y máximo 30 noches';
  }
}

/**
 * Validador que verifica que un cliente sea mayor de 18 años (titular de reserva)
 */
@ValidatorConstraint({ name: 'isCustomerAdult', async: true })
export class IsCustomerAdult implements ValidatorConstraintInterface {
  async validate(customerId: number): Promise<boolean> {
    // Esta validación se implementará en el service
    // Ya que necesita inyección de dependencias
    return true;
  }

  defaultMessage(): string {
    return 'El titular de la reserva debe ser mayor de 18 años';
  }
}

/**
 * Validador que verifica que un código de reserva sea único
 */
@ValidatorConstraint({ name: 'isUniqueReservationCode', async: true })
export class IsUniqueReservationCode implements ValidatorConstraintInterface {
  async validate(code: string): Promise<boolean> {
    // Esta validación se implementará en el service
    // Ya que necesita inyección de dependencias
    return true;
  }

  defaultMessage(): string {
    return 'El código de reserva ya existe';
  }
}

/**
 * Utilidades para validaciones de fechas
 */
export class DateValidationUtils {
  /**
   * Calcula el número de noches entre dos fechas
   */
  static calculateNights(checkIn: Date, checkOut: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((checkOut.getTime() - checkIn.getTime()) / oneDay);
  }

  /**
   * Calcula la edad de una persona basada en su fecha de nacimiento
   */
  static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Verifica si una fecha está dentro de la ventana de reserva permitida
   */
  static isWithinBookingWindow(date: Date): boolean {
    const today = new Date();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const maxBookingDate = new Date(today.getTime() + oneYear);
    
    return date <= maxBookingDate;
  }

  /**
   * Verifica si una fecha es válida
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
