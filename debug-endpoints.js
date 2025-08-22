// Script de debug para endpoints
const API_BASE = 'https://api-fu54nvsqfa-uc.a.run.app';

async function testEndpoint(endpoint, data) {
  try {
    console.log(`\n🔍 Testing ${endpoint}...`);
    console.log('📤 Request data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
    return null;
  }
}

async function debugEndpoints() {
  console.log('🚀 Debugging endpoints...\n');
  
  // Test con ahau específicamente
  console.log('Testing ahau analytics:');
  await testEndpoint('/api/admin/analytics', { projectId: 'ahau' });
  
  console.log('\nTesting ahau waitlist:');
  await testEndpoint('/api/admin/waitlist', { projectId: 'ahau' });
  
  // Test con onboardingaudit
  console.log('\nTesting onboardingaudit analytics:');
  await testEndpoint('/api/admin/analytics', { projectId: 'onboardingaudit' });
  
  console.log('\nTesting onboardingaudit waitlist:');
  await testEndpoint('/api/admin/waitlist', { projectId: 'onboardingaudit' });
}

debugEndpoints().then(() => {
  console.log('\n✅ Debug completed!');
}).catch(error => {
  console.error('\n❌ Debug failed:', error);
});
