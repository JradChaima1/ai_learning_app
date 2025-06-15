// Test script for Zilliz
require('dotenv').config({ path: '.env.local' });

const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

async function testZilliz() {
  console.log('🔍 Testing Zilliz Connection...');
  
  const endpoint = process.env.ZILLIZ_ENDPOINT;
  const token = process.env.ZILLIZ_TOKEN;
  const collectionName = process.env.ZILLIZ_COLLECTION_NAME || 'course_embeddings';
  
  console.log('Endpoint exists:', !!endpoint);
  console.log('Token exists:', !!token);
  console.log('Collection name:', collectionName);
  
  if (!endpoint || !token) {
    console.error('❌ Missing Zilliz credentials in .env.local');
    console.log('Please add:');
    console.log('ZILLIZ_ENDPOINT=https://your-cluster.zilliz.com');
    console.log('ZILLIZ_TOKEN=your-zilliz-api-key');
    return;
  }

  try {
    console.log('\n📡 Connecting to Zilliz...');
    
    const client = new MilvusClient({
      address: endpoint,
      token: token
    });

    // Test connection
    console.log('Testing connection...');
    const hasCollection = await client.hasCollection({
      collection_name: collectionName
    });
    
    console.log('✅ Connection successful!');
    console.log('Collection exists:', hasCollection.value);

    if (!hasCollection.value) {
      console.log('\n🏗️ Creating collection...');
      
      // Create collection
      await client.createCollection({
        collection_name: collectionName,
        fields: [
          {
            name: 'id',
            data_type: 'VarChar',
            max_length: 100,
            is_primary_key: true
          },
          {
            name: 'course_id',
            data_type: 'VarChar',
            max_length: 100
          },
          {
            name: 'content',
            data_type: 'VarChar',
            max_length: 5000
          },
          {
            name: 'embedding',
            data_type: 'FloatVector',
            dim: 384 // Hugging Face all-MiniLM-L6-v2 dimension
          },
          {
            name: 'metadata',
            data_type: 'JSON'
          }
        ]
      });

      // Create index
      console.log('Creating index...');
      await client.createIndex({
        collection_name: collectionName,
        field_name: 'embedding',
        index_type: 'IVF_FLAT',
        metric_type: 'L2',
        params: { nlist: 1024 }
      });

      // Load collection
      console.log('Loading collection...');
      await client.loadCollection({
        collection_name: collectionName
      });

      console.log('✅ Collection created and indexed successfully!');
    } else {
      console.log('✅ Collection already exists!');
    }

    console.log('\n🎉 Zilliz is ready for semantic search!');
    
  } catch (error) {
    console.error('❌ Zilliz connection failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('🔑 Authentication failed. Please check your API key.');
    } else if (error.message.includes('connection')) {
      console.error('🌐 Connection failed. Please check your endpoint URL.');
    }
  }
}

// Run the test
testZilliz(); 