import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const plan = await prisma.gym_nutrition_plans.findFirst();
  if (plan) {
    console.log("Before:", plan.isGeneralActive);
    const updated = await prisma.gym_nutrition_plans.update({
      where: { id: plan.id },
      data: { isGeneralActive: false }
    });
    console.log("After:", updated.isGeneralActive);
  }
}
main().finally(() => prisma.$disconnect());
