// Usar fetch nativo de Node.js (disponible desde Node.js 18+)

const API_BASE = 'https://api-fu54nvsqfa-uc.a.run.app';

async function testAnalytics() {
  console.log('🧪 Testing Analytics Endpoints...\n');

  const products = ['uaylabs', 'onboardingaudit', 'jobpulse', 'pulziohq', 'ignium', 'ahau'];

  for (const productId of products) {
    console.log(`📊 Testing analytics for ${productId}:`);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: productId })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`  ✅ ${productId}:`);
        console.log(`     - Total Visits: ${data.totalVisits}`);
        console.log(`     - Total Submissions: ${data.totalSubmissions}`);
        console.log(`     - Total Waitlist: ${data.totalWaitlist}`);
        console.log(`     - Conversion Rate: ${data.conversionRate}%`);
        console.log(`     - Last Activity: ${data.lastActivity}`);
      } else {
        console.log(`  ❌ ${productId}: ${data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ ${productId}: Error - ${error.message}`);
    }
    
    console.log('');
  }

  // Test global stats
  console.log('🌍 Testing Global Stats:');
  try {
    const response = await fetch(`${API_BASE}/api/admin/global-stats`, {
      method: 'GET'
    });

    const data = await response.json();
    
    console.log(`  ✅ Global Stats:`);
    console.log(`     - Total Products: ${data.totalProducts}`);
    console.log(`     - Total Visits: ${data.totalVisits}`);
    console.log(`     - Total Submissions: ${data.totalSubmissions}`);
    console.log(`     - Total Waitlist: ${data.totalWaitlist}`);
    console.log(`     - Recent Activity: ${data.recentActivity?.length || 0} items`);
  } catch (error) {
    console.log(`  ❌ Global Stats: Error - ${error.message}`);
  }
}

testAnalytics().catch(console.error);
