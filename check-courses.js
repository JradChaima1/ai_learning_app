require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkCourses() {
  const prisma = new PrismaClient();
  
  try {
    const courses = await prisma.course.findMany();
    console.log('Total courses:', courses.length);
    
    if (courses.length === 0) {
      console.log('❌ No courses found in database');
      console.log('💡 Create a course first to test semantic search');
    } else {
      console.log('\n📚 Existing courses:');
      courses.forEach(course => {
        console.log(`- ${course.title} (ID: ${course.id})`);
        console.log(`  Description: ${course.description?.substring(0, 100)}...`);
        console.log(`  Created: ${course.createdAt}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error checking courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses(); 