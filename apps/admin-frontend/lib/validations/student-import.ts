export type ImportRowStatus = "VALID" | "INVALID" | "DUPLICATE";

export interface ImportRow {
  rowNumber: number;
  status: ImportRowStatus;
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
}

export interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicate: number;
}

export interface ValidateResponse {
  summary: ImportSummary;
  rows: ImportRow[];
}

export interface CommitResponse {
  imported: number;
  skipped: number;
  invalid: number;
  duplicate: number;
  academicYear: string;
}

export interface ImportSectionOption {
  id: string;
  name: string;
  classId: string;
  className: string;
}

export interface ImportAcademicYearOption {
  id: string;
  label: string;
  isActive: boolean;
  sections: ImportSectionOption[];
}

export interface ImportOptions {
  academicYears: ImportAcademicYearOption[];
}

export interface ImportTarget {
  academicYearId: string;
  sectionId?: string;
}
