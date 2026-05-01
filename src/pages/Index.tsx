import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import WhyBetterSection from "@/components/WhyBetterSection";
import PotentialCTA from "@/components/PotentialCTA";
import GallerySection from "@/components/GallerySection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import ProcessSection from "@/components/ProcessSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import CalculatorSection from "@/components/CalculatorSection";
import OwnerReportSection from "@/components/OwnerReportSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <BenefitsSection />
      <ServicesSection />
      <StatsSection />
      <WhyBetterSection />
      <PotentialCTA />
      <GallerySection />
      <BeforeAfterSection />
      <ProcessSection />
      <AboutSection />
      <CalculatorSection />
      <OwnerReportSection />
      <ContactSection />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
