// Script de prueba para verificar endpoints
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

async function testGetEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing GET ${endpoint}...`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
    return null;
  }
}

async function testAllEndpoints() {
  console.log('🚀 Testing all endpoints...\n');
  
  const products = ['uaylabs', 'ahau', 'onboardingaudit', 'ignium'];
  
  for (const productId of products) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Testing product: ${productId}`);
    console.log(`${'='.repeat(50)}`);
    
    // Test analytics
    await testEndpoint('/api/admin/analytics', { projectId: productId });
    
    // Test waitlist
    await testEndpoint('/api/admin/waitlist', { projectId: productId });
    
    // Test product config (GET with query parameter)
    await testGetEndpoint(`/api/admin/product-config?projectId=${productId}`);
  }
  
  // Test global stats
  console.log(`\n${'='.repeat(50)}`);
  console.log('🌍 Testing global stats');
  console.log(`${'='.repeat(50)}`);
  
  await testGetEndpoint('/api/admin/global-stats');
  
  // Test products list
  console.log(`\n${'='.repeat(50)}`);
  console.log('📋 Testing products list');
  console.log(`${'='.repeat(50)}`);
  
  await testGetEndpoint('/api/admin/products');
  
  // Test all product configs
  console.log(`\n${'='.repeat(50)}`);
  console.log('⚙️ Testing all product configs');
  console.log(`${'='.repeat(50)}`);
  
  await testGetEndpoint('/api/admin/all-product-configs');
}

// Ejecutar pruebas
testAllEndpoints().then(() => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('\n❌ Test execution failed:', error);
});
