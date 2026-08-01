import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import PortfolioSection from "@/components/PortfolioSection";
import WhyBetterSection from "@/components/WhyBetterSection";
import ProcessSection from "@/components/ProcessSection";
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
      <SEO page="home" />
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <PortfolioSection />
      <CalculatorSection />
      <ServicesSection />
      <WhyBetterSection />
      <ProcessSection />
      <OwnerReportSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
