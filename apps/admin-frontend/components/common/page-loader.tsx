import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  text?: string;
  description?: string;
  className?: string;
}

export function PageLoader({
  text = "Loading...",
  description,
  className = "",
}: PageLoaderProps) {
  return (
    <div
      className={`flex min-h-[calc(100vh-8rem)] w-full items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Loader */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10" />

          <Loader2 className="relative h-5 w-5 animate-spin text-primary" />
        </div>

        {/* Text */}
        <p className="mt-4 text-sm font-medium text-text-primary">{text}</p>

        {/* Description */}
        {description && (
          <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
