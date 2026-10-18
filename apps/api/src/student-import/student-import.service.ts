import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as ExcelJS from 'exceljs';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BLOOD_GROUPS,
  COLUMNS,
  ColKey,
  GENDER_MAP,
  MAX_ROWS,
  UploadedExcelFile,
  cellToString,
  headerToKey,
  parseDate,
} from './student-import.helpers';

type RowStatus = 'VALID' | 'INVALID' | 'DUPLICATE';

interface ImportRow {
  rowNumber: number;
  status: RowStatus;
  errors: string[];
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  admissionDate: string;
  rollNo: string;
  className: string;
  sectionName: string;
  // internal, stripped before sending to the client
  sectionId?: string;
  parsed: {
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    dob: Date | null;
    admissionDate: Date | null;
  };
}

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
const sectionKey = (c: string, s: string) =>
  `${c.trim().toLowerCase()}|${s.trim().toLowerCase()}`;

@Injectable()
export class StudentImportService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────── options ───────────────────────────

  async getOptions(schoolId: string) {
    const years = await this.prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
      include: { sections: { include: { class: true } } },
    });

    return {
      academicYears: years.map((y) => ({
        id: y.id,
        label: y.label,
        isActive: y.isActive,
        sections: y.sections
          .map((s) => ({
            id: s.id,
            name: s.name,
            classId: s.classId,
            className: s.class.name,
          }))
          .sort(
            (a, b) =>
              a.className.localeCompare(b.className, undefined, {
                numeric: true,
              }) || a.name.localeCompare(b.name),
          ),
      })),
    };
  }

  // ─────────────────────────── template ───────────────────────────

  async buildTemplate(
    schoolId: string,
    academicYearId: string,
    sectionId?: string,
  ) {
    const { year, sections, defaultSection } = await this.loadContext(
      schoolId,
      academicYearId,
      sectionId,
    );

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Students');

    ws.columns = COLUMNS.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width,
    }));
    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    header.alignment = { vertical: 'middle' };
    header.height = 22;
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const colIdx = (key: ColKey) => COLUMNS.findIndex((c) => c.key === key) + 1;

    // text format so admission numbers like 00123 keep their leading zeros
    ws.getColumn(colIdx('admissionNo')).numFmt = '@';
    ws.getColumn(colIdx('rollNo')).numFmt = '@';
    ws.getColumn(colIdx('dob')).numFmt = 'dd/mm/yyyy';
    ws.getColumn(colIdx('admissionDate')).numFmt = 'dd/mm/yyyy';

    for (let r = 2; r <= MAX_ROWS + 1; r++) {
      ws.getCell(r, colIdx('gender')).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"MALE,FEMALE,OTHER"'],
      };
      ws.getCell(r, colIdx('bloodGroup')).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${BLOOD_GROUPS.join(',')}"`],
      };
    }

    // instructions
    const info = wb.addWorksheet('Instructions');
    info.getColumn(1).width = 90;
    const lines = [
      `Academic year: ${year.label}`,
      defaultSection
        ? `Default target: Class ${defaultSection.class.name} - Section ${defaultSection.name} (rows with blank Class/Section go here)`
        : 'Multi-class workbook: Class and Section are required on every row.',
      '',
      'Required: Admission No, First Name.',
      'Dates: DD/MM/YYYY.',
      'To import several classes in one file, fill Class and Section per row (see the "Classes" sheet for valid names).',
      `Maximum ${MAX_ROWS} students per file. Do not rename or delete the header row.`,
    ];
    lines.forEach((l) => info.addRow([l]));
    info.getRow(1).font = { bold: true };

    // valid class/section combos
    const ref = wb.addWorksheet('Classes');
    ref.columns = [
      { header: 'Class', key: 'c', width: 16 },
      { header: 'Section', key: 's', width: 14 },
    ];
    ref.getRow(1).font = { bold: true };
    sections
      .sort(
        (a, b) =>
          a.class.name.localeCompare(b.class.name, undefined, {
            numeric: true,
          }) || a.name.localeCompare(b.name),
      )
      .forEach((s) => ref.addRow({ c: s.class.name, s: s.name }));

    const buffer = await wb.xlsx.writeBuffer();
    const fileLabel = defaultSection
      ? `${defaultSection.class.name}-${defaultSection.name}`
      : 'multi-class';
    return {
      buffer: Buffer.from(buffer as ArrayBuffer),
      filename: `student-import-${year.label}-${fileLabel}.xlsx`.replace(
        /[^\w.\-]+/g,
        '_',
      ),
    };
  }

  // ─────────────────────────── validate ───────────────────────────

  async validate(
    schoolId: string,
    academicYearId: string,
    sectionId: string | undefined,
    file: UploadedExcelFile,
  ) {
    const ctx = await this.loadContext(schoolId, academicYearId, sectionId);
    const rows = await this.parseAndValidate(schoolId, ctx, file);

    return {
      summary: this.summarize(rows),
      rows: rows.map((r) => ({
        rowNumber: r.rowNumber,
        status: r.status,
        errors: r.errors,
        admissionNo: r.admissionNo,
        firstName: r.firstName,
        lastName: r.lastName,
        gender: r.gender,
        dob: r.dob,
        bloodGroup: r.bloodGroup,
        admissionDate: r.admissionDate,
        rollNo: r.rollNo,
        className: r.className,
        sectionName: r.sectionName,
      })),
    };
  }
  // ─────────────────────────── error report ───────────────────────────

  async buildErrorReport(
    schoolId: string,
    academicYearId: string,
    sectionId: string | undefined,
    file: UploadedExcelFile,
  ) {
    const ctx = await this.loadContext(schoolId, academicYearId, sectionId);
    const rows = (await this.parseAndValidate(schoolId, ctx, file)).filter(
      (r) => r.status !== 'VALID',
    );

    if (!rows.length)
      throw new BadRequestException('There are no errors to report');

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Errors');
    // same headers as the template, so the corrected sheet can be re-uploaded directly
    ws.columns = [
      { header: 'Row #', key: 'rowNumber', width: 8 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Errors', key: 'errors', width: 60 },
      ...COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width })),
    ];
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    rows.forEach((r) => ws.addRow({ ...r, errors: r.errors.join('; ') }));

    const buffer = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer as ArrayBuffer),
      filename: 'student-import-errors.xlsx',
    };
  }

  // ─────────────────────────── commit ───────────────────────────

  async commit(
    schoolId: string,
    academicYearId: string,
    sectionId: string | undefined,
    file: UploadedExcelFile,
  ) {
    const ctx = await this.loadContext(schoolId, academicYearId, sectionId);
    const rows = await this.parseAndValidate(schoolId, ctx, file);
    const valid = rows.filter((r) => r.status === 'VALID');

    if (!valid.length)
      throw new BadRequestException('There are no valid rows to import');

    const students = valid.map((r) => ({
      id: randomUUID(),
      schoolId,
      admissionNo: r.admissionNo,
      firstName: r.firstName,
      lastName: r.lastName || null,
      gender: r.parsed.gender,
      dob: r.parsed.dob,
      bloodGroup: r.bloodGroup || null,
      admissionDate: r.parsed.admissionDate,
    }));

    const enrollments = valid.map((r, i) => ({
      schoolId,
      academicYearId,
      studentId: students[i].id,
      sectionId: r.sectionId!,
      rollNo: r.rollNo || null,
    }));

    try {
      await this.prisma.$transaction(
        async (tx) => {
          for (let i = 0; i < students.length; i += 500) {
            await tx.student.createMany({ data: students.slice(i, i + 500) });
          }
          for (let i = 0; i < enrollments.length; i += 500) {
            await tx.studentEnrollment.createMany({
              data: enrollments.slice(i, i + 500),
            });
          }
        },
        { timeout: 60_000 },
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Some admission numbers were added while you were importing. Nothing was imported, please validate the file again.',
        );
      }
      throw new InternalServerErrorException(
        'Import failed. No students were imported.',
      );
    }

    const summary = this.summarize(rows);
    return {
      imported: valid.length,
      skipped: rows.length - valid.length,
      invalid: summary.invalid,
      duplicate: summary.duplicate,
      academicYear: ctx.year.label,
    };
  }

  // ─────────────────────────── internals ───────────────────────────

  private summarize(rows: ImportRow[]) {
    return {
      total: rows.length,
      valid: rows.filter((r) => r.status === 'VALID').length,
      invalid: rows.filter((r) => r.status === 'INVALID').length,
      duplicate: rows.filter((r) => r.status === 'DUPLICATE').length,
    };
  }

  private async loadContext(
    schoolId: string,
    academicYearId: string,
    sectionId?: string,
  ) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
    });
    if (!year) throw new NotFoundException('Academic year not found');

    const sections = await this.prisma.section.findMany({
      where: { schoolId, academicYearId },
      include: { class: true },
    });

    let defaultSection: (typeof sections)[number] | null = null;
    if (sectionId) {
      defaultSection = sections.find((s) => s.id === sectionId) ?? null;
      if (!defaultSection) {
        throw new BadRequestException(
          'Section does not belong to the selected academic year',
        );
      }
    }

    return { year, sections, defaultSection };
  }

  private async parseAndValidate(
    schoolId: string,
    ctx: Awaited<ReturnType<StudentImportService['loadContext']>>,
    file: UploadedExcelFile,
  ): Promise<ImportRow[]> {
    if (!file) throw new BadRequestException('Please upload an Excel file');
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Only .xlsx files are supported');
    }

    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.load(file.buffer as any);
    } catch {
      throw new BadRequestException(
        'Could not read the Excel file. Please use the downloaded template.',
      );
    }

    const ws = wb.getWorksheet('Students') ?? wb.worksheets[0];
    if (!ws) throw new BadRequestException('The workbook has no sheets');

    // map header text -> column index (so column order does not matter)
    const colIndex: Partial<Record<ColKey, number>> = {};
    ws.getRow(1).eachCell((cell, col) => {
      const key = headerToKey(cellToString(cell.value));
      if (key && !colIndex[key]) colIndex[key] = col;
    });

    if (!colIndex.admissionNo || !colIndex.firstName) {
      throw new BadRequestException(
        'Required columns "Admission No" and "First Name" are missing. Please use the downloaded template.',
      );
    }

    const raw = (row: ExcelJS.Row, key: ColKey) => {
      const i = colIndex[key];
      return i ? row.getCell(i).value : null;
    };
    const text = (row: ExcelJS.Row, key: ColKey) => cellToString(raw(row, key));

    const sectionMap = new Map(
      ctx.sections.map((s) => [sectionKey(s.class.name, s.name), s]),
    );

    const rows: ImportRow[] = [];

    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);

      const base = {
        admissionNo: text(row, 'admissionNo'),
        firstName: text(row, 'firstName'),
        lastName: text(row, 'lastName'),
        gender: text(row, 'gender'),
        dob: text(row, 'dob'),
        bloodGroup: text(row, 'bloodGroup').toUpperCase().replace(/\s/g, ''),
        admissionDate: text(row, 'admissionDate'),
        rollNo: text(row, 'rollNo'),
        className: text(row, 'className'),
        sectionName: text(row, 'sectionName'),
      };

      if (Object.values(base).every((v) => !v)) continue; // blank row

      if (rows.length >= MAX_ROWS) {
        throw new BadRequestException(
          `Too many rows. The maximum is ${MAX_ROWS} students per import.`,
        );
      }

      const errors: string[] = [];

      if (!base.admissionNo) errors.push('Admission No is required');
      else if (base.admissionNo.length > 50)
        errors.push('Admission No is too long (max 50)');

      if (!base.firstName) errors.push('First Name is required');
      else if (base.firstName.length > 100)
        errors.push('First Name is too long (max 100)');

      if (base.lastName.length > 100)
        errors.push('Last Name is too long (max 100)');

      let gender: 'MALE' | 'FEMALE' | 'OTHER' | null = null;
      if (base.gender) {
        gender = GENDER_MAP[base.gender.toLowerCase()] ?? null;
        if (!gender) errors.push('Gender must be MALE, FEMALE or OTHER');
      }

      const dob = parseDate(raw(row, 'dob'));
      if (dob === 'invalid')
        errors.push('Date of Birth is invalid (use DD/MM/YYYY)');
      else if (dob && dob.getTime() > Date.now())
        errors.push('Date of Birth cannot be in the future');

      const admissionDate = parseDate(raw(row, 'admissionDate'));
      if (admissionDate === 'invalid')
        errors.push('Admission Date is invalid (use DD/MM/YYYY)');

      if (base.bloodGroup && !BLOOD_GROUPS.includes(base.bloodGroup)) {
        errors.push(`Blood Group must be one of ${BLOOD_GROUPS.join(', ')}`);
      }

      if (base.rollNo.length > 20) errors.push('Roll No is too long (max 20)');

      // resolve target section
      let sectionId: string | undefined;
      let { className, sectionName } = base;

      if (className && sectionName) {
        const found = sectionMap.get(sectionKey(className, sectionName));
        if (!found) {
          errors.push(
            `Class "${className}" / Section "${sectionName}" does not exist in ${ctx.year.label}`,
          );
        } else {
          sectionId = found.id;
        }
      } else if (!className && !sectionName) {
        if (ctx.defaultSection) {
          sectionId = ctx.defaultSection.id;
          className = ctx.defaultSection.class.name;
          sectionName = ctx.defaultSection.name;
        } else {
          errors.push('Class and Section are required');
        }
      } else {
        errors.push('Provide both Class and Section, or leave both blank');
      }

      rows.push({
        rowNumber: r,
        status: errors.length ? 'INVALID' : 'VALID',
        errors,
        ...base,
        className,
        sectionName,
        dob: dob instanceof Date ? iso(dob) : base.dob,
        admissionDate:
          admissionDate instanceof Date
            ? iso(admissionDate)
            : base.admissionDate,
        sectionId,
        parsed: {
          gender,
          dob: dob instanceof Date ? dob : null,
          admissionDate: admissionDate instanceof Date ? admissionDate : null,
        },
      });
    }

    if (!rows.length)
      throw new BadRequestException(
        'The file does not contain any student rows',
      );

    // duplicates inside the file: flag every copy so the user decides which is right
    const byNo = new Map<string, number[]>();
    rows.forEach((row) => {
      if (!row.admissionNo) return;
      const list = byNo.get(row.admissionNo) ?? [];
      list.push(row.rowNumber);
      byNo.set(row.admissionNo, list);
    });

    const dupInFile = new Set<number>();
    for (const [no, list] of byNo) {
      if (list.length > 1) {
        list.forEach((n) => dupInFile.add(n));
        rows
          .filter((row) => row.admissionNo === no)
          .forEach((row) =>
            row.errors.push(
              `Admission No repeated in file (rows ${list.join(', ')})`,
            ),
          );
      }
    }

    // duplicates against existing school records
    const existing = await this.prisma.student.findMany({
      where: { schoolId, admissionNo: { in: [...byNo.keys()] } },
      select: { admissionNo: true },
    });
    const existingNos = new Set(existing.map((s) => s.admissionNo));

    rows.forEach((row) => {
      const inDb = existingNos.has(row.admissionNo);
      if (inDb)
        row.errors.push('Admission No already exists in school records');

      if (inDb || dupInFile.has(row.rowNumber)) row.status = 'DUPLICATE';
      else if (row.errors.length) row.status = 'INVALID';
      else row.status = 'VALID';
    });

    return rows;
  }
}
