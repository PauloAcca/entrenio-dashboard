import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const gym = await prisma.gyms.upsert({
    where: { name: 'Entrenio Test Gym' },
    update: {},
    create: {
      name: 'Entrenio Test Gym',
      status: 'active',
      plan: 'pro',
    },
  });

  console.log(`Created gym with id: ${gym.id}`);

  const owner = await prisma.owner.upsert({
    where: { email: 'admin@entrenio.com' },
    update: {},
    create: {
      email: 'admin@entrenio.com',
      name: 'Admin User',
      gymId: gym.id,
    },
  });

  console.log(`Created owner with id: ${owner.id}`);

  const user = await prisma.user.upsert({
    where: { email: 'user@entrenio.com' },
    update: {},
    create: {
      email: 'user@entrenio.com',
      password: 'password',
    },
  });

  await prisma.user_training_profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      objetivo: 'ganar_masa_muscular',
      experiencia: 'intermedio',
      dias: 4,
      tiempo: 60,
      enfoque: 'strength',
      intensidad: 'high',
      lesion: null,
    },
  });

  console.log(`Created user with id: ${user.id}`);

  const membership = await prisma.memberships.upsert({
    where: { user_id_gym_id: { user_id: user.id, gym_id: gym.id } },
    update: {
        starts_at: new Date(),
        ends_at: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
    create: {
      user_id: user.id,
      gym_id: gym.id,
      status: 'active',
      starts_at: new Date(),
      ends_at: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  console.log(`Created membership with id: ${membership.id}`);

  // --- Machines ---
  const benchPress = await prisma.machine_template.upsert({
    where: { slug: 'bench-press' },
    update: {},
    create: {
      name: 'Press de Banca',
      slug: 'bench-press',
      category: 'Fuerza',
      body_region: 'Pecho',
    },
  });
  console.log(`Created template: ${benchPress.name}`);

  const treadmill = await prisma.machine_template.upsert({
    where: { slug: 'treadmill' },
    update: {},
    create: {
      name: 'Cinta de Correr',
      slug: 'treadmill',
      category: 'Cardio',
      body_region: 'Cuerpo Completo',
    },
  });
  console.log(`Created template: ${treadmill.name}`);

  // Add equipment instances to the gym
  const benchPressEq = await prisma.equipment.create({
    data: {
      gymId: gym.id,
      machineTemplateId: benchPress.id,
      location: 'Zona de Pesas',
    },
  });

  const treadmillEq = await prisma.equipment.create({
    data: {
      gymId: gym.id,
      machineTemplateId: treadmill.id,
      location: 'Zona de Cardio',
    },
  });
  console.log('Added equipment to gym.');

  // --- Equipment Usage ---
  await prisma.equipment_usage.create({
    data: {
      gymId: gym.id,
      equipmentId: benchPressEq.id,
      userId: user.id,
      source: 'qr',
    },
  });

  await prisma.equipment_usage.create({
    data: {
      gymId: gym.id,
      equipmentId: treadmillEq.id,
      userId: user.id,
      source: 'nfc',
    },
  });
  console.log('Added equipment usage history.');

  // --- Inactive Member ---
  const inactiveUser = await prisma.user.upsert({
    where: { email: 'inactive@entrenio.com' },
    update: {},
    create: {
      email: 'inactive@entrenio.com',
      password: 'password',
    },
  });

  await prisma.user_training_profile.upsert({
    where: { userId: inactiveUser.id },
    update: {},
    create: {
      userId: inactiveUser.id,
      objetivo: 'ganar_masa_muscular',
      experiencia: 'intermedio',
      dias: 4,
      tiempo: 60,
      enfoque: 'strength',
      intensidad: 'high',
      lesion: null,
    },
  });

  console.log(`Created inactive user with id: ${inactiveUser.id}`);

  await prisma.memberships.upsert({
    where: { user_id_gym_id: { user_id: inactiveUser.id, gym_id: gym.id } },
    update: {},
    create: {
      user_id: inactiveUser.id,
      gym_id: gym.id,
      status: 'inactive',
    },
  });
  console.log('Created inactive membership.');

  // --- Demographic Seed Data ---
  const createMember = async (email: string, gender: string, age: number, goal: string) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: 'password',
      },
    });

    await prisma.user_training_profile.upsert({
      where: { userId: user.id },
      update: {
        objetivo: goal,
        sexo: gender,
        edad: age,
      },
      create: {
        userId: user.id,
        objetivo: goal,
        experiencia: 'intermedio',
        dias: 3,
        tiempo: 60,
        enfoque: 'hybrid',
        intensidad: 'medium',
        sexo: gender,
        edad: age,
      },
    });

    await prisma.memberships.upsert({
      where: { user_id_gym_id: { user_id: user.id, gym_id: gym.id } },
      update: {
        starts_at: new Date(),
        ends_at: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
      create: {
        user_id: user.id,
        gym_id: gym.id,
        status: 'active',
        starts_at: new Date(),
        ends_at: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
    });
    console.log(`Created member: ${email} (${gender}, ${age}y, ${goal})`);
  };

  // <18
  await createMember('teen1@entrenio.com', 'Hombre', 16, 'ganar_masa_muscular');
  await createMember('teen2@entrenio.com', 'Mujer', 17, 'mantener_peso');

  // 18-24
  await createMember('young1@entrenio.com', 'Hombre', 22, 'perder_peso');
  await createMember('young2@entrenio.com', 'Mujer', 20, 'ganar_masa_muscular');

  // 25-30
  await createMember('mid1@entrenio.com', 'Otro', 28, 'mantener_peso');
  await createMember('mid2@entrenio.com', 'Hombre', 29, 'perder_peso');

  // 31-40
  await createMember('adult1@entrenio.com', 'Mujer', 35, 'perder_peso');
  await createMember('adult2@entrenio.com', 'Hombre', 38, 'ganar_masa_muscular');

  // 41-60
  await createMember('senior1@entrenio.com', 'Mujer', 50, 'mantener_peso');
  await createMember('senior2@entrenio.com', 'Hombre', 45, 'perder_peso');

  // >60
  await createMember('elder1@entrenio.com', 'Mujer', 65, 'mantener_peso');

  console.log(`Created inactive membership.`);

    // --- Exercise History (for Popular Exercises) ---
    const exercisesToSeed = [
      { name: 'Press de Banca', count: 15 },
      { name: 'Sentadilla', count: 12 },
      { name: 'Peso Muerto', count: 10 },
      { name: 'Dominadas', count: 8 },
      { name: 'Press Militar', count: 5 },
      { name: 'Curl de Bíceps', count: 20 }, // Should be top 1
    ];

    for (const ex of exercisesToSeed) {
      for (let i = 0; i < ex.count; i++) {
        // Distribute among users (3, 5-15)
        const randomUser = Math.floor(Math.random() * 10) + 5; // User 5 to 14
         // Use user 3 sometimes
        const userId = Math.random() > 0.8 ? 3 : randomUser;

        await prisma.exercise_history.create({
          data: {
             user_id: userId,
             exercise_name: ex.name,
             weight_kg: 50,
             reps: 10,
             sets: 3,
             date: new Date(),
          }
        });
      }
    }
    console.log('Seeded exercise history.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
