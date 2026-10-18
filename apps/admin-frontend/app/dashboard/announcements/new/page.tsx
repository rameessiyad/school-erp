import { AnnouncementForm } from "@/components/announcements/announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="w-auto space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          New Announcement
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Publish a notice for teachers, parents or staff.
        </p>
      </div>
      <AnnouncementForm />
    </div>
  );
}
