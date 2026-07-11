import { cn } from "@/lib/utils";

type SleekLogoProps = {
  className?: string;
  variant?: "full" | "mark";
};

export function SleekLogo({ className, variant = "full" }: SleekLogoProps) {
  if (variant === "mark") {
    return (
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center bg-sleek-500 font-display text-sm font-black tracking-tighter text-white",
          className
        )}
        aria-hidden
      >
        S
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-stretch overflow-hidden", className)}>
      <span className="flex items-center bg-sleek-500 px-3 py-2 font-display text-lg font-black tracking-tight text-white sm:px-4 sm:text-xl">
        SLEEK
      </span>
    </span>
  );
}
