// test-all-analytics.js
// Script para probar el tracking de analytics en todos los productos

const API_BASE = 'https://api-fu54nvsqfa-uc.a.run.app';

async function testAllAnalytics() {
  console.log('🧪 Testing Analytics Tracking for All Products...\n');

  const products = [
    { id: 'uaylabs', name: 'UayLabs' },
    { id: 'onboardingaudit', name: 'Onboarding Audit' },
    { id: 'jobpulse', name: 'JobPulse' },
    { id: 'pulziohq', name: 'PulzioHQ' },
    { id: 'ignium', name: 'Ignium' },
    { id: 'ahau', name: 'Ahau' }
  ];

  for (const product of products) {
    console.log(`📊 Testing analytics tracking for ${product.name} (${product.id}):`);
    
    try {
      const testData = {
        projectId: product.id,
        page: `${product.id}-landing`,
        referrer: 'test-script',
        userAgent: 'test-user-agent',
        screenResolution: '1920x1080',
        timeOnPage: 5000,
        scrollDepth: 75,
        interactions: ['click', 'scroll'],
        sessionId: `test_session_${product.id}_${Date.now()}`,
        userId: 'test-user'
      };

      const response = await fetch(`${API_BASE}/api/public/trackVisit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`  ✅ ${product.name}: Track visit successful`);
        console.log(`     - Session ID: ${data.sessionId}`);
        console.log(`     - Page: ${testData.page}`);
      } else {
        console.log(`  ❌ ${product.name}: Track visit failed`);
        console.log(`     - Status: ${response.status}`);
        console.log(`     - Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`  ❌ ${product.name}: Error - ${error.message}`);
    }

    console.log('');
  }

  // Test analytics data retrieval
  console.log('📈 Testing Analytics Data Retrieval:');
  
  for (const product of products) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: product.id })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`  ✅ ${product.name}:`);
        console.log(`     - Total Visits: ${data.totalVisits}`);
        console.log(`     - Total Submissions: ${data.totalSubmissions}`);
        console.log(`     - Total Waitlist: ${data.totalWaitlist}`);
        console.log(`     - Conversion Rate: ${data.conversionRate}%`);
      } else {
        console.log(`  ❌ ${product.name}: ${data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ ${product.name}: Error - ${error.message}`);
    }
  }

  // Test global stats
  console.log('\n🌍 Testing Global Stats:');
  try {
    const response = await fetch(`${API_BASE}/api/admin/global-stats`, {
      method: 'GET'
    });

    const data = await response.json();

    if (data.success) {
      console.log(`  ✅ Global Stats:`);
      console.log(`     - Total Products: ${data.totalProducts}`);
      console.log(`     - Total Visits: ${data.totalVisits}`);
      console.log(`     - Total Submissions: ${data.totalSubmissions}`);
      console.log(`     - Total Waitlist: ${data.totalWaitlist}`);
      console.log(`     - Recent Activity: ${data.recentActivity?.length || 0} items`);
    } else {
      console.log(`  ❌ Global Stats: ${data.message}`);
    }
  } catch (error) {
    console.log(`  ❌ Global Stats: Error - ${error.message}`);
  }
}

testAllAnalytics().catch(console.error);
