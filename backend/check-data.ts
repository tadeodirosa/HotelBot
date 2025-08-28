import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const customers = await prisma.customer.count();
    const rooms = await prisma.room.count();
    const roomTypes = await prisma.roomType.count();
    const mealPlans = await prisma.mealPlan.count();
    
    console.log('📊 Estado actual de la base de datos:');
    console.log(`   - Customers: ${customers}`);
    console.log(`   - Rooms: ${rooms}`);
    console.log(`   - Room Types: ${roomTypes}`);
    console.log(`   - Meal Plans: ${mealPlans}`);
    
    // Mostrar algunos datos de ejemplo
    const sampleRoom = await prisma.room.findFirst({
      include: { roomType: true }
    });
    
    const sampleCustomer = await prisma.customer.findFirst();
    
    console.log('\n📋 Datos de ejemplo:');
    if (sampleRoom) {
      console.log(`   - Habitación: ${sampleRoom.name} (${sampleRoom.roomType.name})`);
    }
    if (sampleCustomer) {
      console.log(`   - Cliente: ${sampleCustomer.firstName} ${sampleCustomer.lastName}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
