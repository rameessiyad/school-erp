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
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Outer pulse */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 [animation-duration:2s]" />

          {/* Middle pulse ring */}
          <div className="absolute inset-1 animate-pulse rounded-full border border-primary/20" />

          {/* Loader container */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/10 bg-background shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>

        {/* Text */}
        <p className="mt-5 animate-pulse text-sm font-semibold text-text-primary">
          {text}
        </p>

        {/* Description */}
        {description && (
          <p className="mt-1.5 max-w-sm animate-[fadeIn_0.5s_ease-out] text-xs leading-5 text-text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
