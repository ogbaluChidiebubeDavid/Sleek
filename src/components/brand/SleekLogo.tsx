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
          "relative inline-flex h-9 items-center overflow-hidden rounded-full bg-white px-2.5 shadow-sm",
          className
        )}
        aria-hidden
      >
        <Image
          src="/sleek-logo.png"
          alt="Sleek"
          width={875}
          height={285}
          className="h-5 w-auto object-contain"
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/sleek-logo.png"
        alt="Sleek"
        width={116}
        height={38}
        priority
        className="h-auto w-auto"
        style={{ width: "auto", height: 38 }}
      />
    </span>
  );
}
