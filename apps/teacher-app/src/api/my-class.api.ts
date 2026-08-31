import { apiClient } from "./client";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceStudent {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
    rollNo: string;
  };
  status: AttendanceStatus | null;
}

export interface MarkAttendancePayload {
  date: string;
  entries: { studentId: string; status: AttendanceStatus }[];
}

export const myClassApi = {
  getMyClass: () => apiClient.get("/teacher/my-class").then((r) => r.data),

  getStudents: () =>
    apiClient.get("/teacher/my-class/students").then((r) => r.data),

  getAttendanceForDate: (date: string) =>
    apiClient
      .get<AttendanceStudent[]>("/teacher/my-class/attendance", {
        params: { date },
      })
      .then((r) => r.data),

  markAttendance: (payload: MarkAttendancePayload) =>
    apiClient.post("/teacher/my-class/attendance", payload).then((r) => r.data),
};
