export interface OnboardingAuditForm {
  // Step 1 - Product Basics
  product_name: string;
  signup_link: string;
  target_user: '' | 'founders' | 'product_managers' | 'growth' | 'customer_success' | 'marketing' | 'sales' | 'operations' | 'other';
  value_prop: string;
  icp_company_size: '' | 'startup_1_20' | 'smb_21_200' | 'mid_200_1000' | 'enterprise_1000_plus';
  icp_industry: '' | 'saas' | 'fintech' | 'ecommerce' | 'healthtech' | 'edtech' | 'cybersecurity' | 'logistics' | 'productivity' | 'devtools' | 'other';
  icp_primary_role: '' | 'admin' | 'end_user' | 'technical_champion' | 'buyer' | 'finance_procurement' | 'other';
  day1_jtbd: string;
  pricing_tier: '' | 'free' | 'trial' | 'starter' | 'pro' | 'business' | 'enterprise';
  main_competitor?: string;
  
  // Step 2 - Current Onboarding Flow
  signup_methods: string[];
  first_screen: '' | 'walkthrough' | 'empty_dashboard' | 'welcome_page' | 'setup_wizard' | 'task_checklist' | 'other';
  track_dropoffs: '' | 'full' | 'partial' | 'no' | 'not_sure';
  activation_definition: string;
  aha_moment?: string;
  time_to_aha_minutes?: number;
  blocking_steps?: string[];
  platforms?: string[];
  compliance_constraints?: string[];
  
  // Step 2.5 - Analytics & Access
  analytics_tool: '' | 'ga4' | 'amplitude' | 'mixpanel' | 'heap' | 'in_house' | 'other';
  key_events?: string[];
  signups_per_week?: number;
  mau?: number;
  mobile_percent?: number;
  readonly_access?: 'yes' | 'no';
  access_instructions?: string;
  
  // Step 3 - Goal & Metrics
  main_goal: '' | 'activation_rate' | 'time_to_aha' | 'trial_to_paid' | 'retention_30' | 'retention_90' | 'other';
  know_churn_rate?: 'yes' | 'no' | 'not_sure';
  churn_when?: 'during_onboarding' | 'first_week' | 'first_month' | 'one_to_three_months' | 'after_three_months' | 'not_sure';
  target_improvement_percent?: number;
  time_horizon?: '4_weeks' | '8_weeks' | '12_weeks';
  main_segments?: string[];
  constraints?: string;
  
  // Step 4 - Delivery
  report_email: string;
  include_benchmarks?: boolean;
  want_ab_plan?: boolean;
  screenshots?: File[];
  walkthrough_url?: string;
  demo_account?: string;
  
  // Optional Evidence
  feature_flags?: 'yes' | 'no';
  ab_tool?: string;
  languages?: string[];
  empty_states_urls?: string;
  notifications_provider?: string;
}

export interface FormSubmissionResponse {
  success: boolean;
  submissionId?: string;
  message: string;
  folderId?: string;
  formFileId?: string;
  imageFileIds?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  message: string;
} 