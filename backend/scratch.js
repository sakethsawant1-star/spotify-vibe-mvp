require('dotenv').config();
const axios = require('axios');

async function test() {
  const apiKey = process.env.GROQ_API_KEY;
  const requestBody = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: `You are a Vibe Curator AI. Extract structured listening intent from the user's vibe description and perfectly curate exactly 10 official studio tracks that fit the mood.
Return ONLY valid JSON with no explanation, no markdown, no preamble:
{
  "curated_tracks": [
    { "track": "Song Title", "artist": "Artist Name" }
  ],
  "personalized_message": "A short, empathetic, conversational response directly addressing the user's vibe (e.g. 'Don't worry, you deserve more.' for a breakup vibe)"
}
The array MUST contain exactly 10 high-quality, real songs. 
If the prompt is vague, default to popular chill pop tracks and a generic friendly message.
Always return valid JSON only.` },
      { role: 'user', content: "a rainy day, melancholic but warm" },
    ],
    temperature: 0.2,
  };

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const content = response.data.choices[0].message.content;
    console.log("RAW CONTENT:\n" + content);
    console.log("----");
    try {
      JSON.parse(content);
      console.log("JSON Parse: SUCCESS");
    } catch(e) {
      console.log("JSON Parse: FAILED - " + e.message);
    }
  } catch (error) {
    console.log("API Error:", error.response ? error.response.data : error.message);
  }
}
test();
