import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
  MaxLength,
  Validate,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus, PaymentMethod, DiscountType } from '../interfaces/reservation.enums';
import {
  IsFutureDate,
  IsAfterCheckIn,
  IsValidStayDuration,
} from '../validators/date.validators';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Código único de la reserva',
    example: 'RSV-2025-001',
    minLength: 6,
    maxLength: 20,
    pattern: '^[A-Z0-9-]+$',
  })
  @IsString({ message: 'El código de reserva debe ser un texto válido' })
  @IsNotEmpty({ message: 'El código de reserva es obligatorio' })
  @Length(6, 20, { message: 'El código debe tener entre 6 y 20 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código solo puede contener letras mayúsculas, números y guiones' 
  })
  reservationCode: string;

  @ApiProperty({
    description: 'ID del cliente titular de la reserva (debe ser mayor de 18 años)',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'El ID del cliente debe ser un número entero válido' })
  @IsNotEmpty({ message: 'El cliente titular es obligatorio' })
  @Min(1, { message: 'El ID del cliente debe ser mayor a 0' })
  customerId: number;

  @ApiProperty({
    description: 'ID de la habitación a reservar',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'El ID de la habitación debe ser un número entero válido' })
  @IsNotEmpty({ message: 'La habitación es obligatoria' })
  @Min(1, { message: 'El ID de la habitación debe ser mayor a 0' })
  roomId: number;

  @ApiProperty({
    description: 'ID del plan de comida (opcional)',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del plan de comida debe ser un número entero válido' })
  @Min(1, { message: 'El ID del plan de comida debe ser mayor a 0' })
  mealPlanId?: number;

  @ApiProperty({
    description: 'Fecha de check-in (debe ser hoy o futura)',
    example: '2025-09-01',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de entrada debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de entrada es obligatoria' })
  @Validate(IsFutureDate, { message: 'La fecha de entrada debe ser hoy o una fecha futura' })
  checkInDate: string;

  @ApiProperty({
    description: 'Fecha de check-out (debe ser posterior a check-in)',
    example: '2025-09-05',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de salida debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de salida es obligatoria' })
  @Validate(IsAfterCheckIn, { message: 'La fecha de salida debe ser posterior a la fecha de entrada' })
  @Validate(IsValidStayDuration, { message: 'La estadía debe ser mínimo 1 noche, máximo 30 noches' })
  checkOutDate: string;

  @ApiProperty({
    description: 'Número total de huéspedes',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsInt({ message: 'El número de huéspedes debe ser un número entero' })
  @Min(1, { message: 'Debe haber mínimo 1 huésped' })
  @Max(20, { message: 'Máximo 20 huéspedes permitidos' })
  guestCount: number;

  @ApiProperty({
    description: 'Método de pago preferido',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { 
    message: 'El método de pago debe ser uno de los valores permitidos' 
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Tipo de descuento a aplicar',
    enum: DiscountType,
    example: DiscountType.NONE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DiscountType, { 
    message: 'El tipo de descuento debe ser uno de los valores permitidos' 
  })
  discountType?: DiscountType;

  @ApiProperty({
    description: 'Solicitudes especiales del huésped',
    example: 'Habitación con vista al mar, cama king size',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las solicitudes especiales deben ser texto válido' })
  @MaxLength(1000, { message: 'Las solicitudes especiales no pueden exceder 1000 caracteres' })
  specialRequests?: string;

  @ApiProperty({
    description: 'Notas internas de la reserva',
    example: 'Cliente VIP, requiere check-in prioritario',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto válido' })
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notes?: string;
}

export class UpdateReservationDto {
  @ApiProperty({
    description: 'Código único de la reserva (opcional)',
    example: 'RSV-2025-001-UPD',
    minLength: 6,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código de reserva debe ser un texto válido' })
  @Length(6, 20, { message: 'El código debe tener entre 6 y 20 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código solo puede contener letras mayúsculas, números y guiones' 
  })
  reservationCode?: string;

  @ApiProperty({
    description: 'Fecha de check-in (opcional)',
    example: '2025-09-02',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de entrada debe ser válida (formato: YYYY-MM-DD)' })
  @Validate(IsFutureDate, { message: 'La fecha de entrada debe ser hoy o una fecha futura' })
  checkInDate?: string;

  @ApiProperty({
    description: 'Fecha de check-out (opcional)',
    example: '2025-09-06',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de salida debe ser válida (formato: YYYY-MM-DD)' })
  @Validate(IsAfterCheckIn, { message: 'La fecha de salida debe ser posterior a la fecha de entrada' })
  @Validate(IsValidStayDuration, { message: 'La estadía debe ser mínimo 1 noche, máximo 30 noches' })
  checkOutDate?: string;

  @ApiProperty({
    description: 'Número total de huéspedes (opcional)',
    example: 3,
    minimum: 1,
    maximum: 20,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El número de huéspedes debe ser un número entero' })
  @Min(1, { message: 'Debe haber mínimo 1 huésped' })
  @Max(20, { message: 'Máximo 20 huéspedes permitidos' })
  guestCount?: number;

  @ApiProperty({
    description: 'Método de pago (opcional)',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { 
    message: 'El método de pago debe ser uno de los valores permitidos' 
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Tipo de descuento (opcional)',
    enum: DiscountType,
    example: DiscountType.LONG_STAY,
    required: false,
  })
  @IsOptional()
  @IsEnum(DiscountType, { 
    message: 'El tipo de descuento debe ser uno de los valores permitidos' 
  })
  discountType?: DiscountType;

  @ApiProperty({
    description: 'Solicitudes especiales (opcional)',
    example: 'Cambio: habitación con vista al jardín',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las solicitudes especiales deben ser texto válido' })
  @MaxLength(1000, { message: 'Las solicitudes especiales no pueden exceder 1000 caracteres' })
  specialRequests?: string;

  @ApiProperty({
    description: 'Notas internas (opcional)',
    example: 'Actualización solicitada por el cliente',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto válido' })
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notes?: string;
}

export class ChangeReservationStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la reserva',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @IsEnum(ReservationStatus, { 
    message: 'El estado debe ser uno de los valores permitidos' 
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Motivo del cambio de estado',
    example: 'Pago confirmado por el cliente',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser texto válido' })
  @MaxLength(200, { message: 'El motivo no puede exceder 200 caracteres' })
  reason?: string;
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Fecha de check-in',
    example: '2025-09-01',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de entrada debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de entrada es obligatoria' })
  @Validate(IsFutureDate, { message: 'La fecha de entrada debe ser hoy o una fecha futura' })
  checkInDate: string;

  @ApiProperty({
    description: 'Fecha de check-out',
    example: '2025-09-05',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de salida debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de salida es obligatoria' })
  @Validate(IsAfterCheckIn, { message: 'La fecha de salida debe ser posterior a la fecha de entrada' })
  @Validate(IsValidStayDuration, { message: 'La estadía debe ser mínimo 1 noche, máximo 30 noches' })
  checkOutDate: string;

  @ApiProperty({
    description: 'Número de huéspedes',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @IsInt({ message: 'El número de huéspedes debe ser un número entero' })
  @Min(1, { message: 'Debe haber mínimo 1 huésped' })
  @Max(20, { message: 'Máximo 20 huéspedes permitidos' })
  guestCount: number;

  @ApiProperty({
    description: 'ID del tipo de habitación específico (opcional)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del tipo de habitación debe ser un número entero' })
  @Min(1, { message: 'El ID del tipo de habitación debe ser mayor a 0' })
  roomTypeId?: number;
}

export class ReservationSearchDto {
  @ApiProperty({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Búsqueda por código de reserva o nombre de cliente',
    example: 'RSV-2025',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser texto válido' })
  @MaxLength(100, { message: 'El término de búsqueda no puede exceder 100 caracteres' })
  search?: string;

  @ApiProperty({
    description: 'Filtrar por estado de reserva',
    enum: ReservationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus, { 
    message: 'El estado debe ser uno de los valores permitidos' 
  })
  status?: ReservationStatus;

  @ApiProperty({
    description: 'Filtrar por ID de cliente',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @Min(1, { message: 'El ID del cliente debe ser mayor a 0' })
  customerId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de habitación',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la habitación debe ser un número entero' })
  @Min(1, { message: 'El ID de la habitación debe ser mayor a 0' })
  roomId?: number;

  @ApiProperty({
    description: 'Fecha de check-in desde',
    example: '2025-09-01',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser válida (formato: YYYY-MM-DD)' })
  checkInDateFrom?: string;

  @ApiProperty({
    description: 'Fecha de check-in hasta',
    example: '2025-09-30',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser válida (formato: YYYY-MM-DD)' })
  checkInDateTo?: string;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    example: 'checkInDate',
    enum: ['checkInDate', 'checkOutDate', 'totalAmount', 'status', 'createdAt'],
    default: 'checkInDate',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser texto válido' })
  sortBy?: 'checkInDate' | 'checkOutDate' | 'totalAmount' | 'status' | 'createdAt' = 'checkInDate';

  @ApiProperty({
    description: 'Orden de clasificación',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El orden debe ser texto válido' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class CalculateReservationPriceDto {
  @ApiProperty({
    description: 'ID de la habitación',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'El ID de la habitación debe ser un número entero' })
  @Min(1, { message: 'El ID de la habitación debe ser mayor a 0' })
  roomId: number;

  @ApiProperty({
    description: 'ID del plan de comida (opcional)',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del plan de comida debe ser un número entero' })
  @Min(1, { message: 'El ID del plan de comida debe ser mayor a 0' })
  mealPlanId?: number;

  @ApiProperty({
    description: 'Fecha de check-in',
    example: '2025-09-01',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de entrada debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de entrada es obligatoria' })
  checkInDate: string;

  @ApiProperty({
    description: 'Fecha de check-out',
    example: '2025-09-05',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de salida debe ser válida (formato: YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de salida es obligatoria' })
  checkOutDate: string;

  @ApiProperty({
    description: 'Tipo de descuento a aplicar',
    enum: DiscountType,
    example: DiscountType.NONE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DiscountType, { 
    message: 'El tipo de descuento debe ser uno de los valores permitidos' 
  })
  discountType?: DiscountType;
}
