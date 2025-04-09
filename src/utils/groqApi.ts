
import { SlangResult } from '../context/SlangContext';

// Using Groq API as requested
let groqApiKey = ''; // Will be set by the user through UI

export function setApiKey(key: string) {
  groqApiKey = key;
  // Store in localStorage for convenience
  localStorage.setItem('groq_api_key', key);
}

export function getApiKey() {
  if (!groqApiKey) {
    // Try to get from localStorage
    groqApiKey = localStorage.getItem('groq_api_key') || '';
  }
  return groqApiKey;
}

export async function fetchSlangDetails(slangTerm: string): Promise<SlangResult> {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('API key not provided');
    }

    const prompt = `Provide detailed information for the slang word: "${slangTerm}". 
    1. Definition: Explain its standard English and slang meanings.
    2. Synonyms: List similar slang words.
    3. Antonyms: List opposite slang words.
    4. Usage in a Sentence: Generate a sentence using the slang naturally.
    5. Origin: Explain where this slang word came from.
    6. Slang Suggestions: Suggest other slang words related to it.
    
    Response must be a valid JSON object with keys: definition (string), synonyms (array), antonyms (array), usage (string), origin (string), suggestions (array).`;

    console.log('Fetching slang details with Groq API');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates slang information. Always respond in valid, properly formatted JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch slang details');
    }

    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0].message.content;
    console.log("API Response:", content);
    
    // Try to parse the JSON response
    try {
      // Extract JSON from various potential formats
      const jsonRegexPatterns = [
        /```json\n([\s\S]*?)\n```/, // JSON in code block with json tag
        /```([\s\S]*?)```/,         // JSON in any code block
        /{[\s\S]*?}/                // Raw JSON object
      ];
      
      let jsonContent = content;
      for (const pattern of jsonRegexPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          break;
        }
      }
      
      // Clean up the content before parsing
      jsonContent = jsonContent.replace(/(\w+):/g, '"$1":'); // Add quotes to keys
      jsonContent = jsonContent.replace(/'/g, '"');          // Replace single quotes with double quotes
      
      // Try parsing the cleaned JSON
      let parsedResult;
      try {
        parsedResult = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("First parsing attempt failed:", parseError);
        // If parsing failed, try to extract the JSON part directly
        const jsonMatch = content.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          const directJson = jsonMatch[0].replace(/(\w+):/g, '"$1":').replace(/'/g, '"');
          parsedResult = JSON.parse(directJson);
        } else {
          throw parseError;
        }
      }
      
      // Handle potential nested objects in definition
      let definition = parsedResult.definition;
      if (typeof definition === 'object') {
        definition = Object.entries(definition)
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          .join('\n\n');
      }
      
      return {
        definition: definition || extractContent(content, 'Definition'),
        synonyms: parsedResult.synonyms || extractListContent(content, 'Synonyms'),
        antonyms: parsedResult.antonyms || extractListContent(content, 'Antonyms'),
        usage: parsedResult.usage || extractContent(content, 'Usage'),
        origin: parsedResult.origin || extractContent(content, 'Origin'),
        suggestions: parsedResult.suggestions || extractListContent(content, 'Suggestions')
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      
      // Fallback: Extract information using regex
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
