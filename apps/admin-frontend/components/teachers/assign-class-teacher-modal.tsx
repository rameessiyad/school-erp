"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { sectionsApi } from "@/lib/api/sections";
import { teachersApi } from "@/lib/api/teachers";
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

interface AssignClassTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignClassTeacherModal({
  open,
  onOpenChange,
}: AssignClassTeacherModalProps) {
  const queryClient = useQueryClient();

  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: sectionsApi.list,
    enabled: open,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: teachersApi.list,
    enabled: open,
  });

  const classes = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((s) => {
      if (s.class) map.set(s.classId, s.class.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sections]);

  const sectionsForClass = useMemo(
    () => sections.filter((s) => s.classId === classId),
    [sections, classId],
  );

  const selectedSection = sections.find((s) => s.id === sectionId);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!selectedSection) throw new Error("Select a section");
      return sectionsApi.assignClassTeacher(sectionId, {
        teacherId,
        academicYearId: selectedSection.academicYearId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schoolClasses"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      reset();
      onOpenChange(false);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err.response?.data?.message ?? "Failed to assign class teacher");
    },
  });

  function reset() {
    setClassId("");
    setSectionId("");
    setTeacherId("");
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    if (!classId || !sectionId || !teacherId) {
      setError("Please select a class, section and teacher.");
      return;
    }
    mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v: boolean) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Class Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Class
            </label>
            <Select
              value={classId}
              onValueChange={(v: string | null) => {
                setClassId(v ?? "");
                setSectionId("");
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string) =>
                    classes.find((c) => c.id === v)?.name ?? "Select class"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Section
            </label>
            <Select
              value={sectionId}
              onValueChange={(v: string | null) => setSectionId(v ?? "")}
              disabled={!classId}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string) =>
                    sectionsForClass.find((s) => s.id === v)?.name ??
                    "Select section"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sectionsForClass.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Teacher
            </label>
            <Select
              value={teacherId}
              onValueChange={(v: string | null) => setTeacherId(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string) => {
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
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
