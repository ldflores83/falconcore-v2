# OnboardingAudit – Cursor/TypeScript Form Config (source of truth)

> Drop this into your codebase. Cursor can generate the UI from this config. It includes labels, field ids, types, dropdown options, tooltips, placeholders, and basic validation hints.

```ts
// types.ts
export type Option = { value: string; label: string };

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "checkboxes"
  | "radio"
  | "url"
  | "email"
  | "file"
  | "tags";

export interface FieldBase {
  id: string;               // unique field id (used as form key)
  label: string;            // human label
  type: FieldType;          // component type
  required?: boolean;       // required flag
  placeholder?: string;     // input placeholder
  tooltip?: string;         // tooltip/help text
  options?: Option[];       // for select/multiselect/checkboxes/radio
  min?: number;             // for number
  max?: number;             // for number
}

export interface Step {
  id: string;
  title: string;
  fields: FieldBase[];
}

export const FORM_CONFIG: Step[] = [
  {
    id: "step1_product_basics",
    title: "Step 1 — Product Basics",
    fields: [
      {
        id: "product_name",
        label: "Product name",
        type: "text",
        required: true,
        placeholder: "e.g., Acme Analytics",
        tooltip: "Name of the product being audited."
      },
      {
        id: "signup_link",
        label: "Link to signup or homepage",
        type: "url",
        required: true,
        placeholder: "https://...",
        tooltip: "Public link where a new user can start."
      },
      {
        id: "target_user",
        label: "Who is your target user?",
        type: "select",
        required: true,
        tooltip: "Main audience for your product.",
        options: [
          { value: "founders", label: "Founders" },
          { value: "product_managers", label: "Product Managers" },
          { value: "growth", label: "Growth" },
          { value: "customer_success", label: "Customer Success" },
          { value: "marketing", label: "Marketing" },
          { value: "sales", label: "Sales" },
          { value: "operations", label: "Operations" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "value_prop",
        label: "Value proposition (1 line)",
        type: "text",
        required: true,
        placeholder: "One-sentence unique value",
        tooltip: "Short sentence describing the unique value your product provides."
      },
      {
        id: "icp_company_size",
        label: "ICP — Company size",
        type: "select",
        required: true,
        tooltip: "Company size your product serves best.",
        options: [
          { value: "startup_1_20", label: "Startup 1–20 employees" },
          { value: "smb_21_200", label: "SMB 21–200 employees" },
          { value: "mid_200_1000", label: "Mid-Market 200–1000" },
          { value: "enterprise_1000_plus", label: "Enterprise 1000+" }
        ]
      },
      {
        id: "icp_industry",
        label: "ICP — Industry",
        type: "select",
        required: true,
        options: [
          { value: "saas", label: "SaaS" },
          { value: "fintech", label: "Fintech" },
          { value: "ecommerce", label: "E-commerce" },
          { value: "healthtech", label: "Healthtech" },
          { value: "edtech", label: "Edtech" },
          { value: "cybersecurity", label: "Cybersecurity" },
          { value: "logistics", label: "Logistics" },
          { value: "productivity", label: "Productivity" },
          { value: "devtools", label: "DevTools" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "icp_primary_role",
        label: "ICP — Primary role",
        type: "select",
        required: true,
        options: [
          { value: "admin", label: "Admin" },
          { value: "end_user", label: "End-user" },
          { value: "technical_champion", label: "Technical champion" },
          { value: "buyer", label: "Buyer/Decision-maker" },
          { value: "finance_procurement", label: "Finance/Procurement" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "day1_jtbd",
        label: "Primary JTBD (Job To Be Done) for Day-1",
        type: "textarea",
        required: true,
        placeholder: "Main task/problem the user aims to solve on day 1",
        tooltip: "Main task or problem the user wants to solve on their first day."
      },
      {
        id: "pricing_tier",
        label: "Pricing tier analyzed",
        type: "select",
        required: true,
        options: [
          { value: "free", label: "Free" },
          { value: "trial", label: "Trial" },
          { value: "starter", label: "Starter" },
          { value: "pro", label: "Pro" },
          { value: "business", label: "Business" },
          { value: "enterprise", label: "Enterprise" }
        ]
      },
      {
        id: "main_competitor",
        label: "Main competitor",
        type: "text",
        placeholder: "e.g., Competitor Inc.",
        tooltip: "Primary competitor for comparison."
      }
    ]
  },
  {
    id: "step2_current_onboarding",
    title: "Step 2 — Current Onboarding Flow",
    fields: [
      {
        id: "signup_methods",
        label: "How do new users sign up today?",
        type: "multiselect",
        required: true,
        tooltip: "Available sign-up methods.",
        options: [
          { value: "email_password", label: "Email & Password" },
          { value: "social_google", label: "Social login (Google)" },
          { value: "social_facebook", label: "Social login (Facebook)" },
          { value: "social_linkedin", label: "Social login (LinkedIn)" },
          { value: "sso", label: "SSO" },
          { value: "invitation_only", label: "Invitation-only" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "first_screen",
        label: "After signup, what do users see first?",
        type: "select",
        required: true,
        options: [
          { value: "walkthrough", label: "Guided walkthrough / tutorial" },
          { value: "empty_dashboard", label: "Empty dashboard" },
          { value: "welcome_page", label: "Welcome page" },
          { value: "setup_wizard", label: "Setup wizard" },
          { value: "task_checklist", label: "Task list / checklist" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "track_dropoffs",
        label: "Do you track drop-off points during onboarding?",
        type: "select",
        required: true,
        options: [
          { value: "full", label: "Yes — full tracking" },
          { value: "partial", label: "Yes — partial tracking" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" }
        ]
      },
      {
        id: "activation_definition",
        label: "Activation definition (event/condition)",
        type: "text",
        required: true,
        placeholder: "e.g., created_project & invited_user",
        tooltip: "Exact action(s) that define an activated user."
      },
      {
        id: "aha_moment",
        label: "Aha moment (short)",
        type: "text",
        placeholder: "e.g., First report generated"
      },
      {
        id: "time_to_aha_minutes",
        label: "Time-to-Aha (minutes)",
        type: "number",
        min: 0,
        placeholder: "e.g., 12"
      },
      {
        id: "blocking_steps",
        label: "Blocking steps",
        type: "checkboxes",
        options: [
          { value: "email_verify", label: "Email verification" },
          { value: "phone_sms", label: "Phone/SMS" },
          { value: "credit_card", label: "Credit card" },
          { value: "manual_approval", label: "Manual approval" },
          { value: "paywall", label: "Paywall" }
        ]
      },
      {
        id: "platforms",
        label: "Platforms",
        type: "checkboxes",
        options: [
          { value: "web", label: "Web" },
          { value: "ios", label: "iOS" },
          { value: "android", label: "Android" },
          { value: "extension", label: "Extension" }
        ]
      },
      {
        id: "compliance_constraints",
        label: "SSO / compliance constraints",
        type: "checkboxes",
        options: [
          { value: "sso", label: "SSO" },
          { value: "gdpr", label: "GDPR" },
          { value: "soc2", label: "SOC2" },
          { value: "hipaa", label: "HIPAA" },
          { value: "other", label: "Other" }
        ]
      }
    ]
  },
  {
    id: "step25_analytics_access",
    title: "Step 2.5 — Analytics & Access",
    fields: [
      {
        id: "analytics_tool",
        label: "Analytics tool",
        type: "select",
        required: true,
        options: [
          { value: "ga4", label: "GA4" },
          { value: "amplitude", label: "Amplitude" },
          { value: "mixpanel", label: "Mixpanel" },
          { value: "heap", label: "Heap" },
          { value: "in_house", label: "In-house" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "key_events",
        label: "Key events available",
        type: "tags",
        placeholder: "signup, verified, tutorial_completed, aha_event, activated, invited_user, payment_started"
      },
      {
        id: "signups_per_week",
        label: "Signups/week",
        type: "number",
        min: 0
      },
      {
        id: "mau",
        label: "MAU",
        type: "number",
        min: 0
      },
      {
        id: "mobile_percent",
        label: "% mobile",
        type: "number",
        min: 0,
        max: 100
      },
      {
        id: "readonly_access",
        label: "Read-only access / demo",
        type: "radio",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]
      },
      {
        id: "access_instructions",
        label: "Access instructions",
        type: "textarea",
        placeholder: "How to access demo or read-only environment"
      }
    ]
  },
  {
    id: "step3_goal_metrics",
    title: "Step 3 — Goal & Metrics",
    fields: [
      {
        id: "main_goal",
        label: "Main goal for this audit",
        type: "select",
        required: true,
        options: [
          { value: "activation_rate", label: "Activation rate" },
          { value: "time_to_aha", label: "Time-to-Aha" },
          { value: "trial_to_paid", label: "Trial→Paid" },
          { value: "retention_30", label: "30-day retention" },
          { value: "retention_90", label: "90-day retention" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "know_churn_rate",
        label: "Do you know your churn rate?",
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" }
        ]
      },
      {
        id: "churn_when",
        label: "When does churn usually happen?",
        type: "select",
        options: [
          { value: "during_onboarding", label: "During onboarding" },
          { value: "first_week", label: "First week" },
          { value: "first_month", label: "First month" },
          { value: "one_to_three_months", label: "1–3 months" },
          { value: "after_three_months", label: "After 3 months" },
          { value: "not_sure", label: "Not sure" }
        ]
      },
      {
        id: "target_improvement_percent",
        label: "Target improvement (%)",
        type: "number",
        min: 0,
        max: 100,
        placeholder: "e.g., 15"
      },
      {
        id: "time_horizon",
        label: "Time horizon",
        type: "select",
        options: [
          { value: "4_weeks", label: "4 weeks" },
          { value: "8_weeks", label: "8 weeks" },
          { value: "12_weeks", label: "12 weeks" }
        ]
      },
      {
        id: "main_segments",
        label: "Main segments",
        type: "multiselect",
        options: [
          { value: "self_serve", label: "Self-serve" },
          { value: "smb_admin", label: "SMB admin" },
          { value: "end_user", label: "End-user" },
          { value: "technical_champion", label: "Technical champion" },
          { value: "buyer", label: "Buyer" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "constraints",
        label: "Specific constraints/risks",
        type: "textarea",
        placeholder: "Limitations or risks to consider"
      }
    ]
  },
  {
    id: "step4_delivery",
    title: "Step 4 — Delivery",
    fields: [
      {
        id: "report_email",
        label: "Your email to send the report",
        type: "email",
        required: true
      },
      {
        id: "include_benchmarks",
        label: "Include benchmarks",
        type: "checkbox"
      },
      {
        id: "want_ab_plan",
        label: "Do you want an A/B experiment plan?",
        type: "checkbox"
      },
      {
        id: "screenshots",
        label: "Upload screenshots (optional)",
        type: "file"
      },
      {
        id: "walkthrough_url",
        label: "Walkthrough video (Loom)",
        type: "url"
      },
      {
        id: "demo_account",
        label: "Demo account / sandbox",
        type: "text"
      }
    ]
  },
  {
    id: "optional_evidence",
    title: "Optional Evidence",
    fields: [
      {
        id: "feature_flags",
        label: "Feature flags / A/B infrastructure available",
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]
      },
      {
        id: "ab_tool",
        label: "A/B or feature flag tool (if any)",
        type: "text",
        placeholder: "e.g., LaunchDarkly, Optimizely"
      },
      {
        id: "languages",
        label: "Languages / regions",
        type: "multiselect",
        options: [
          { value: "english", label: "English" },
          { value: "spanish", label: "Spanish" },
          { value: "french", label: "French" },
          { value: "german", label: "German" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "empty_states_urls",
        label: "Current empty states (screenshots or URLs)",
        type: "textarea"
      },
      {
        id: "notifications_provider",
        label: "Push/in-app notifications (provider)",
        type: "text",
        placeholder: "e.g., OneSignal, Braze"
      }
    ]
  }
];
```

