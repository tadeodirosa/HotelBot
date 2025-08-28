import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTestData() {
  try {
    // Obtener primer cliente
    const customer = await prisma.customer.findFirst();
    
    // Obtener primera habitación doble
    const room = await prisma.room.findFirst({
      include: { roomType: true },
      where: {
        roomType: {
          capacity: { gte: 2 }
        }
      }
    });
    
    // Obtener primer meal plan
    const mealPlan = await prisma.mealPlan.findFirst();
    
    console.log('🎯 Datos para testing:');
    console.log(`   - Customer ID: ${customer?.id} (${customer?.firstName} ${customer?.lastName})`);
    console.log(`   - Room ID: ${room?.id} (${room?.name} - ${room?.roomType.name})`);
    console.log(`   - Meal Plan ID: ${mealPlan?.id} (${mealPlan?.name})`);
    
    // Crear JSON para testing
    const testData = {
      customerId: customer?.id,
      roomId: room?.id,
      mealPlanId: mealPlan?.id,
      customerEmail: customer?.email,
      roomName: room?.name,
      mealPlanName: mealPlan?.name
    };
    
    console.log('\n📋 JSON para copy/paste:');
    console.log(JSON.stringify(testData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTestData();
