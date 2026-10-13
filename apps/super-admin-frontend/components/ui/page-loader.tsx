import { cn } from "@/lib/utils";

interface PageLoaderProps {
  text?: string;
  /** true = fills the whole screen (auth guard), false = fills its container */
  fullScreen?: boolean;
  className?: string;
}

export function PageLoader({
  text = "Loading",
  fullScreen = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen ? "min-h-screen bg-background" : "min-h-[320px] w-full",
        className,
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Expanding ping ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />

        {/* Static track */}
        <span className="absolute inset-0 rounded-full border-[3px] border-primary-soft" />

        {/* Spinning arc */}
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary/40" />

        {/* Brand mark */}
        <span className="relative flex h-11 w-11 animate-pulse items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
          S
        </span>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium text-text-secondary">
        <span>{text}</span>
        <span className="flex items-end gap-0.5 pb-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1 w-1 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>

      <span className="sr-only">{text}</span>
    </div>
  );
}
