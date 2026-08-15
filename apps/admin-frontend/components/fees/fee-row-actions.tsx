import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeeRowActionsProps {
  studentFeeId: string;
}

export function FeeRowActions({ studentFeeId }: FeeRowActionsProps) {
  return (
    <Link href={`/dashboard/fees/${studentFeeId}`}>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye className="h-4 w-4 text-slate-500" />
      </Button>
    </Link>
  );
}
