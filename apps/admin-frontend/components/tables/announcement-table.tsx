"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AnnouncementRowActions } from "@/components/announcements/announcement-row-actions";
import {
  Announcement,
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_STYLES,
} from "@/lib/validations/announcement";

interface AnnouncementTableProps {
  announcements: Announcement[];
}

function getExpiryInfo(expiresAt: string) {
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / 86_400_000);

  if (msLeft <= 0) return { label: "Expired", urgent: true };
  if (daysLeft <= 1) return { label: "Expires today", urgent: true };
  return { label: `${daysLeft} days left`, urgent: daysLeft <= 2 };
}

export function AnnouncementTable({ announcements }: AnnouncementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Announcement</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Audience</TableHead>
          <TableHead>Posted</TableHead>
          <TableHead>Expiry</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {announcements.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-12 text-center text-text-muted"
            >
              No announcements yet.
            </TableCell>
          </TableRow>
        ) : (
          announcements.map((a) => {
            const expiry = getExpiryInfo(a.expiresAt);

            return (
              <TableRow key={a.id}>
                <TableCell className="max-w-sm">
                  <p className="truncate font-medium text-text-primary">
                    {a.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                    {a.content}
                  </p>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[a.category]}`}
                  >
                    {CATEGORY_LABELS[a.category]}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                    {AUDIENCE_LABELS[a.audience]}
                  </span>
                </TableCell>

                <TableCell className="text-text-secondary">
                  {new Date(a.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <p
                    className={`text-sm font-medium ${
                      expiry.urgent ? "text-red-600" : "text-text-primary"
                    }`}
                  >
                    {expiry.label}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(a.expiresAt).toLocaleDateString()}
                  </p>
                </TableCell>

                <TableCell className="text-right">
                  <AnnouncementRowActions
                    announcementId={a.id}
                    title={a.title}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
