"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";

export const CTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: integrate real email capture
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Want to Be Among the First?</h2>
          <div className="text-xl text-blue-100 mb-8">Join the waitlist and get early access to Pulzio</div>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Enter your work email"
              className="bg-white text-gray-900 flex-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="secondary" size="lg" className="gap-2">
              Join Waitlist
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
          {submitted && (
            <div className="text-blue-100 text-sm mt-4">Thank you for joining the Beta!</div>
          )}
          <div className="text-sm text-blue-100 mt-4">First 10 users lock $99/month pricing forever. Launch: Q1 2026</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-12 border-t border-blue-400">
            <div>
              <div className="text-3xl font-bold">Target: 2hrs/day saved</div>
              <div className="text-blue-100">Time saved per CSM</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Goal: 85% accuracy</div>
              <div className="text-blue-100">Churn prediction accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$99 vs $5k+ (forever)</div>
              <div className="text-blue-100">Compared to competitors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
