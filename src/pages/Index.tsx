import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ForYouSection from "@/components/ForYouSection";
import PartnersStrip from "@/components/PartnersStrip";
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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ForYouSection />
      <PartnersStrip />
      <CalculatorSection />
      <ServicesSection />
      <BeforeAfterSection />
      <ProcessSection />
      <OwnerReportSection />
      <GallerySection />
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
