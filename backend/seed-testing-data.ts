import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBasicData() {
  console.log('🏨 Creando datos básicos para testing del módulo Reservations...');

  try {
    // 1. Crear Room Types
    console.log('🏠 Creando tipos de habitación...');
    const roomTypes = await Promise.all([
      prisma.roomType.create({
        data: {
          name: 'Habitación Individual',
          capacity: 1,
          basePrice: 75.00,
          description: 'Habitación cómoda para una persona con cama individual',
          amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
        },
      }),
      prisma.roomType.create({
        data: {
          name: 'Habitación Doble',
          capacity: 2,
          basePrice: 120.00,
          description: 'Habitación amplia con cama matrimonial para dos personas',
          amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado', 'Minibar'],
        },
      }),
      prisma.roomType.create({
        data: {
          name: 'Suite Familiar',
          capacity: 4,
          basePrice: 200.00,
          description: 'Suite espaciosa ideal para familias con sala de estar',
          amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado', 'Minibar', 'Sala de estar', 'Balcón'],
        },
      }),
    ]);
    console.log(`✅ ${roomTypes.length} tipos de habitación creados`);

    // 2. Crear Rooms
    console.log('🏠 Creando habitaciones...');
    const rooms = [];
    
    // Habitaciones del tipo 1 (Individual)
    for (let i = 1; i <= 3; i++) {
      rooms.push(await prisma.room.create({
        data: {
          name: `101${i}`,
          roomTypeId: roomTypes[0].id,
          floor: 1,
          status: 'AVAILABLE',
        },
      }));
    }
    
    // Habitaciones del tipo 2 (Doble)
    for (let i = 1; i <= 5; i++) {
      rooms.push(await prisma.room.create({
        data: {
          name: `201${i}`,
          roomTypeId: roomTypes[1].id,
          floor: 2,
          status: 'AVAILABLE',
        },
      }));
    }
    
    // Habitaciones del tipo 3 (Suite)
    for (let i = 1; i <= 2; i++) {
      rooms.push(await prisma.room.create({
        data: {
          name: `301${i}`,
          roomTypeId: roomTypes[2].id,
          floor: 3,
          status: 'AVAILABLE',
        },
      }));
    }
    console.log(`✅ ${rooms.length} habitaciones creadas`);

    // 3. Crear Customers
    console.log('👥 Creando clientes de prueba...');
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          firstName: 'Juan',
          lastName: 'Pérez García',
          dni: '12345678A',
          email: 'juan.perez@email.com',
          phone: '+34 666 123 456',
          dateOfBirth: new Date('1985-05-15'),
          nationality: 'Española',
          preferences: {
            roomPreferences: { floor: 'high', view: 'sea' },
            dietaryRestrictions: [],
            communicationLanguage: 'es'
          },
        },
      }),
      prisma.customer.create({
        data: {
          firstName: 'María',
          lastName: 'González López',
          dni: '87654321B',
          email: 'maria.gonzalez@email.com',
          phone: '+34 677 987 654',
          dateOfBirth: new Date('1990-08-22'),
          nationality: 'Española',
          preferences: {
            roomPreferences: { bedType: 'king', view: 'garden' },
            dietaryRestrictions: ['vegetarian'],
            communicationLanguage: 'es'
          },
        },
      }),
      prisma.customer.create({
        data: {
          firstName: 'Carlos',
          lastName: 'Rodríguez Martín',
          dni: '11223344C',
          email: 'carlos.rodriguez@email.com',
          phone: '+34 655 444 333',
          dateOfBirth: new Date('1978-12-03'),
          nationality: 'Española',
          preferences: {
            roomPreferences: { floor: 'low', quietRoom: true },
            dietaryRestrictions: [],
            communicationLanguage: 'es'
          },
        },
      }),
      prisma.customer.create({
        data: {
          firstName: 'Ana',
          lastName: 'Martín Sánchez',
          dni: '55667788D',
          email: 'ana.martin@email.com',
          phone: '+34 688 111 222',
          dateOfBirth: new Date('1995-03-10'),
          nationality: 'Española',
          preferences: {
            roomPreferences: { view: 'city', modernDecor: true },
            dietaryRestrictions: ['gluten-free'],
            communicationLanguage: 'es'
          },
        },
      }),
    ]);
    console.log(`✅ ${customers.length} clientes creados`);

    console.log('\n🎉 ¡Datos básicos creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${roomTypes.length} tipos de habitación`);
    console.log(`   - ${rooms.length} habitaciones`);
    console.log(`   - ${customers.length} clientes`);
    console.log(`   - 6 planes de comida (ya existían)`);
    console.log('\n🧪 Listo para testing del módulo Reservations!');

    return {
      roomTypes,
      rooms,
      customers,
    };

  } catch (error) {
    console.error('❌ Error creando datos básicos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBasicData();
