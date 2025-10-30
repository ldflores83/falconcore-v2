import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: string;
  badge: string;
  badgeVariant?: "secondary" | "default";
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🤖",
    badge: "AI-Powered",
    badgeVariant: "secondary",
    title: "AI Churn Prediction",
    description: "Claude 3.5 analyzes emails, product usage, and support tickets to predict churn before it happens.",
  },
  {
    icon: "📧",
    badge: "Time Saver",
    badgeVariant: "secondary",
    title: "Gmail Auto-Logging",
    description: "Never log an email manually again. AI reads, categorizes, and extracts action items automatically.",
  },
  {
    icon: "💰",
    badge: "Revenue Driver",
    badgeVariant: "secondary",
    title: "Expansion Signals",
    description: "AI identifies upsell opportunities by analyzing usage patterns, sentiment, and engagement.",
  },
  {
    icon: "📊",
    badge: "Executive-Ready",
    badgeVariant: "secondary",
    title: "ROI Tracking",
    description: "Prove CS value with churn prevented, expansion generated, and time saved. Get budget approved.",
  },
  {
    icon: "⚡",
    badge: "Automation",
    badgeVariant: "secondary",
    title: "Smart Workflows",
    description: "Automated tasks, Slack alerts, response drafts. AI handles busywork so you focus on relationships.",
  },
  {
    icon: "🎯",
    badge: "Proactive",
    badgeVariant: "secondary",
    title: "Health Scoring",
    description: "Real-time health scores combining product usage, sentiment, payments, and engagement.",
  },
];

export const Solution = () => (
  <section className="bg-white py-20">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Pulzio: CS Intelligence Without the Enterprise Price</h2>
        <p className="text-xl text-gray-600">Everything you need to run data-driven CS. 1/5th the cost of Gainsight.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Card key={feature.title} className="p-6 hover:border-blue-500 transition h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">{feature.icon}</span>
              <Badge variant={feature.badgeVariant || "secondary"}>{feature.badge}</Badge>
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
