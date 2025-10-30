import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Beta",
    badge: { label: "Limited Spots", variant: "default", absolute: true },
    price: "$99",
    per: "/month",
    description: "Lock this price forever. First 10 customers only.",
    features: [
      "All features included",
      "Unlimited companies",
      "Gmail + HubSpot + Stripe",
      "AI churn prediction",
      "Email auto-logging",
      "Slack notifications",
      "Priority support",
      "Lock this price forever",
    ],
    button: { label: "Reserve Beta Spot", variant: "default" },
    highlight: true,
  },
  {
    name: "Starter",
    badge: { label: "Post-Beta", variant: "secondary" },
    price: "$499",
    per: "/month",
    description: "Full platform after beta. Still 1/10th of Gainsight.",
    features: [
      "Up to 100 companies",
      "3 integrations",
      "AI signals",
      "Email auto-logging",
      "Basic analytics",
      "Email support",
    ],
    button: { label: "Join Waitlist", variant: "outline" },
  },
  {
    name: "Pro",
    badge: { label: "Most Popular", variant: "secondary" },
    price: "$999",
    per: "/month",
    description: "Everything you need to scale CS operations.",
    features: [
      "Up to 500 companies",
      "Unlimited integrations",
      "Advanced AI models",
      "Custom workflows",
      "Advanced analytics",
      "Slack support",
      "Dedicated CSM",
    ],
    button: { label: "Join Waitlist", variant: "outline" },
  },
];

export const Pricing = () => (
  <section className="bg-gray-50 py-20">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600">Gainsight costs $60k+/year. We're 1/5th the price with better AI.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <Card
            key={plan.name}
            className={`relative p-8 flex flex-col items-center h-full shadow-sm ${plan.highlight ? "border-2 border-blue-500 shadow-xl" : ""}`}
          >
            {/* Badge at top */}
            {plan.badge?.absolute && (
              <Badge variant={plan.badge.variant as any} className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1">
                {plan.badge.label}
              </Badge>
            )}
            {!plan.badge?.absolute && (
              <Badge variant={plan.badge.variant as any} className="mb-2 px-4 py-1">
                {plan.badge.label}
              </Badge>
            )}
            <div className="text-2xl font-bold mb-2 mt-2">{plan.name}</div>
            <div className="mb-2 text-gray-500 text-center">{plan.description}</div>
            {plan.name === "Beta" && (
              <div className="mb-4 text-xs text-blue-600">Launch: Q1 2026</div>
            )}
            <div className="flex items-end mb-6">
              <span className="text-5xl font-bold mr-1">{plan.price}</span>
              <span className="text-xl text-gray-600">{plan.per}</span>
            </div>
            <ul className="mb-8 space-y-2">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-4 h-4 text-green-500" /> {feat}
                </li>
              ))}
            </ul>
            <Button variant={plan.button.variant as any} size="lg" className="w-full">
              {plan.button.label}
            </Button>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8 text-gray-700">
        🔨 Currently in development. Follow our journey on Twitter <span className="font-medium">@pulzio_io</span>
      </div>
      <div className="text-center mt-12 text-gray-600 text-base">
        Need enterprise features? <span className="font-medium">Contact us for custom pricing.</span>
      </div>
    </div>
  </section>
);
