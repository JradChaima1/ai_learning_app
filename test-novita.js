// Test script for Novita AI API with BGE-M3 Embedding Model
require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testNovitaAI() {
  const apiKey = process.env.NOVITA_API_KEY;
  
  console.log('🔍 Testing Novita AI API with BGE-M3 Embedding Model...');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'Not found');
  
  if (!apiKey) {
    console.error('❌ NOVITA_API_KEY is not set in your .env.local file');
    console.log('💡 Get your API key from: https://novita.ai/');
    return;
  }

  const postData = JSON.stringify({
    model: 'baai/bge-m3',
    input: 'Hello, this is a test message for Novita AI baai/bge-m3'
  });

  const options = {
    hostname: 'api.novita.ai',
    port: 443,
    path: '/v3/openai/embeddings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n📡 Testing Novita AI embeddings API...');
  console.log('Full URL:', `https://${options.hostname}${options.path}`);
  console.log('Model:', 'baai/bge-m3');

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
        } else if (res.statusCode === 400) {
          console.error('📝 Bad request. Check the input format.');
        } else if (res.statusCode === 404) {
          console.error('🔍 Model not found. Check the model name.');
        }
        return;
      }

      try {
        const responseData = JSON.parse(data);
        console.log('✅ API call successful!');
        
        if (responseData.data && responseData.data[0] && responseData.data[0].embedding) {
          const embedding = responseData.data[0].embedding;
          console.log('Embedding dimensions:', embedding.length);
          console.log('First few values:', embedding.slice(0, 5));
          console.log('Model used:', responseData.model || 'baai/bge-m3');
          
          console.log('\n🎉 Novita AI baai/bge-m3 Embedding API is working correctly!');
          console.log('✅ You can now use this for semantic search with Zilliz!');
          console.log('📊 Embedding dimension: 1024 (perfect for vector search)');
        } else {
          console.log('Response data:', responseData);
        }
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
testNovitaAI(); 