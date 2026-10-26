"use client";

import { Info } from "lucide-react";
import { ModuleGroup } from "@/lib/api/staff-designation";

interface PermissionMatrixProps {
  groups: ModuleGroup[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function PermissionMatrix({
  groups,
  value,
  onChange,
}: PermissionMatrixProps) {
  const allValues = groups.flatMap((g) => g.modules.map((m) => m.value));

  const toggleModule = (mod: string) =>
    onChange(
      value.includes(mod) ? value.filter((v) => v !== mod) : [...value, mod],
    );

  const toggleGroup = (groupValues: string[], allChecked: boolean) =>
    onChange(
      allChecked
        ? value.filter((v) => !groupValues.includes(v))
        : [...new Set([...value, ...groupValues])],
    );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-secondary/50 px-3.5 py-3 text-xs text-text-secondary">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          These permissions control which <strong>modules</strong> staff can
          open. Access to a module includes everything inside it. Separate
          create / edit / delete permissions are not available yet.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-secondary">
          {value.length} of {allValues.length} modules selected
        </p>
        <div className="flex gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => onChange(allValues)}
            className="text-primary hover:underline"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-text-muted hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const groupValues = group.modules.map((m) => m.value);
          const checkedCount = groupValues.filter((v) =>
            value.includes(v),
          ).length;
          const allChecked =
            groupValues.length > 0 && checkedCount === groupValues.length;
          const someChecked = checkedCount > 0 && !allChecked;

          return (
            <div
              key={group.key}
              className="rounded-lg border border-border bg-surface"
            >
              <label className="flex cursor-pointer items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={() => toggleGroup(groupValues, allChecked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {group.label}
                </span>
                <span className="text-xs text-text-muted">
                  {checkedCount}/{groupValues.length}
                </span>
              </label>

              <div className="grid gap-1 p-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {group.modules.map((mod) => (
                  <label
                    key={mod.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary hover:bg-surface-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(mod.value)}
                      onChange={() => toggleModule(mod.value)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
