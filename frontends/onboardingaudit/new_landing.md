# Onboarding Audit – Landing Page Draft

## Section 1 – Hero / Big Picture

**Headline:** Maximize Your Activation Rate with a Professional Onboarding Audit

**Subheadline:** Your first impression matters. Improve user activation, reduce churn, and boost retention by optimizing your onboarding flow.

**Primary CTA Button:** Start My Audit

**Suggested Image:** A high-quality hero image showing a product dashboard with a welcoming guide overlay, symbolizing a smooth onboarding experience.

---

## Section 2 – Why Onboarding Matters

**Intro:** Onboarding is the user’s first experience with your product. A smooth, well-designed onboarding guides them to their “aha moment” quickly, increasing the chance they’ll stay and succeed.

**Key Stats:**

* Companies with optimized onboarding see up to **50% higher activation rates**.
* Reducing Time-to-Aha by even 20% can significantly lower churn.
* Poor onboarding is one of the top 3 reasons users abandon a product in the first week.

**Visual Idea:** Funnel graphic showing steps: Signup → First Action → Aha Moment → Activation.
**Suggested Image Style:** Minimalist vector illustration with clean lines, showing the funnel and drop-off percentages at each stage.

---

## Section 3 – What the Audit Delivers

**Deliverables List:**

* A clear **map of your current onboarding steps**.
* Identification of **bottlenecks and drop-off points**.
* A **7-day action plan** with quick wins.
* **Benchmarks** compared to similar products in your industry.

**Differentiator:** Unlike generic checklists, our audit provides tailored, actionable recommendations based on your actual flow and business goals.

**Suggested Image:** Side-by-side comparison graphic – “Before Audit” (confusing flow) vs. “After Audit” (streamlined flow with clear steps).

---

## Section 4 – Who Should Use It

**Ideal Profiles:**

* SaaS founders looking to improve conversion from signup to paid.
* Growth leads aiming to boost activation rates.
* Customer success managers responsible for adoption and retention.

**Suggested Image:** Collage of personas/icons representing these roles, each connected to the onboarding process.

---

## Section 5 – How It Works

1. **Fill out the form** with details about your current onboarding.
2. **We analyze** your flow and metrics.
3. **Receive your report** with quick wins, benchmarks, and a 4–8 week improvement plan.

**Turnaround Time:** Initial report delivered within 3–5 business days.

**Suggested Image:** Three-step infographic (icons + short labels) to visually explain the process.

---

## Section 6 – Pricing & Limited Free Offer

**Headline:** Introductory Free Audits – Limited Spots Available

**Copy:** This audit is currently in **beta**. We’re offering a limited number of **free audits** to collect feedback and refine our process. Once these spots are filled, the audit will be available at an **introductory price of \$50 USD**.

**CTA Button:** Claim My Free Audit

---

## Section 7 – Final Call to Action

**Headline:** Ready to improve your onboarding?

**CTA Button:** Start My Audit Now

**Note:** The more complete your answers in the form, the more precise and actionable your audit will be.

**Suggested Image:** A closing banner with a happy user illustration, representing successful activation.

---

## Instruction for Cursor – Deploying Landing + Form in Firebase Hosting

When generating the new **Onboarding Audit landing page**, follow these steps to adjust the current `uaylabs.web.app/onboardingaudit` deployment so the landing is served first, and the form is still accessible.

### 1. Directory & Routing Structure

* Create a subdirectory: `/onboardingaudit/`

  * `index.html` → landing page content (this file will be built from the new landing design).
  * `/form/` → contains the existing onboarding audit form as `index.html` or React route.
* Ensure that internal navigation between landing → form is handled via relative paths (`/onboardingaudit/form/`).

### 2. React / Vite Routing Adjustments

* If using React Router:

  * Add a route for `/onboardingaudit/` → Landing component.
  * Add a route for `/onboardingaudit/form` → Form component (existing implementation).
  * Make sure the **Primary CTA Button** in the landing links to `/onboardingaudit/form`.
* If using static HTML for landing and SPA for form:

  * Serve landing as static HTML.
  * Keep form deployment as SPA inside `/form/`.

### 3. Firebase Hosting Config

* In `firebase.json`, update rewrites:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "/onboardingaudit", "destination": "/onboardingaudit/index.html" },
      { "source": "/onboardingaudit/form/**", "destination": "/onboardingaudit/form/index.html" }
    ]
  }
}
```

* Deploy with `firebase deploy --only hosting` after build.

### 4. Asset & Image Handling

* Place all landing images in `/onboardingaudit/assets/` to avoid conflicts with form assets.
* Ensure image paths are relative so they work in Firebase Hosting subpath.

### 5. Validation Before Deploy

* Test locally with `firebase emulators:start` or `vite preview` to ensure:

  * Landing loads at `/onboardingaudit/`.
  * Form loads at `/onboardingaudit/form/`.
  * Navigation between them is functional.
  * No asset path issues when deployed in a subdirectory.

### 6. Deployment Checklist

* [ ] Landing and form build without errors.
* [ ] Firebase `public` folder contains `/onboardingaudit/index.html` and `/onboardingaudit/form/`.
* [ ] `firebase.json` rewrites are correct.
* [ ] Tested locally before deployment.

**Note:** This structure keeps the landing and form modular, so future updates to either page won't break the other.
