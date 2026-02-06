const fetch = require('node-fetch');

async function testBackend() {
  const baseUrl = 'http://localhost:5000/api/auth';
  
  console.log('Testing backend...');
  
  // Test registration
  const registerData = {
    name: "Test User",
    email: "test@example.com",
    password: "Test123"
  };
  
  try {
    console.log('\n1. Testing registration...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const regResult = await regRes.json();
    console.log('Registration:', regResult);
    
    // Test login
    console.log('\n2. Testing login...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test123"
      })
    });
    const loginResult = await loginRes.json();
    console.log('Login:', loginResult);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testBackend();