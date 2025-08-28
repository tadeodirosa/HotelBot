import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsBoolean, 
  Min, 
  Max, 
  MaxLength, 
  ArrayNotEmpty, 
  ArrayMaxSize,
  IsInt
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { MealPlanType } from '../interfaces/meal-plan.interface';

export class CreateMealPlanDto {
  @ApiProperty({
    description: 'Nombre del plan de comida',
    example: 'Desayuno Buffet Premium',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del plan de comida',
    example: 'Desayuno buffet completo con opciones internacionales, frutas frescas, repostería y bebidas calientes.',
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description: string;

  @ApiProperty({
    description: 'Tipo de plan de comida',
    enum: $Enums.MealPlanType,
    example: $Enums.MealPlanType.BREAKFAST,
  })
  @IsEnum($Enums.MealPlanType, { 
    message: 'El tipo debe ser uno de los valores permitidos: room_only, breakfast, half_board, full_board, all_inclusive' 
  })
  type: $Enums.MealPlanType;

  @ApiProperty({
    description: 'Precio diario del plan en USD',
    example: 25.99,
    minimum: 0,
    maximum: 999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Max(999.99, { message: 'El precio no puede exceder $999.99' })
  @Type(() => Number)
  dailyPrice: number;

  @ApiProperty({
    description: 'Lista de características incluidas en el plan',
    example: [
      'Buffet de desayuno internacional',
      'Frutas frescas de temporada',
      'Repostería artesanal',
      'Café, té y jugos naturales'
    ],
    type: [String],
    maxItems: 20,
  })
  @IsArray({ message: 'Las características deben ser una lista' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos una característica' })
  @ArrayMaxSize(20, { message: 'No puede tener más de 20 características' })
  @IsString({ each: true, message: 'Cada característica debe ser un texto válido' })
  @MaxLength(100, { each: true, message: 'Cada característica no puede exceder 100 caracteres' })
  features: string[];

  @ApiProperty({
    description: 'Estado activo del plan de comida',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}

export class UpdateMealPlanDto extends PartialType(CreateMealPlanDto) {
  @ApiProperty({
    description: 'Nombre del plan de comida (opcional)',
    example: 'Desayuno Buffet Premium Actualizado',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Descripción del plan de comida (opcional)',
    example: 'Descripción actualizada del plan de comida',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Tipo de plan de comida (opcional)',
    enum: $Enums.MealPlanType,
    example: $Enums.MealPlanType.HALF_BOARD,
    required: false,
  })
  @IsOptional()
  @IsEnum($Enums.MealPlanType, { 
    message: 'El tipo debe ser uno de los valores permitidos: room_only, breakfast, half_board, full_board, all_inclusive' 
  })
  type?: $Enums.MealPlanType;

  @ApiProperty({
    description: 'Precio diario del plan (opcional)',
    example: 35.99,
    minimum: 0,
    maximum: 999.99,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Max(999.99, { message: 'El precio no puede exceder $999.99' })
  @Type(() => Number)
  dailyPrice?: number;

  @ApiProperty({
    description: 'Lista de características (opcional)',
    example: [
      'Buffet de desayuno internacional actualizado',
      'Frutas frescas orgánicas',
      'Repostería sin gluten disponible'
    ],
    type: [String],
    maxItems: 20,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Las características deben ser una lista' })
  @ArrayMaxSize(20, { message: 'No puede tener más de 20 características' })
  @IsString({ each: true, message: 'Cada característica debe ser un texto válido' })
  @MaxLength(100, { each: true, message: 'Cada característica no puede exceder 100 caracteres' })
  features?: string[];

  @ApiProperty({
    description: 'Estado activo (opcional)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}

export class MealPlanSearchDto {
  @ApiProperty({
    description: 'Página actual para paginación',
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
    description: 'Cantidad de resultados por página',
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
    description: 'Término de búsqueda en nombre y descripción',
    example: 'buffet',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto válido' })
  @MaxLength(100, { message: 'El término de búsqueda no puede exceder 100 caracteres' })
  search?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de plan',
    enum: $Enums.MealPlanType,
    example: $Enums.MealPlanType.BREAKFAST,
    required: false,
  })
  @IsOptional()
  @IsEnum($Enums.MealPlanType, { 
    message: 'El tipo debe ser uno de los valores permitidos: room_only, breakfast, half_board, full_board, all_inclusive' 
  })
  type?: $Enums.MealPlanType;

  @ApiProperty({
    description: 'Precio mínimo diario',
    example: 10.00,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio mínimo debe ser un número válido' })
  @Min(0, { message: 'El precio mínimo no puede ser negativo' })
  minPrice?: number;

  @ApiProperty({
    description: 'Precio máximo diario',
    example: 100.00,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio máximo debe ser un número válido' })
  @Min(0, { message: 'El precio máximo no puede ser negativo' })
  maxPrice?: number;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    example: 'name',
    enum: ['name', 'price', 'type', 'createdAt'],
    default: 'name',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser un texto válido' })
  sortBy?: 'name' | 'price' | 'type' | 'createdAt' = 'name';

  @ApiProperty({
    description: 'Orden de clasificación',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El orden debe ser un texto válido' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class CalculateMealPlanPriceDto {
  @ApiProperty({
    description: 'Número de días para el cálculo',
    example: 7,
    minimum: 1,
    maximum: 365,
  })
  @IsInt({ message: 'Los días deben ser un número entero' })
  @Min(1, { message: 'Debe ser al menos 1 día' })
  @Max(365, { message: 'No puede exceder 365 días' })
  @Type(() => Number)
  days: number;

  @ApiProperty({
    description: 'Aplicar descuento por estancia larga',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El descuento debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  applyLongStayDiscount?: boolean = false;
}
