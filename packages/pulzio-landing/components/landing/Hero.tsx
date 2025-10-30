import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
      {/* Background gradient div */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200/60 to-white pointer-events-none" />
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <Badge className="bg-blue-50 text-blue-600 rounded-full px-4 py-1 mb-4">🚀 Building in Public</Badge>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
          Stop Reactive CS.<br />
          <span className="text-blue-600">Start Revenue CS.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          AI-powered customer success platform that predicts churn, identifies expansion opportunities, and makes your CS team a revenue engine. Without the $60k/year price tag.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" className="gap-2 text-base shadow-lg">
            Join Waitlist
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base opacity-60 cursor-not-allowed"
            disabled
            aria-disabled="true"
            title="Coming soon"
          >
            Watch Demo (2 min)
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-gray-500 text-sm mt-4">
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />First 10 get $99 forever</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />Launch: Q1 2026</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" />Built with your feedback</span>
        </div>
      </div>
    </section>
  );
};
