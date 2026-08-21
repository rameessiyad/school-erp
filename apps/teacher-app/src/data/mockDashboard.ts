// src/data/mockDashboard.ts
// TEMPORARY — replace with real API calls once the Leave/Homework/Assignment
// backend endpoints are ready. Shapes here match the Prisma models so swapping
// in real data later is a find-and-replace of the source, not the UI.

import {
  TeacherClassSubject,
  LeaveStatusSummary,
  TeacherProfileDetails,
} from "../types/teacher";

export const mockClassSubjects: TeacherClassSubject[] = [
  {
    id: "1",
    subjectName: "Mathematics",
    className: "Class 8",
    sectionName: "A",
    isClassTeacher: true,
  },
  {
    id: "2",
    subjectName: "Science",
    className: "Class 8",
    sectionName: "B",
    isClassTeacher: false,
  },
  {
    id: "3",
    subjectName: "Mathematics",
    className: "Class 9",
    sectionName: "A",
    isClassTeacher: false,
  },
];

export const mockLeaveSummary: LeaveStatusSummary = {
  pending: 1,
  approved: 4,
  rejected: 0,
};

export const mockTeacherProfile: TeacherProfileDetails = {
  firstName: "Anjali",
  lastName: "Menon",
  employeeId: "T-2024-014",
  email: "anjali.menon@school.com",
  phone: "+91 98765 43210",
  gender: "FEMALE",
  qualification: "M.Sc Mathematics, B.Ed",
  experience: 6,
  joiningDate: "2020-06-15",
};
