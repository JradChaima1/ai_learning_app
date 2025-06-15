require('dotenv').config({ path: '.env.local' });
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

async function checkZillizData() {
  try {
    console.log('🔍 Checking Zilliz collection data...');
    
    const client = new MilvusClient({
      address: process.env.ZILLIZ_ENDPOINT,
      token: process.env.ZILLIZ_TOKEN
    });
    
    const collectionName = process.env.ZILLIZ_COLLECTION_NAME || 'course_embeddings';
    
    // Check if collection exists
    const hasCollection = await client.hasCollection({
      collection_name: collectionName
    });
    
    if (!hasCollection.value) {
      console.log('❌ Collection does not exist');
      return;
    }
    
    console.log('✅ Collection exists');
    
    // Get collection statistics
    const stats = await client.getCollectionStatistics({
      collection_name: collectionName
    });
    
    console.log('📊 Collection statistics:', stats);
    
    // Try to get some sample data
    try {
      const queryResults = await client.query({
        collection_name: collectionName,
        filter: '',
        output_fields: ['course_id', 'content'],
        limit: 5
      });
      
      console.log('\n📚 Sample data in collection:');
      if (queryResults.data && queryResults.data.length > 0) {
        queryResults.data.forEach((item, index) => {
          console.log(`${index + 1}. Course ID: ${item.course_id}`);
          console.log(`   Content preview: ${item.content.substring(0, 100)}...`);
          console.log('');
        });
      } else {
        console.log('❌ No data found in collection');
      }
    } catch (error) {
      console.log('⚠️ Could not query collection (may be empty or not loaded):', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking Zilliz data:', error);
  }
}

checkZillizData(); 