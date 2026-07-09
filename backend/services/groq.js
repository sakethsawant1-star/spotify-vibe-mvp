const axios = require('axios');

const extractIntent = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API Key is missing. Please add it to your .env file.');
  }

  const systemPrompt = `You are a Vibe Curator AI. Extract structured listening intent from the user's vibe description and perfectly curate exactly 10 official studio tracks that fit the mood.
CRITICAL: ENSURE HIGH VARIETY. DO NOT return the same songs every time, even for the same or similar prompts. Pick a fresh, diverse set of tracks across different artists and eras that still fit the vibe perfectly.
Return ONLY valid JSON with no explanation, no markdown, no preamble:
{
  "curated_tracks": [
    { "track": "Song Title", "artist": "Artist Name" }
  ],
  "personalized_message": "A short, empathetic, conversational response directly addressing the user's vibe (e.g. 'Don't worry, you deserve more.' for a breakup vibe)"
}
The array MUST contain exactly 10 high-quality, real songs. 
If the prompt is vague, default to a diverse mix of popular chill tracks and a generic friendly message.
Always return valid JSON only.`;

  const requestBody = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8, // Increased temp for more varied results
  };

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const content = response.data.choices[0].message.content;
    
    // Strip markdown backticks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleanedContent);
    return parsed;
  } catch (error) {
    console.error('Groq API Error in First Attempt:', error.response ? JSON.stringify(error.response.data) : error.message);
    
    // Fallback/Retry Logic
    console.log('Retrying with a stricter prompt...');
    try {
      requestBody.messages[0].content = systemPrompt + "\nCRITICAL: DO NOT WRAP JSON IN MARKDOWN BLOCK. JUST OUTPUT RAW JSON.";
      const retryResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', requestBody, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      const retryContent = retryResponse.data.choices[0].message.content;
      let cleanedRetry = retryContent.trim();
      if (cleanedRetry.startsWith('```')) {
        cleanedRetry = cleanedRetry.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleanedRetry);
    } catch (retryError) {
      console.error('Retry failed. Error:', retryError.message);
      console.error('Returning safe defaults.');
      return {
        curated_tracks: [
          { track: 'Blinding Lights', artist: 'The Weeknd' },
          { track: 'Levitating', artist: 'Dua Lipa' },
          { track: 'As It Was', artist: 'Harry Styles' },
          { track: 'Good Days', artist: 'SZA' },
          { track: 'Sweater Weather', artist: 'The Neighbourhood' },
          { track: 'Cruel Summer', artist: 'Taylor Swift' },
          { track: 'Sunflower', artist: 'Post Malone' },
          { track: 'Heat Waves', artist: 'Glass Animals' },
          { track: 'Watermelon Sugar', artist: 'Harry Styles' },
          { track: 'Peaches', artist: 'Justin Bieber' }
        ],
        personalized_message: "Here are some chill pop tracks to keep the good vibes going!"
      };
    }
  }
};

module.exports = { extractIntent };
