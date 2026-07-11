import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PaymentsSection } from "@/components/landing/PaymentsSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f5f7] text-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <PaymentsSection />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
