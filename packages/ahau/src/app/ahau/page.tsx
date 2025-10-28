import React from "react";
import HeroAhau, { LogosStrip, FeatureGrid, HowItWorks, ToneTrainerTeaser, WaitlistForm, FAQ, Footer } from "@/components/ahau/HeroAhau";

export default function AhauLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <HeroAhau />
      <LogosStrip />
      <FeatureGrid />
      <HowItWorks />
      <ToneTrainerTeaser />
      <WaitlistForm />
      <FAQ />
      <Footer />
    </main>
  );
}


