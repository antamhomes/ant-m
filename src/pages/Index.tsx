import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import PartnersStrip from "@/components/PartnersStrip";
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
import FAQSection from "@/components/FAQSection";
import SectionDivider from "@/components/SectionDivider";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <BenefitsSection />
      <PartnersStrip />
      <WhyBetterSection />
      <SectionDivider />
      <GallerySection />
      <CalculatorSection />
      <ServicesSection />
      <BeforeAfterSection />
      <ProcessSection />
      <OwnerReportSection />
      <SectionDivider />
      <AboutSection />
      <PotentialCTA />
      <FAQSection />
      <ContactSection />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
