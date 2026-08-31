import { PrismaClient, FeeFrequency } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SCHOOL_ID = '123';

// Base amounts for Grade 1 - scaled up slightly per grade
const BASE_TUITION_PER_TERM = 3000;
const BASE_ADMISSION_FEE = 5000;
const BASE_EXAM_FEE = 1000;
const GRADE_INCREMENT = 200; // extra per grade level

function feeStructuresForGrade(grade: number) {
  const tuitionAmount = BASE_TUITION_PER_TERM + (grade - 1) * GRADE_INCREMENT;
  const admissionAmount = BASE_ADMISSION_FEE + (grade - 1) * GRADE_INCREMENT;
  const examAmount = BASE_EXAM_FEE + (grade - 1) * (GRADE_INCREMENT / 2);

  return [
    {
      name: 'Admission Fee',
      amount: admissionAmount,
      frequency: FeeFrequency.ONE_TIME,
      dueDate: new Date('2026-06-10'),
      description: 'One-time admission fee for the academic year',
    },
    {
      name: 'Tuition Fee - Term 1',
      amount: tuitionAmount,
      frequency: FeeFrequency.TERM,
      dueDate: new Date('2026-07-15'),
      description: 'Term 1 tuition fee',
    },
    {
      name: 'Tuition Fee - Term 2',
      amount: tuitionAmount,
      frequency: FeeFrequency.TERM,
      dueDate: new Date('2026-11-15'),
      description: 'Term 2 tuition fee',
    },
    {
      name: 'Tuition Fee - Term 3',
      amount: tuitionAmount,
      frequency: FeeFrequency.TERM,
      dueDate: new Date('2027-02-15'),
      description: 'Term 3 tuition fee',
    },
    {
      name: 'Exam Fee',
      amount: examAmount,
      frequency: FeeFrequency.YEARLY,
      dueDate: new Date('2026-09-01'),
      description: 'Annual examination fee',
    },
  ];
}

async function main() {
  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: SCHOOL_ID, isActive: true },
  });
  if (!academicYear)
    throw new Error('No active Academic Year found. Seed one first.');

  const classes = await prisma.class.findMany({
    where: { schoolId: SCHOOL_ID },
  });

  console.log('Seeding fee structures...');

  for (const klass of classes) {
    const match = klass.name.match(/(\d+)/);
    if (!match) continue;
    const grade = Number(match[1]);

    const structures = feeStructuresForGrade(grade);

    for (const s of structures) {
      const feeStructure = await prisma.feeStructure.upsert({
        where: {
          schoolId_academicYearId_classId_name: {
            schoolId: SCHOOL_ID,
            academicYearId: academicYear.id,
            classId: klass.id,
            name: s.name,
          },
        },
        update: {},
        create: {
          schoolId: SCHOOL_ID,
          academicYearId: academicYear.id,
          classId: klass.id,
          name: s.name,
          amount: s.amount,
          frequency: s.frequency,
          dueDate: s.dueDate,
          description: s.description,
          isActive: true,
        },
      });

      console.log(
        `  Fee structure ready: ${klass.name} - ${feeStructure.name} (₹${s.amount})`,
      );

      // Auto-generate StudentFee for every student currently enrolled in this class
      const enrollments = await prisma.studentEnrollment.findMany({
        where: {
          schoolId: SCHOOL_ID,
          academicYearId: academicYear.id,
          section: { classId: klass.id },
        },
        include: { student: true },
      });

      for (const enrollment of enrollments) {
        const existing = await prisma.studentFee.findFirst({
          where: {
            studentId: enrollment.studentId,
            feeStructureId: feeStructure.id,
          },
        });

        if (existing) continue;

        await prisma.studentFee.create({
          data: {
            studentId: enrollment.studentId,
            feeStructureId: feeStructure.id,
            totalAmount: s.amount,
            discountAmount: 0,
            dueDate: s.dueDate,
            status: 'PENDING',
          },
        });

        console.log(
          `    StudentFee created for ${enrollment.student.firstName} ${enrollment.student.lastName}`,
        );
      }
    }
  }

  console.log('Done seeding fee structures and student fees.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
