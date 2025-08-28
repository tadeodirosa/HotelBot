const { PrismaClient, Prisma } = require('@prisma/client');

console.log('=== PRISMA CLIENT INSPECTION ===');

// Check available types and enums
console.log('\n1. Available types from Prisma:');
console.log('  - Prisma:', typeof Prisma);
console.log('  - Has MealPlan types:', 'MealPlan' in Prisma);

// Check what's in Prisma.MealPlan
if (Prisma.MealPlan) {
  console.log('  - MealPlan fields:', Object.keys(Prisma.MealPlan));
}

// Check input types
console.log('\n2. Input types available:');
console.log('  - MealPlanCreateInput:', 'MealPlanCreateInput' in Prisma);
console.log('  - MealPlanUpdateInput:', 'MealPlanUpdateInput' in Prisma);
console.log('  - MealPlanWhereInput:', 'MealPlanWhereInput' in Prisma);

// Create a client instance to check model
const prisma = new PrismaClient();

console.log('\n3. PrismaClient model methods:');
console.log('  - Has mealPlan model:', 'mealPlan' in prisma);

if (prisma.mealPlan) {
  console.log('  - mealPlan methods:', Object.getOwnPropertyNames(prisma.mealPlan).filter(name => typeof prisma.mealPlan[name] === 'function'));
}

// Close connection
prisma.$disconnect();

console.log('\n=== END INSPECTION ===');
