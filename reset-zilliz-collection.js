require('dotenv').config({ path: '.env.local' });
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

async function resetZillizCollection() {
  const client = new MilvusClient({
    address: process.env.ZILLIZ_ENDPOINT,
    token: process.env.ZILLIZ_TOKEN
  });
  const collectionName = process.env.ZILLIZ_COLLECTION_NAME || 'course_embeddings';
  const embeddingDimension = 1024; // For baai/bge-m3

  try {
    // Drop collection if exists
    const hasCollection = await client.hasCollection({ collection_name: collectionName });
    if (hasCollection.value) {
      console.log(`🗑️ Dropping existing collection: ${collectionName}`);
      await client.dropCollection({ collection_name: collectionName });
      console.log('✅ Collection dropped');
    } else {
      console.log('ℹ️ Collection does not exist, will create new');
    }

    // Create collection with correct schema
    console.log(`🏗️ Creating collection: ${collectionName} (dim: ${embeddingDimension})`);
    await client.createCollection({
      collection_name: collectionName,
      fields: [
        { name: 'id', data_type: 'VarChar', max_length: 100, is_primary_key: true },
        { name: 'course_id', data_type: 'VarChar', max_length: 100 },
        { name: 'content', data_type: 'VarChar', max_length: 5000 },
        { name: 'embedding', data_type: 'FloatVector', dim: embeddingDimension },
        { name: 'metadata', data_type: 'JSON' }
      ]
    });

    // Create index
    await client.createIndex({
      collection_name: collectionName,
      field_name: 'embedding',
      index_type: 'IVF_FLAT',
      metric_type: 'L2',
      params: { nlist: 1024 }
    });

    // Load collection
    await client.loadCollection({ collection_name: collectionName });
    console.log('✅ Collection created, indexed, and loaded!');
    console.log('You can now regenerate embeddings for your courses.');
  } catch (error) {
    console.error('❌ Error resetting Zilliz collection:', error);
  }
}

resetZillizCollection(); 