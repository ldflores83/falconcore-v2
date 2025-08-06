// test-oauth-login.cjs

const https = require('https');

const testOAuthLogin = async () => {
  console.log('🔧 Testing OAuth Login with Secret Manager...');
  
  const options = {
    hostname: 'api-fu54nvsqfa-uc.a.run.app',
    port: 443,
    path: '/onboardingaudit/api/oauth/login?project_id=onboardingaudit&t=' + Date.now(),
    method: 'GET',
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

    req.end();
  });
};

// Ejecutar el test
testOAuthLogin()
  .then(result => {
    console.log('✅ OAuth login test completed');
    console.log('🔧 Result:', result);
    
    if (result.status === 200) {
      console.log('✅ OAuth login working with Secret Manager!');
    } else {
      console.log('❌ OAuth login failed');
    }
  })
  .catch(error => {
    console.error('❌ OAuth login test failed:', error);
  }); 