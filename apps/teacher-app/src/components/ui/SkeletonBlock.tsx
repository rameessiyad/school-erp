import { useTheme } from "../../theme/ThemeProvider";
import { Skeleton } from "./Skeleton";

export function ClassSubjectRowSkeleton() {
  const { spacing, radius } = useTheme();
  return (
    <Skeleton
      height={54}
      borderRadius={radius.lg}
      style={{ marginBottom: spacing[2] }}
    />
  );
}

export function MyClassCardSkeleton() {
  const { spacing, radius } = useTheme();
  return (
    <Skeleton
      height={110}
      borderRadius={radius.xl}
      style={{ marginBottom: spacing[6] }}
    />
  );
}
