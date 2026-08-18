"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api/teachers";
import { subjectsApi } from "@/lib/api/subjects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AddAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  academicYearId: string;
}

export function AddAllocationModal({
  open,
  onOpenChange,
  sectionId,
  academicYearId,
}: AddAllocationModalProps) {
  const queryClient = useQueryClient();

  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectsApi.list,
    enabled: open,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: teachersApi.list,
    enabled: open,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      teachersApi.addAllocation(teacherId, {
        subjectId,
        sectionId,
        academicYearId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sectionAllocations", sectionId],
      });
      reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to add allocation");
    },
  });

  function reset() {
    setSubjectId("");
    setTeacherId("");
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    if (!subjectId || !teacherId) {
      setError("Please select a subject and teacher.");
      return;
    }
    mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject Allocation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Subject
            </label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue>
                  {(v) =>
                    subjects.find((s) => s.id === v)?.name ?? "Select subject"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Teacher
            </label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue>
                  {(v) => {
                    const t = teachers.find((t) => t.id === v);
                    return t
                      ? `${t.firstName} ${t.lastName ?? ""}`
                      : "Select teacher";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName} {t.lastName ?? ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add Allocation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
