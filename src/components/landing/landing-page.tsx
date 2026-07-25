"use client";

import { LandingNavbar } from "./landing-navbar";
import { HeroSection } from "./hero-section";
import { TrustedStats } from "./trusted-stats";
import { FeatureShowcase } from "./feature-showcase";
import { DashboardPreview } from "./dashboard-preview";
import { AnalyticsShowcase } from "./analytics-showcase";
import { TimelineSection } from "./timeline-section";
import { TestimonialsSection } from "./testimonials-section";
import { PricingSection } from "./pricing-section";
import { FAQSection } from "./faq-section";
import { FinalCTA } from "./final-cta";
import { LandingFooter } from "./landing-footer";
import { AnimatedBackground } from "./animated-background";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background dark relative overflow-hidden">
      <AnimatedBackground />
      <LandingNavbar />
      <HeroSection />
      <TrustedStats />
      <FeatureShowcase />
      <DashboardPreview />
      <AnalyticsShowcase />
      <TimelineSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
