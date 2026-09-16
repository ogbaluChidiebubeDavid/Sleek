import Image from "next/image";
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
          "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm border border-black/5",
          className
        )}
        aria-hidden
      >
        <Image
          src="/sleek-logo.png"
          alt="Sleek Logo"
          width={36}
          height={36}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white p-1 shadow-sm border border-black/5 flex items-center justify-center">
        <Image
          src="/sleek-logo.png"
          alt="Sleek"
          width={36}
          height={36}
          priority
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-display font-black text-xl tracking-tight text-gray-950 uppercase">
          Sleek
        </span>
        <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-emerald-600">
          AI
        </span>
      </div>
    </span>
  );
}
