"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { announcementApi } from "@/lib/api/announcement";
import { PageLoader } from "@/components/common/page-loader";

export default function EditAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: announcement,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcements", params.id],
    queryFn: () => announcementApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/announcements");
    return null;
  }

  if (isLoading || !announcement) {
    return <PageLoader text="Loading announcement..." />;
  }

  return (
    <div className="w-auto space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Edit Announcement
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Update this announcement or extend its expiry.
        </p>
      </div>

      <AnnouncementForm
        announcementId={params.id}
        currentExpiresAt={announcement.expiresAt}
        defaultValues={{
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          audience: announcement.audience,
          expiryDays: "keep",
        }}
      />
    </div>
  );
}
