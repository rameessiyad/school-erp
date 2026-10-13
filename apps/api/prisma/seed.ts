import 'dotenv/config';
import { PrismaClient, Role } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt'; // use 'bcryptjs' if that's what your auth module uses

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUPER_ADMIN_EMAIL = 'superadmin@skoladeck.com';
const SUPER_ADMIN_PASSWORD = 'superadmin@123';

async function main() {
  console.log('Seeding super admin...');

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  // schoolId is null for a super admin, and Postgres treats NULLs as distinct
  // in unique constraints, so we can't upsert on [schoolId, email].
  const existing = await prisma.user.findFirst({
    where: { schoolId: null, email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: Role.SUPER_ADMIN, isActive: true },
    });
    console.log(`Super admin updated: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      role: Role.SUPER_ADMIN,
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      isActive: true,
    },
    select: { id: true, email: true },
  });

  console.log(`Super admin created: ${user.email} (${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
