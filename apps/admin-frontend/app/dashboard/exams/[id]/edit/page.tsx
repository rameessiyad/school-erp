"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { examApi } from "@/lib/api/exam";
import { ExamForm } from "@/components/exams/exam-form";
import { PageLoader } from "@/components/common/page-loader";

export default function EditExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: exam,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exam", params.id],
    queryFn: () => examApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/exams");
    return null;
  }

  if (isLoading || !exam) {
    return <PageLoader text="Loading exam..." />;
  }

  return (
    <div className="space-y-6">
      <ExamForm
        examId={exam.id}
        defaultValues={{
          name: exam.name,
          examType: exam.examType,
          startDate: exam.startDate.slice(0, 10),
          endDate: exam.endDate.slice(0, 10),
          academicYearId: exam.academicYearId,
          status: exam.status,
        }}
      />
    </div>
  );
}
