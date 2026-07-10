const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const equipment = await prisma.exercise.findMany({
    select: { equipmentType: true },
    distinct: ['equipmentType'],
  });
  console.log("Equipment:", equipment.map(e => e.equipmentType).filter(Boolean));
}

main().catch(console.error).finally(() => prisma.$disconnect());
