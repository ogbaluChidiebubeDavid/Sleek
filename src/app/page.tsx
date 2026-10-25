import { PhotonNavbar } from "@/components/landing/PhotonNavbar";
import { PhotonStyleHero } from "@/components/landing/PhotonStyleHero";
import { TriChannelBento } from "@/components/landing/TriChannelBento";
import { ConvenientPaymentsSection } from "@/components/landing/ConvenientPaymentsSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-gray-900 selection:bg-emerald-500 selection:text-white">
      <PhotonNavbar />
      <PhotonStyleHero />
      <TriChannelBento />
      <ConvenientPaymentsSection />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
