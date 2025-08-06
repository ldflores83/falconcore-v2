// test-debug-service-account.cjs

const https = require('https');

const testDebugEndpoint = async () => {
  console.log('🔧 Testing Service Account Debug Endpoint...');
  
  const options = {
    hostname: 'api-fu54nvsqfa-uc.a.run.app',
    port: 443,
    path: '/onboardingaudit/api/public/debugServiceAccount',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('🔧 Response status:', res.statusCode);
      console.log('🔧 Response headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('🔧 Response body:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(JSON.stringify({ test: true }));
    req.end();
  });
};

// Ejecutar el test
testDebugEndpoint()
  .then(result => {
    console.log('✅ Debug test completed');
    console.log('🔧 Result:', result);
  })
  .catch(error => {
    console.error('❌ Debug test failed:', error);
  }); 