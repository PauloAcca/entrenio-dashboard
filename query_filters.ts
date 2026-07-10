import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const muscles = await prisma.exercise.findMany({
    select: { primaryMuscleEs: true },
    distinct: ['primaryMuscleEs'],
  });
  console.log("Muscles:", muscles.map(m => m.primaryMuscleEs).filter(Boolean));

  const equipment = await prisma.exercise.findMany({
    select: { equipmentType: true },
    distinct: ['equipmentType'],
  });
  console.log("Equipment:", equipment.map(e => e.equipmentType).filter(Boolean));
}

main().catch(console.error).finally(() => prisma.$disconnect());
