import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from 'node_modules/@prisma/adapter-pg/dist';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const school = await prisma.school.create({
    data: {
      name: 'Demo School',
      subdomain: 'demo',
    },
  });

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      role: Role.SCHOOL_ADMIN,
      email: 'admin@demo.com',
      passwordHash,
    },
  });

  console.log('School created:', school.id);
  console.log('Admin created:', admin.id, admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect;
  });
