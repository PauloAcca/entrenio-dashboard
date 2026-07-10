const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vids = await prisma.exercise.findMany({
    where: { videoUrl: { not: null } },
    select: { videoUrl: true },
    take: 5
  });
  console.log("Videos:", vids);
}

main().catch(console.error).finally(() => prisma.$disconnect());
