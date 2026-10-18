"use client";

import { useState } from "react";
import { FileSpreadsheet, type LucideIcon } from "lucide-react";
import { StudentImportPanel } from "@/components/settings/student-import/student-import-panel";

interface Section {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

const SECTIONS: Section[] = [
  {
    key: "student-import",
    label: "Bulk Student Import",
    description: "Add many students at once from an Excel file.",
    icon: FileSpreadsheet,
    component: StudentImportPanel,
  },
  // add: School Profile, Academic, Staff & Permissions, Notifications, Account
];

export default function SettingsPage() {
  const [active, setActive] = useState(SECTIONS[0].key);
  const current = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];
  const Panel = current.component;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Manage your school&apos;s configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(s.key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {current.label}
            </h2>
            <p className="text-sm text-text-secondary">{current.description}</p>
          </div>
          <Panel />
        </div>
      </div>
    </div>
  );
}
