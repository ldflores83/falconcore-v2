// Usar fetch nativo de Node.js (disponible desde Node.js 18+)

const API_BASE = 'https://api-fu54nvsqfa-uc.a.run.app';

async function testTrackVisit() {
  console.log('🧪 Testing Track Visit Endpoint...\n');

  const testData = {
    projectId: 'onboardingaudit',
    page: 'test-page',
    referrer: 'test-referrer',
    userAgent: 'test-user-agent',
    screenResolution: '1920x1080',
    timeOnPage: 5000,
    scrollDepth: 75,
    interactions: ['click', 'scroll'],
    sessionId: `test_session_${Date.now()}`,
    userId: 'test-user'
  };

  try {
    console.log('📤 Sending test visit data:', testData);
    
    const response = await fetch(`${API_BASE}/api/public/trackVisit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Track visit successful:');
      console.log('   - Response:', data);
      console.log('   - Session ID:', data.sessionId);
    } else {
      console.log('❌ Track visit failed:');
      console.log('   - Status:', response.status);
      console.log('   - Response:', data);
    }
  } catch (error) {
    console.log('❌ Error testing track visit:', error.message);
  }

  // Test with another product
  console.log('\n📤 Testing track visit for ignium...');
  
  const testDataIgnium = {
    projectId: 'ignium',
    page: 'ignium-landing',
    referrer: 'direct',
    userAgent: 'test-user-agent',
    screenResolution: '1920x1080',
    timeOnPage: 3000,
    scrollDepth: 50,
    interactions: ['click'],
    sessionId: `test_session_ignium_${Date.now()}`,
    userId: 'test-user'
  };

  try {
    const response = await fetch(`${API_BASE}/api/public/trackVisit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDataIgnium)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Track visit for ignium successful:');
      console.log('   - Response:', data);
    } else {
      console.log('❌ Track visit for ignium failed:');
      console.log('   - Status:', response.status);
      console.log('   - Response:', data);
    }
  } catch (error) {
    console.log('❌ Error testing track visit for ignium:', error.message);
  }
}

testTrackVisit().catch(console.error);
