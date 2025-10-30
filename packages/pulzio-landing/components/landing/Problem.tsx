import { Card } from "@/components/ui/card";

export const Problem = () => (
  <section className="bg-gray-50 py-20">
    <div className="container mx-auto max-w-4xl px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Sound familiar?</h2>
        <p className="text-xl text-gray-600">CS teams at SMBs face impossible challenges with inadequate tools</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition">
          <div className="text-2xl mb-2">😓 Flying Blind</div>
          <p className="text-gray-700">No visibility into customer health until it's too late. Reactive firefighting instead of proactive success.</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition">
          <div className="text-2xl mb-2">⏰ Manual Hell</div>
          <p className="text-gray-700">Hours wasted logging activities, updating CRM, copying emails. CSMs spend 60% of time on admin work.</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition">
          <div className="text-2xl mb-2">💸 No ROI Proof</div>
          <p className="text-gray-700">Can't prove CS value. Leadership sees you as cost center, not revenue driver. Budget always at risk.</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition">
          <div className="text-2xl mb-2">💰 Tools Too Expensive</div>
          <p className="text-gray-700">Gainsight costs $60k+/year. ChurnZero $30k+. You need CS intelligence but can't justify the price.</p>
        </Card>
      </div>
    </div>
  </section>
);
