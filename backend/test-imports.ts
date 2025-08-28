import * as prisma from '@prisma/client';

console.log('Prisma exports:', Object.keys(prisma));
console.log('Has MealPlanType:', 'MealPlanType' in prisma);
console.log('Has Decimal:', 'Decimal' in prisma);
