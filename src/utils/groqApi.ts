
import { SlangResult } from '../context/SlangContext';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function fetchSlangDetails(slangTerm: string): Promise<SlangResult> {
  try {
    const prompt = `Provide detailed information for the slang word: "${slangTerm}". 
    1. Definition: Explain its standard English and slang meanings.
    2. Synonyms: List similar slang words.
    3. Antonyms: List opposite slang words.
    4. Usage in a Sentence: Generate a sentence using the slang naturally.
    5. Origin: Explain where this slang word came from.
    6. Slang Suggestions: Suggest other slang words related to it.
    
    Format the response as a JSON object with the following keys: definition, synonyms (array), antonyms (array), usage, origin, suggestions (array).`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch slang details');
    }

    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      // Sometimes the API might return the JSON with additional markdown formatting
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```([\s\S]*?)```/) ||
                         [null, content];
      
      const jsonContent = jsonMatch[1] || content;
      const parsedResult = JSON.parse(jsonContent.trim());
      
      return {
        definition: parsedResult.definition,
        synonyms: parsedResult.synonyms || [],
        antonyms: parsedResult.antonyms || [],
        usage: parsedResult.usage,
        origin: parsedResult.origin,
        suggestions: parsedResult.suggestions || []
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      
      // Fallback: Try to extract information using regex if JSON parsing fails
      return {
        definition: extractContent(content, 'Definition'),
        synonyms: extractListContent(content, 'Synonyms'),
        antonyms: extractListContent(content, 'Antonyms'),
        usage: extractContent(content, 'Usage'),
        origin: extractContent(content, 'Origin'),
        suggestions: extractListContent(content, 'Suggestions')
      };
    }
  } catch (error) {
    console.error('Error fetching slang details:', error);
    throw error;
  }
}

// Helper function to extract content sections from text
function extractContent(text: string, section: string): string {
  const regex = new RegExp(`${section}:(.+?)(?=\\n\\d\\.\\s|$)`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

// Helper function to extract list content
function extractListContent(text: string, section: string): string[] {
  const content = extractContent(text, section);
  if (!content) return [];
  
  // Split by commas, or bullet points
  return content
    .split(/[,•]/)
    .map(item => item.trim())
    .filter(Boolean);
}
