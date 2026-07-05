require('dotenv').config({ path: '../backend/.env' });
const { extractIntent } = require('../backend/services/groq');

const prompts = [
  "late night drive, melancholic but calm",
  "focused but restless, coding at midnight",
  "sunday morning, slow and warm",
  "pre-workout, high energy, aggressive",
  "heartbroken but trying to be okay"
];

const runTests = async () => {
  console.log('Starting Groq Intent Extraction Tests...\n');
  
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.error('❌ Missing GROQ_API_KEY. Please update phase3/backend/.env');
    process.exit(1);
  }

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[Prompt ${i + 1}]: "${prompt}"`);
    
    try {
      const start = Date.now();
      const result = await extractIntent(prompt);
      const time = Date.now() - start;
      
      console.log(`⏱️  Time: ${time}ms`);
      console.log(`✅ Success! Extracted JSON:`);
      console.log(JSON.stringify(result, null, 2));
      
      // Basic assertions
      if (!result.mood || typeof result.energy !== 'number' || !Array.isArray(result.genres)) {
        console.error('❌ Validation Failed: Missing required fields in JSON.');
      }
      
    } catch (error) {
      console.error(`❌ Test failed for prompt ${i + 1}:`, error.message);
    }
    
    console.log('-'.repeat(50));
    
    // Slight delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Tests finished.');
};

runTests();
