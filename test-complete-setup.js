// Complete setup test for Hugging Face + Zilliz
require('dotenv').config({ path: '.env.local' });

const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const https = require('https');

async function testHuggingFace() {
  console.log('🔍 Testing Hugging Face API...');
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  console.log('API Key exists:', !!apiKey);
  
  const postData = JSON.stringify({
    inputs: "This is a test for course embeddings",
    options: { wait_for_model: true }
  });

  const options = {
    hostname: 'api-inference.huggingface.co',
    port: 443,
    path: '/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey || 'hf_demo'}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const embedding = JSON.parse(data);
            console.log('✅ Hugging Face: Embedding generated successfully');
            console.log('   Dimensions:', embedding.length);
            resolve(embedding);
          } catch (e) {
            reject(new Error('Failed to parse Hugging Face response'));
          }
        } else {
          reject(new Error(`Hugging Face API error: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testZilliz() {
  console.log('\n🔍 Testing Zilliz Connection...');
  
  const endpoint = process.env.ZILLIZ_ENDPOINT;
  const token = process.env.ZILLIZ_TOKEN;
  const collectionName = process.env.ZILLIZ_COLLECTION_NAME || 'course_embeddings';
  
  if (!endpoint || !token) {
    throw new Error('Missing Zilliz credentials');
  }

  const client = new MilvusClient({
    address: endpoint,
    token: token
  });

  // Test connection
  const hasCollection = await client.hasCollection({
    collection_name: collectionName
  });
  
  console.log('✅ Zilliz: Connection successful');
  console.log('   Collection exists:', hasCollection.value);
  
  return { client, collectionName };
}

async function testCompleteSetup() {
  try {
    console.log('🚀 Testing Complete Setup: Hugging Face + Zilliz\n');
    
    // Test Hugging Face
    const embedding = await testHuggingFace();
    
    // Test Zilliz
    const { client, collectionName } = await testZilliz();
    
    // Test storing and retrieving embeddings
    console.log('\n🔍 Testing Embedding Storage and Retrieval...');
    
    const testData = {
      id: 'test_course_1',
      course_id: 'test_course',
      content: 'This is a test course about machine learning',
      embedding: embedding,
      metadata: {
        test: true,
        created_at: new Date().toISOString()
      }
    };

    // Insert test data
    await client.insert({
      collection_name: collectionName,
      data: [testData]
    });

    // Flush to ensure data is written
    await client.flush({
      collection_names: [collectionName]
    });

    console.log('✅ Test data inserted successfully');

    // Search for similar content
    const searchResults = await client.search({
      collection_name: collectionName,
      vectors: [embedding],
      search_params: {
        anns_field: 'embedding',
        topk: 1,
        metric_type: 'L2',
        params: JSON.stringify({ nprobe: 10 })
      },
      output_fields: ['course_id', 'content', 'metadata']
    });

    console.log('✅ Search test successful');
    console.log('   Found results:', searchResults.results.length);

    // Clean up test data
    await client.delete({
      collection_name: collectionName,
      filter: `course_id == "test_course"`
    });

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 COMPLETE SETUP TEST PASSED!');
    console.log('✅ Hugging Face API: Working');
    console.log('✅ Zilliz Vector Database: Working');
    console.log('✅ Embedding Generation: Working');
    console.log('✅ Vector Storage: Working');
    console.log('✅ Semantic Search: Working');
    console.log('\n🚀 Your AI-powered course search is ready!');
    
  } catch (error) {
    console.error('\n❌ Setup test failed:', error.message);
    
    if (error.message.includes('Hugging Face')) {
      console.log('\n💡 Hugging Face Setup:');
      console.log('1. Go to https://huggingface.co/');
      console.log('2. Sign up (free)');
      console.log('3. Go to Settings → Access Tokens');
      console.log('4. Create new token');
      console.log('5. Add to .env.local: HUGGINGFACE_API_KEY=hf_your_token');
    }
    
    if (error.message.includes('Zilliz') || error.message.includes('Missing Zilliz')) {
      console.log('\n💡 Zilliz Setup:');
      console.log('1. Go to https://cloud.zilliz.com/');
      console.log('2. Sign up (free tier available)');
      console.log('3. Create a cluster');
      console.log('4. Get endpoint and API key');
      console.log('5. Add to .env.local:');
      console.log('   ZILLIZ_ENDPOINT=https://your-cluster.zilliz.com');
      console.log('   ZILLIZ_TOKEN=your-zilliz-api-key');
    }
  }
}

// Run the complete test
testCompleteSetup(); 