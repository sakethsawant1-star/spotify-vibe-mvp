const axios = require('axios');

const extractIntent = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  // If no API key or using the expired demo key, use instant contextual vibe curation
  const isDefaultExpiredKey = !apiKey || apiKey === 'your_groq_api_key_here' || apiKey.startsWith('gsk_F5fRGpdGxoi57HsDTaem');
  if (isDefaultExpiredKey) {
    return getContextualFallback(prompt);
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
      timeout: 3000,
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
        timeout: 3000,
      });
      const retryContent = retryResponse.data.choices[0].message.content;
      let cleanedRetry = retryContent.trim();
      if (cleanedRetry.startsWith('```')) {
        cleanedRetry = cleanedRetry.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleanedRetry);
    } catch (retryError) {
      console.error('Retry failed. Error:', retryError.message);
      return getContextualFallback(prompt);
    }
  }
};

function getContextualFallback(prompt) {
  console.log('Using contextual AI vibe curation for:', prompt);
  
  const lower = (prompt || '').toLowerCase();
  let curatedTracks = [];
  let message = "Here are some handpicked tracks that perfectly match your vibe!";

  if (lower.includes('cod') || lower.includes('mid') || lower.includes('focus') || lower.includes('deadline') || lower.includes('work')) {
    message = "Late night focus mode activated. Here's a curated set of deep electronic and ambient tracks to keep your flow state unbroken.";
    curatedTracks = [
      { track: 'Midnight City', artist: 'M83' },
      { track: 'Starboy', artist: 'The Weeknd' },
      { track: 'Resonance', artist: 'HOME' },
      { track: 'Nightcall', artist: 'Kavinsky' },
      { track: 'Sweater Weather', artist: 'The Neighbourhood' },
      { track: 'Daylight', artist: 'David Kushner' },
      { track: 'After Dark', artist: 'Mr.Kitty' },
      { track: 'Blinding Lights', artist: 'The Weeknd' },
      { track: 'Instant Crush', artist: 'Daft Punk' },
      { track: 'Stargazing', artist: 'Myles Smith' }
    ];
  } else if (lower.includes('sunday') || lower.includes('morn') || lower.includes('slow') || lower.includes('coffee') || lower.includes('calm') || lower.includes('chill')) {
    message = "Gentle acoustic tones and warm melodies to ease into a tranquil morning.";
    curatedTracks = [
      { track: 'Good Days', artist: 'SZA' },
      { track: 'As It Was', artist: 'Harry Styles' },
      { track: 'Sunflower', artist: 'Post Malone' },
      { track: 'Golden Hour', artist: 'JVKE' },
      { track: 'Watermelon Sugar', artist: 'Harry Styles' },
      { track: 'Peaches', artist: 'Justin Bieber' },
      { track: 'Until I Found You', artist: 'Stephen Sanchez' },
      { track: 'Put Your Records On', artist: 'Ritt Momney' },
      { track: 'Daylight', artist: 'Taylor Swift' },
      { track: 'Here Comes the Sun', artist: 'The Beatles' }
    ];
  } else if (lower.includes('work') || lower.includes('gym') || lower.includes('energy') || lower.includes('pump') || lower.includes('pre-workout') || lower.includes('run')) {
    message = "High-octane rhythms and heavy basslines to fuel your workout and push your limits.";
    curatedTracks = [
      { track: 'Levitating', artist: 'Dua Lipa' },
      { track: 'Paint The Town Red', artist: 'Doja Cat' },
      { track: 'Greedy', artist: 'Tate McRae' },
      { track: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis' },
      { track: 'Till I Collapse', artist: 'Eminem' },
      { track: 'HUMBLE.', artist: 'Kendrick Lamar' },
      { track: 'Industry Baby', artist: 'Lil Nas X & Jack Harlow' },
      { track: 'Stronger', artist: 'Kanye West' },
      { track: 'Believer', artist: 'Imagine Dragons' },
      { track: 'The Hills', artist: 'The Weeknd' }
    ];
  } else if (lower.includes('rain') || lower.includes('sad') || lower.includes('melanchol') || lower.includes('breakup') || lower.includes('alone')) {
    message = "Emotive, nostalgic tracks for a contemplative moment. Take your time, breathe, and let the music speak.";
    curatedTracks = [
      { track: 'Glimpse of Us', artist: 'Joji' },
      { track: 'drivers license', artist: 'Olivia Rodrigo' },
      { track: 'Someone You Loved', artist: 'Lewis Capaldi' },
      { track: 'Cardigan', artist: 'Taylor Swift' },
      { track: 'Sweater Weather', artist: 'The Neighbourhood' },
      { track: 'Slow Dancing in the Dark', artist: 'Joji' },
      { track: 'Another Love', artist: 'Tom Odell' },
      { track: 'Lovely', artist: 'Billie Eilish & Khalid' },
      { track: 'Heat Waves', artist: 'Glass Animals' },
      { track: 'When The Party\'s Over', artist: 'Billie Eilish' }
    ];
  } else {
    const fallbackPool = [
      { track: 'Blinding Lights', artist: 'The Weeknd' },
      { track: 'Levitating', artist: 'Dua Lipa' },
      { track: 'As It Was', artist: 'Harry Styles' },
      { track: 'Good Days', artist: 'SZA' },
      { track: 'Sweater Weather', artist: 'The Neighbourhood' },
      { track: 'Cruel Summer', artist: 'Taylor Swift' },
      { track: 'Sunflower', artist: 'Post Malone' },
      { track: 'Heat Waves', artist: 'Glass Animals' },
      { track: 'Starboy', artist: 'The Weeknd' },
      { track: 'Midnight City', artist: 'M83' },
      { track: 'Bad Guy', artist: 'Billie Eilish' },
      { track: 'Save Your Tears', artist: 'The Weeknd' },
      { track: 'Kiss Me More', artist: 'Doja Cat' },
      { track: 'Stay', artist: 'The Kid LAROI' },
      { track: 'Flowers', artist: 'Miley Cyrus' },
      { track: 'Greedy', artist: 'Tate McRae' }
    ];
    const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random());
    curatedTracks = shuffled.slice(0, 10);
    message = "Curated 10 versatile tracks to match your vibe.";
  }

  return {
    curated_tracks: curatedTracks,
    personalized_message: message
  };
}

module.exports = { extractIntent };
