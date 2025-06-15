// Test database connection
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🔍 Testing Database Connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    console.log('Testing Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful');
    
    // Test if we can query the database
    console.log('Testing database query...');
    const userCount = await prisma.user.count();
    console.log('✅ Database query successful');
    console.log('   Total users in database:', userCount);
    
    // Test course table
    console.log('Testing course table...');
    const courseCount = await prisma.course.count();
    console.log('✅ Course table accessible');
    console.log('   Total courses in database:', courseCount);
    
    // Test if we can create a test query
    console.log('Testing course findMany...');
    const courses = await prisma.course.findMany({
      take: 1,
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    console.log('✅ Course queries working');
    console.log('   Sample course found:', courses.length > 0 ? 'Yes' : 'No');
    
    console.log('\n🎉 Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.log('\n💡 Database Setup:');
      console.log('1. Check your .env.local file has DATABASE_URL');
      console.log('2. Make sure your database is running');
      console.log('3. Try: npx prisma db push');
    }
    
    if (error.message.includes('connection')) {
      console.log('\n💡 Connection Issues:');
      console.log('1. Check if your database server is running');
      console.log('2. Verify DATABASE_URL in .env.local');
      console.log('3. Try: npx prisma db push');
    }
    
    console.log('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase(); 