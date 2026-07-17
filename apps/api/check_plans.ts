import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.gym_nutrition_plans.findMany().then(console.log).finally(() => prisma.$disconnect());
