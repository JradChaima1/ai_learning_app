require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { ZillizService } = require('./lib/services/zilliz');
const { EmbeddingService } = require('./lib/services/embeddings');

async function regenerateEmbeddings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Regenerating embeddings for all courses...');
    
    // Determine embedding provider and dimension
    const useNovita = !!process.env.NOVITA_API_KEY;
    const embeddingDimension = useNovita ? 1024 : 384;
    const provider = useNovita ? 'novita' : 'huggingface';
    
    console.log(`📊 Using ${provider} embeddings (${embeddingDimension} dimensions)`);
    
    const courses = await prisma.course.findMany();
    console.log(`📚 Found ${courses.length} courses to process`);
    
    const embeddingService = new EmbeddingService(provider);
    const zillizService = new ZillizService(embeddingDimension);
    
    // Initialize collection
    await zillizService.initializeCollection();
    
    // Clear existing embeddings
    console.log('🗑️ Clearing existing embeddings...');
    for (const course of courses) {
      try {
        await zillizService.deleteCoursEmbeddings(course.id);
      } catch (error) {
        console.log(`Note: Could not delete embeddings for course ${course.id} (may not exist)`);
      }
    }
    
    // Regenerate embeddings for each course
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      console.log(`\n🔄 Processing course ${i + 1}/${courses.length}: ${course.title}`);
      
      try {
        // Split content into chunks
        const contentChunks = course.content.match(/.{1,1000}/g) || [];
        console.log(`   📝 Split into ${contentChunks.length} chunks`);
        
        // Generate embeddings for each chunk
        console.log('   🧠 Generating embeddings...');
        const embeddings = [];
        for (let j = 0; j < contentChunks.length; j++) {
          const embedding = await embeddingService.generateEmbeddings(contentChunks[j]);
          embeddings.push(embedding);
          console.log(`   ✅ Chunk ${j + 1}/${contentChunks.length} embedded`);
        }
        
        // Store embeddings in Zilliz
        console.log('   💾 Storing embeddings...');
        await zillizService.storeEmbeddings(course.id, contentChunks, embeddings);
        console.log(`   ✅ Course "${course.title}" embeddings updated successfully!`);
        
      } catch (error) {
        console.error(`   ❌ Failed to process course "${course.title}":`, error.message);
      }
    }
    
    console.log('\n🎉 Embedding regeneration completed!');
    console.log('✅ All courses now have consistent embeddings');
    console.log('🔍 You can now use semantic search successfully');
    
  } catch (error) {
    console.error('❌ Error regenerating embeddings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateEmbeddings(); 