import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test para verificar que los tipos están correctos
async function testMealPlan() {
  const result = await prisma.mealPlan.create({
    data: {
      name: 'Test Plan',
      description: 'Test description',
      type: 'BREAKFAST',
      dailyPrice: 25.50,
      isActive: true,
    }
  });
  
  console.log('MealPlan created:', result);
}

// testMealPlan();
