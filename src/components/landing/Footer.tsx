import Link from "next/link";
import { SleekLogo } from "@/components/brand/SleekLogo";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f4f5f7] py-12">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <SleekLogo />
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Sleek. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-600">
          <Link href="/catalog" className="hover:text-sleek-600">
            Catalogue
          </Link>
          <Link href="/privacy" className="hover:text-sleek-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
