// Check environment variables for API keys
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables...\n');

const envVars = {
  'HUGGINGFACE_API_KEY': process.env.HUGGINGFACE_API_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'COHERE_API_KEY': process.env.COHERE_API_KEY,
  'NOVITA_API_KEY': process.env.NOVITA_API_KEY,
  'DATABASE_URL': process.env.DATABASE_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL
};

console.log('📋 Environment Variables Status:');
console.log('================================');

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    if (key.includes('KEY') || key.includes('SECRET')) {
      console.log(`✅ ${key}: ${value.substring(0, 10)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`✅ ${key}: ${value.substring(0, 50)}...`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
}

console.log('\n🔧 Hugging Face API Key Issues:');
console.log('================================');

if (!process.env.HUGGINGFACE_API_KEY) {
  console.log('❌ HUGGINGFACE_API_KEY is not set in your .env.local file');
  console.log('💡 To get a free Hugging Face API key:');
  console.log('   1. Go to https://huggingface.co/');
  console.log('   2. Sign up for a free account');
  console.log('   3. Go to Settings → Access Tokens');
  console.log('   4. Create a new token');
  console.log('   5. Add to .env.local:');
  console.log('      HUGGINGFACE_API_KEY=your_token_here');
  console.log('      HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
} else {
  console.log('✅ HUGGINGFACE_API_KEY is set');
  console.log('   If you\'re still getting 401 errors, your token might be invalid or expired');
  console.log('   Check your token at: https://huggingface.co/settings/tokens');
}

console.log('\n🚀 Alternative Solutions:');
console.log('========================');
console.log('1. Use OpenAI embeddings (if you have OPENAI_API_KEY):');
console.log('   - Update your search to use OpenAI instead of Hugging Face');
console.log('2. Use simple text search (no API key needed):');
console.log('   - The app already has a fallback text search feature');
console.log('3. Get a free Hugging Face token:');
console.log('   - Visit https://huggingface.co/settings/tokens');
console.log('   - Create a new token (free tier available)');

console.log('\n🔧 Novita AI API Key Issues:');
console.log('================================');

if (!process.env.NOVITA_API_KEY) {
  console.log('❌ NOVITA_API_KEY is not set in your .env.local file');
  console.log('💡 To get a Novita AI API key:');
  console.log('   1. Go to https://novita.ai/');
  console.log('   2. Sign up for an account');
  console.log('   3. Get your API key from the dashboard');
  console.log('   4. Add to .env.local:');
  console.log('      NOVITA_API_KEY=your_novita_api_key_here');
} else {
  console.log('✅ NOVITA_API_KEY is set (BGE-M3 embeddings available)');
} 