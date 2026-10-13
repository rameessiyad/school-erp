"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schoolsApi } from "@/lib/api/schools";
import { notify } from "@/lib/utils/toast";
import { getErrorMessage } from "@/lib/utils/error";
import {
  CreateSchoolValues,
  SchoolStatus,
  UpdateSchoolModulesValues,
  UpdateSchoolValues,
} from "@/lib/validations/school";

export const schoolKeys = {
  all: ["schools"] as const,
  list: (status?: SchoolStatus) =>
    ["schools", "list", status ?? "all"] as const,
  detail: (id: string) => ["schools", "detail", id] as const,
  modules: ["schools", "available-modules"] as const,
};

export function useSchools(status?: SchoolStatus) {
  return useQuery({
    queryKey: schoolKeys.list(status),
    queryFn: () => schoolsApi.list(status),
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => schoolsApi.get(id),
    enabled: !!id,
  });
}

export function useAvailableModules() {
  return useQuery({
    queryKey: schoolKeys.modules,
    queryFn: schoolsApi.availableModules,
    staleTime: Infinity,
  });
}

export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolValues) => schoolsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.all });
      notify.success("School created successfully");
    },
    onError: (e) => notify.error(getErrorMessage(e, "Failed to create school")),
  });
}

export function useUpdateSchool(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSchoolValues) => schoolsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.all });
      notify.success("School updated");
    },
    onError: (e) => notify.error(getErrorMessage(e, "Failed to update school")),
  });
}

export function useUpdateSchoolModules(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSchoolModulesValues) =>
      schoolsApi.updateModules(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.all });
      notify.success("Module permissions updated");
    },
    onError: (e) =>
      notify.error(getErrorMessage(e, "Failed to update modules")),
  });
}

export function useDeleteSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.all });
      notify.success("School deleted");
    },
    onError: (e) => notify.error(getErrorMessage(e, "Failed to delete school")),
  });
}
