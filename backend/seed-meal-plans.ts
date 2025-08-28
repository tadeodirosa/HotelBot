import { PrismaClient, $Enums } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMealPlans() {
  console.log('🍽️ Sembrando datos de MealPlans...');

  // Limpiar datos existentes
  await prisma.mealPlan.deleteMany();

  // Crear planes de comida de ejemplo
  const mealPlans = [
    {
      name: 'Solo Habitación',
      description: 'Tarifa básica de habitación sin comidas incluidas. Ideal para huéspedes que prefieren explorar opciones gastronómicas locales.',
      type: $Enums.MealPlanType.ROOM_ONLY,
      dailyPrice: 0,
      features: ['Habitación', 'WiFi gratuito', 'Limpieza diaria'],
    },
    {
      name: 'Desayuno Continental',
      description: 'Delicioso desayuno continental con productos frescos, frutas de temporada, bollería artesanal y café de especialidad.',
      type: $Enums.MealPlanType.BREAKFAST,
      dailyPrice: 25.99,
      features: ['Desayuno buffet', 'Frutas frescas', 'Café premium', 'Bollería artesanal', 'Zumos naturales'],
    },
    {
      name: 'Media Pensión Gourmet',
      description: 'Experiencia culinaria completa con desayuno buffet y cena de tres tiempos preparada por nuestros chefs especializados.',
      type: $Enums.MealPlanType.HALF_BOARD,
      dailyPrice: 65.99,
      features: ['Desayuno buffet completo', 'Cena de 3 tiempos', 'Menú chef', 'Opciones vegetarianas', 'Vinos locales'],
    },
    {
      name: 'Pensión Completa Premium',
      description: 'Plan todo incluido con desayuno, almuerzo y cena. Perfecto para una experiencia gastronómica sin preocupaciones.',
      type: $Enums.MealPlanType.FULL_BOARD,
      dailyPrice: 95.99,
      features: ['Desayuno buffet', 'Almuerzo a la carta', 'Cena gourmet', 'Snacks entre comidas', 'Bebidas incluidas'],
    },
    {
      name: 'Todo Incluido Luxury',
      description: 'La experiencia más completa con todas las comidas, bebidas premium, snacks 24h y acceso a servicios exclusivos.',
      type: $Enums.MealPlanType.ALL_INCLUSIVE,
      dailyPrice: 145.99,
      features: ['Todas las comidas', 'Bebidas premium', 'Snacks 24h', 'Room service', 'Bar abierto', 'Actividades incluidas'],
    },
  ];

  for (const planData of mealPlans) {
    const plan = await prisma.mealPlan.create({
      data: planData,
    });
    console.log(`✅ Plan creado: ${plan.name} (${plan.type}) - $${plan.dailyPrice}/día`);
  }

  console.log('🎉 ¡Datos de MealPlans sembrados exitosamente!');
}

async function main() {
  try {
    await seedMealPlans();
  } catch (error) {
    console.error('❌ Error sembrando datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
