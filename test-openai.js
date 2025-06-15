// Test script for OpenAI API
require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔍 Testing OpenAI API...');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'Not found');
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local file');
    console.log('Please add your OpenAI API key to .env.local file:');
    console.log('OPENAI_API_KEY=sk-your-key-here');
    return;
  }

  const postData = JSON.stringify({
    model: 'text-embedding-3-small',
    input: 'Hello, this is a test message for OpenAI API'
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/embeddings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n📡 Testing embeddings API...');

  const req = https.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.error('❌ API Error:', res.statusCode, res.statusMessage);
        console.error('Error details:', data);
        
        if (res.statusCode === 401) {
          console.error('🔑 Authentication failed. Please check your API key.');
        } else if (res.statusCode === 429) {
          console.error('⏰ Rate limit exceeded. Please wait and try again.');
        }
        return;
      }

      try {
        const responseData = JSON.parse(data);
        console.log('✅ API call successful!');
        console.log('Embedding dimensions:', responseData.data[0].embedding.length);
        console.log('Model used:', responseData.model);
        console.log('Usage:', responseData.usage);
        
        console.log('\n🎉 OpenAI API is working correctly!');
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Network or other error:', error.message);
    console.log('Please check your internet connection and try again.');
  });

  req.write(postData);
  req.end();
}

// Run the test
testOpenAI(); 