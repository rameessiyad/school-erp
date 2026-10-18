"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { announcementApi } from "@/lib/api/announcement";
import { getErrorMessage } from "@/lib/api/error";
import { notify } from "@/lib/toast";
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_CATEGORIES,
  AUDIENCE_LABELS,
  AnnouncementFormValues,
  CATEGORY_LABELS,
  EXPIRY_LABELS,
  EXPIRY_VALUES,
  announcementSchema,
} from "@/lib/validations/announcement";

interface AnnouncementFormProps {
  announcementId?: string;
  defaultValues?: Partial<AnnouncementFormValues>;
  currentExpiresAt?: string;
}

const selectTriggerClass =
  "h-11 w-full rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";

export function AnnouncementForm({
  announcementId,
  defaultValues,
  currentExpiresAt,
}: AnnouncementFormProps) {
  const isEditMode = !!announcementId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "GENERAL",
      audience: "ALL",
      expiryDays: isEditMode ? "keep" : "7",
      ...defaultValues,
    },
  });

  const contentLength = watch("content")?.length ?? 0;

  // "keep" only makes sense when editing
  const expiryOptions = EXPIRY_VALUES.filter((v) => isEditMode || v !== "keep");

  const saveMutation = useMutation({
    mutationFn: (values: AnnouncementFormValues) =>
      isEditMode
        ? announcementApi.update(announcementId!, values)
        : announcementApi.create(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["announcements", announcementId],
        });
      }

      notify.success(
        isEditMode
          ? "Announcement updated successfully"
          : "Announcement published successfully",
      );
      router.push("/dashboard/announcements");
      router.refresh();
    },

    onError: (error) => {
      const message = getErrorMessage(
        error,
        `Failed to ${isEditMode ? "update" : "publish"} announcement`,
      );
      setServerError(message);
      notify.error(message);
    },
  });

  const onSubmit = (values: AnnouncementFormValues) => {
    setServerError(null);
    saveMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl border-border bg-surface shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold text-text-primary">
          Announcement Details
        </CardTitle>

        <p className="text-sm text-text-secondary">
          Write the announcement, choose who should see it and when it expires.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-text-primary"
            >
              Title
            </Label>

            <Input
              id="title"
              placeholder="e.g. Onam holidays from 24th to 28th"
              {...register("title")}
              className="h-11 rounded-lg border-border bg-surface-secondary/50 transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />

            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-text-primary"
            >
              Message
            </Label>

            <textarea
              id="content"
              rows={6}
              placeholder="Write the announcement..."
              {...register("content")}
              className="w-full rounded-lg border border-border bg-surface-secondary/50 px-3 py-2.5 text-sm transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex items-center justify-between">
              {errors.content ? (
                <p className="text-xs text-red-500">{errors.content.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-text-muted">{contentLength} / 5000</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-primary">
                Category
              </Label>

              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="category" className={selectTriggerClass}>
                      <SelectValue placeholder="Select category">
                        {(value: string) =>
                          CATEGORY_LABELS[
                            value as keyof typeof CATEGORY_LABELS
                          ] ?? "Select category"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {ANNOUNCEMENT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-primary">
                Send to
              </Label>

              <Controller
                control={control}
                name="audience"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="audience" className={selectTriggerClass}>
                      <SelectValue placeholder="Select audience">
                        {(value: string) =>
                          AUDIENCE_LABELS[
                            value as keyof typeof AUDIENCE_LABELS
                          ] ?? "Select audience"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {ANNOUNCEMENT_AUDIENCES.map((a) => (
                        <SelectItem key={a} value={a}>
                          {AUDIENCE_LABELS[a]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-primary">
                Expires in
              </Label>

              <Controller
                control={control}
                name="expiryDays"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="expiryDays"
                      className={selectTriggerClass}
                    >
                      <SelectValue placeholder="Select expiry">
                        {(value: string) =>
                          EXPIRY_LABELS[value as keyof typeof EXPIRY_LABELS] ??
                          "Select expiry"
                        }
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {expiryOptions.map((v) => (
                        <SelectItem key={v} value={v}>
                          {EXPIRY_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <p className="text-xs text-text-muted">
            {isEditMode && currentExpiresAt
              ? `Currently expires on ${new Date(currentExpiresAt).toLocaleDateString()}. Choosing a new duration restarts the countdown from today. `
              : ""}
            Expired announcements are deleted automatically.
          </p>

          {serverError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-center text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saveMutation.isPending}
              className="h-11 rounded-lg border-border px-5 text-text-secondary hover:bg-surface-secondary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Publishing..."
                : isEditMode
                  ? "Update Announcement"
                  : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
