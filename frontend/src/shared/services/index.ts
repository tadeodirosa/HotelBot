// Exportar API base
export * from './api'

// Exportar servicios
export * from './auth'
export * from './reservations'
export * from './customers'
export * from './rooms'
export * from './roomTypes'
export * from './mealPlans'

// Instancias de servicios listas para usar
export { authService } from './auth'
export { reservationsService } from './reservations'
export { customersService } from './customers'
export { roomsService } from './rooms'
export { roomTypesService } from './roomTypes'
export { mealPlansService } from './mealPlans'
