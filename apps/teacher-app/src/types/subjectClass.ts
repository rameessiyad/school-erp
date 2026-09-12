export interface SubjectClassStudent {
  studentId: string;
  firstName: string;
  lastName: string | null;
  rollNo: string | null;
  photoUrl: string | null;
}

export interface SubjectClassResponse {
  allocationId: string;
  subject: { id: string; name: string };
  section: {
    id: string;
    name: string;
    className: string;
    classTeacherName: string | null;
  };
  students: SubjectClassStudent[];
}
