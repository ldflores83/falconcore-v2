import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OnboardingAudit() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the landing page
    router.replace('/onboardingaudit/landing');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
} 