---

### (Optional) Minimal Zod schema you can derive from the config

```ts
import { z } from "zod";

export const OnboardingAuditSchema = z.object({
  product_name: z.string().min(1),
  signup_link: z.string().url(),
  target_user: z.enum([
    "founders","product_managers","growth","customer_success","marketing","sales","operations","other"
  ]),
  value_prop: z.string().min(1),
  icp_company_size: z.enum([
    "startup_1_20","smb_21_200","mid_200_1000","enterprise_1000_plus"
  ]),
  icp_industry: z.enum([
    "saas","fintech","ecommerce","healthtech","edtech","cybersecurity","logistics","productivity","devtools","other"
  ]),
  icp_primary_role: z.enum([
    "admin","end_user","technical_champion","buyer","finance_procurement","other"
  ]),
  day1_jtbd: z.string().min(1),
  pricing_tier: z.enum(["free","trial","starter","pro","business","enterprise"]),
  main_competitor: z.string().optional(),
  signup_methods: z.array(z.enum([
    "email_password","social_google","social_facebook","social_linkedin","sso","invitation_only","other"
  ])).min(1),
  first_screen: z.enum(["walkthrough","empty_dashboard","welcome_page","setup_wizard","task_checklist","other"]),
  track_dropoffs: z.enum(["full","partial","no","not_sure"]),
  activation_definition: z.string().min(1),
  aha_moment: z.string().optional(),
  time_to_aha_minutes: z.number().int().nonnegative().optional(),
  blocking_steps: z.array(z.enum(["email_verify","phone_sms","credit_card","manual_approval","paywall"])) .optional(),
  platforms: z.array(z.enum(["web","ios","android","extension"])) .optional(),
  compliance_constraints: z.array(z.enum(["sso","gdpr","soc2","hipaa","other"])) .optional(),
  analytics_tool: z.enum(["ga4","amplitude","mixpanel","heap","in_house","other"]),
  key_events: z.array(z.string()).optional(),
  signups_per_week: z.number().int().nonnegative().optional(),
  mau: z.number().int().nonnegative().optional(),
  mobile_percent: z.number().min(0).max(100).optional(),
  readonly_access: z.enum(["yes","no"]).optional(),
  access_instructions: z.string().optional(),
  main_goal: z.enum(["activation_rate","time_to_aha","trial_to_paid","retention_30","retention_90","other"]),
  know_churn_rate: z.enum(["yes","no","not_sure"]).optional(),
  churn_when: z.enum(["during_onboarding","first_week","first_month","one_to_three_months","after_three_months","not_sure"]).optional(),
  target_improvement_percent: z.number().min(0).max(100).optional(),
  time_horizon: z.enum(["4_weeks","8_weeks","12_weeks"]).optional(),
  main_segments: z.array(z.enum(["self_serve","smb_admin","end_user","technical_champion","buyer","other"])) .optional(),
  constraints: z.string().optional(),
  report_email: z.string().email(),
  include_benchmarks: z.boolean().optional(),
  want_ab_plan: z.boolean().optional(),
  screenshots: z.any().optional(),
  walkthrough_url: z.string().url().optional(),
  demo_account: z.string().optional(),
  feature_flags: z.enum(["yes","no"]).optional(),
  ab_tool: z.string().optional(),
  languages: z.array(z.enum(["english","spanish","french","german","other"])) .optional(),
  empty_states_urls: z.string().optional(),
  notifications_provider: z.string().optional()
});
```

**Notes**

* Tooltips are in the `tooltip` property; render them as you wish (e.g., an ⓘ icon).
* All dropdown/multiselect options have explicit `{value,label}` pairs.
* You can safely add/remove industries or roles later without breaking the structure.
* If you need a pure JSON version, we can export `FORM_CONFIG` as JSON directly.
