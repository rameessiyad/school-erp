import * as ExcelJS from 'exceljs';

export const MAX_ROWS = 2000;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export type ColKey =
  | 'admissionNo'
  | 'firstName'
  | 'lastName'
  | 'gender'
  | 'dob'
  | 'bloodGroup'
  | 'admissionDate'
  | 'rollNo'
  | 'className'
  | 'sectionName';

export const COLUMNS: { key: ColKey; header: string; width: number }[] = [
  { key: 'admissionNo', header: 'Admission No *', width: 16 },
  { key: 'firstName', header: 'First Name *', width: 18 },
  { key: 'lastName', header: 'Last Name', width: 18 },
  { key: 'gender', header: 'Gender (MALE/FEMALE/OTHER)', width: 28 },
  { key: 'dob', header: 'Date of Birth (DD/MM/YYYY)', width: 28 },
  { key: 'bloodGroup', header: 'Blood Group', width: 14 },
  { key: 'admissionDate', header: 'Admission Date (DD/MM/YYYY)', width: 30 },
  { key: 'rollNo', header: 'Roll No', width: 10 },
  { key: 'className', header: 'Class', width: 14 },
  { key: 'sectionName', header: 'Section', width: 12 },
];

// normalized header text -> column key
const HEADER_ALIASES: Record<string, ColKey> = {
  admissionno: 'admissionNo',
  firstname: 'firstName',
  lastname: 'lastName',
  gender: 'gender',
  dateofbirth: 'dob',
  dob: 'dob',
  bloodgroup: 'bloodGroup',
  admissiondate: 'admissionDate',
  rollno: 'rollNo',
  class: 'className',
  section: 'sectionName',
};

export interface UploadedExcelFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function headerToKey(header: string): ColKey | undefined {
  const normalized = header
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z]/g, '');
  return HEADER_ALIASES[normalized];
}

export const GENDER_MAP: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = {
  male: 'MALE',
  m: 'MALE',
  female: 'FEMALE',
  f: 'FEMALE',
  other: 'OTHER',
  o: 'OTHER',
};

export function cellToString(value: ExcelJS.CellValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    const v = value as any;
    if (Array.isArray(v.richText))
      return v.richText
        .map((r: any) => r.text)
        .join('')
        .trim();
    if ('result' in v) return cellToString(v.result);
    if ('text' in v) return String(v.text).trim();
    return '';
  }
  return String(value).trim();
}

/** null = empty, 'invalid' = unreadable, Date = ok (UTC midnight) */
export function parseDate(
  raw: ExcelJS.CellValue | undefined,
): Date | null | 'invalid' {
  if (raw === null || raw === undefined || raw === '') return null;

  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return 'invalid';
    return new Date(
      Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate()),
    );
  }

  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86_400_000)); // Excel serial date
    return isNaN(d.getTime()) ? 'invalid' : d;
  }

  const s = cellToString(raw);
  if (!s) return null;

  let y: number, mo: number, d: number;
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (dmy) {
    d = +dmy[1];
    mo = +dmy[2];
    y = +dmy[3];
  } else if (ymd) {
    y = +ymd[1];
    mo = +ymd[2];
    d = +ymd[3];
  } else return 'invalid';

  const date = new Date(Date.UTC(y, mo - 1, d));
  const ok =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d;
  return ok ? date : 'invalid';
}
