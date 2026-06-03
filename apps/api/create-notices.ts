import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS notices (
      "id" SERIAL PRIMARY KEY,
      "message" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "gymId" UUID NULL,
      "type" VARCHAR(50) NOT NULL DEFAULT 'info',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_notices_gymId" ON "notices" ("gymId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_notices_isActive" ON "notices" ("isActive");`);

  console.log("Notices table created successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
