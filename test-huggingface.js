require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testHuggingFace() {
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'hf_demo';

  const postData = JSON.stringify({
    inputs: 'This is a test sentence for embedding.'
  });

  const options = {
    hostname: 'api-inference.huggingface.co',
    port: 443,
    path: '/models/sentence-transformers/all-MiniLM-L6-v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log(`📡 Calling https://${options.hostname}${options.path}...`);

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.error(`❌ API Error: ${res.statusCode} ${res.statusMessage}`);
        console.error('Error details:', data);
        return;
      }

      try {
        const result = JSON.parse(data);
        console.log('✅ Embedding received. Example vector:', result[0].slice(0, 5), '...');
      } catch (err) {
        console.error('❌ Failed to parse response:', err);
      }
    });
  });

  req.on('error', error => {
    console.error('❌ Request error:', error);
  });

  req.write(postData);
  req.end();
}

testHuggingFace();
