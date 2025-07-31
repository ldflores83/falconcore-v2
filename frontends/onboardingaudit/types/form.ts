export interface OnboardingAuditForm {
  // Section 1 - Product Basics
  productName: string;
  productUrl: string;
  targetUser: 'Founders' | 'Developers' | 'SMBs' | 'Consumers' | 'Other';
  
  // Section 2 - Current Onboarding Flow
  signupMethod: 'Email & Password' | 'Google' | 'Invite-only' | 'Other';
  signupMethodOther?: string;
  firstTimeExperience: 'A guided walkthrough or tutorial' | 'A blank/empty dashboard with a call-to-action' | 'A checklist or progress bar to complete setup' | 'Something else (please describe)';
  firstTimeExperienceOther?: string;
  trackDropoff: 'Yes' | 'No' | 'Not sure';
  
  // Section 2.5 - Optional: Help us see your flow
  hasTestAccess: boolean;
  testInstructions?: string;
  onboardingEmails: 'Email' | 'Slack' | 'Discord' | 'None' | 'Other';
  
  // Section 3 - Goal & Metrics
  mainGoal: 'Activation' | 'Conversion' | 'Reduce churn' | 'Other';
  knowChurnRate: 'Yes' | 'No' | 'Not yet';
  churnTiming: '24h' | '1 week' | '1 month' | 'Longer' | 'Not sure';
  specificConcerns?: string;
  
  // Section 4 - Delivery
  email: string;
  preferredFormat: 'Google Doc' | 'Google Slides';
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