import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ENUM_TO_LABEL: Record<string, string> = {
  ACCOUNTANT: 'Accountant',
  ADMISSION_OFFICER: 'Admission Officer',
  RECEPTIONIST: 'Receptionist',
};

async function main() {
  const schools = await prisma.school.findMany({ select: { id: true } });

  console.log('Migrating staff designations...');

  for (const school of schools) {
    // Create the three default designations for this school if they don't exist yet
    const designationMap = new Map<string, string>(); // enum value -> new designation id

    for (const [enumValue, label] of Object.entries(ENUM_TO_LABEL)) {
      const designation = await prisma.staffDesignation.upsert({
        where: { schoolId_name: { schoolId: school.id, name: label } },
        update: {},
        create: { schoolId: school.id, name: label },
      });

      designationMap.set(enumValue, designation.id);

      console.log(`  Designation ready: ${label} (school ${school.id})`);
    }

    // Backfill designationId on every staff row in this school based on the old enum
    const staffRows = await prisma.staff.findMany({
      where: { schoolId: school.id, designationOld: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        designationOld: true,
      },
    });

    for (const staff of staffRows) {
      const newId = designationMap.get(staff.designationOld!);
      if (!newId) continue;

      await prisma.staff.update({
        where: { id: staff.id },
        data: { designationId: newId },
      });

      console.log(
        `    Backfilled ${staff.firstName} ${staff.lastName ?? ''} -> ${staff.designationOld}`,
      );
    }

    console.log(
      `School ${school.id}: migrated ${staffRows.length} staff records`,
    );
  }

  console.log('Done migrating staff designations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
