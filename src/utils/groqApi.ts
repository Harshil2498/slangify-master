
import { SlangResult } from '../context/SlangContext';

// Using Groq API as requested with default key
let groqApiKey = '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'; 

export function setApiKey(key: string) {
  groqApiKey = key;
  // Store in localStorage for convenience
  localStorage.setItem('groq_api_key', key);
}

export function getApiKey() {
  if (!groqApiKey) {
    // Try to get from localStorage
    const storedKey = localStorage.getItem('groq_api_key') || '';
    if (storedKey) {
      groqApiKey = storedKey;
    }
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
    
    Format your response as a proper JSON object with these keys: definition (string), synonyms (array of strings), antonyms (array of strings), usage (string), origin (string), suggestions (array of strings). Do not include any explanations in parentheses in the array values.`;

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
            content: 'You are a helpful assistant that generates slang information. Always respond with properly formatted JSON only. For arrays, only include string values without any explanations in parentheses.'
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
    
    // Extract JSON from the content
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    const jsonBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonContent = jsonBlockMatch[1].trim();
    }
    
    try {
      // Fix the common issues with the JSON before parsing
      // 1. Fix arrays with explanations in parentheses
      jsonContent = jsonContent.replace(/\"([^\"]+)\" \([^\)]+\)/g, '"$1"');
      // 2. Fix entries that might be missing quotes around keys
      jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
      
      const parsedResult = JSON.parse(jsonContent);
      
      // Handle potential nested objects in definition
      let definition = parsedResult.definition;
      if (typeof definition === 'object') {
        definition = Object.entries(definition)
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          .join('\n\n');
      }
      
      return {
        definition: definition || '',
        synonyms: Array.isArray(parsedResult.synonyms) ? parsedResult.synonyms.map((s: any) => typeof s === 'string' ? s.replace(/\([^)]*\)/g, '').trim() : s) : [],
        antonyms: Array.isArray(parsedResult.antonyms) ? parsedResult.antonyms.map((a: any) => typeof a === 'string' ? a.replace(/\([^)]*\)/g, '').trim() : a) : [],
        usage: parsedResult.usage || '',
        origin: parsedResult.origin || '',
        suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions.map((s: any) => typeof s === 'string' ? s.replace(/\([^)]*\)/g, '').trim() : s) : []
      };
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      
      // If JSON parsing fails completely, use regex fallback
      return {
        definition: extractContent(content, 'Definition') || 'No definition available',
        synonyms: extractListContent(content, 'Synonyms'),
        antonyms: extractListContent(content, 'Antonyms'),
        usage: extractContent(content, 'Usage') || 'No usage example available',
        origin: extractContent(content, 'Origin') || 'Origin unknown',
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
    .map(item => item.trim().replace(/\([^)]*\)/g, '').trim()) // Remove explanations in parentheses
    .filter(Boolean);
}
