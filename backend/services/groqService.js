const axios = require('axios');

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const getApiKey = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('GROQ_API_KEY environment variable is not defined');
  }
  return key;
};

const getModel = () => {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
};

console.log('Groq initialized');
console.log(`  Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);

/**
 * Generate a structured summary of the crawled website contents
 */
async function generateWebsiteSummary(websiteName, pageTexts) {
  console.log('Generating website summary...');
  
  const sampleText = pageTexts.join('\n\n').slice(0, 10000);

  const prompt = `
You are an expert content analyzer. Read this text content extracted from the website "${websiteName}".
Generate a structured, professional summary of the website in JSON format.

The output MUST be a JSON object containing exactly these fields:
1. "executiveSummary": string. A 3-4 sentence high-level summary of what the website is about and its purpose.
2. "mainTopics": array of strings. 3-5 main topics covered on the website.
3. "keyServices": array of strings. 3-5 key services or products mentioned on the website.
4. "importantInfo": array of strings. 3-5 important pieces of information (like location, hours, contact info, call to action).
5. "technologies": array of strings. Technologies, frameworks, or platforms mentioned on the website.
6. "keywords": array of strings. 5-10 SEO keywords relevant to the website.
7. "category": string. The industry or category of the website.
8. "contactInfo": array of strings. Extracted contact information (email, phone, address).
9. "socialLinks": array of strings. Any social media links or handles found.
10. "aiConfidenceScore": number (0-100). How confident you are in the extracted information.

Format the output strictly as a JSON object. Do not include markdown code block formatting (like \`\`\`json) in your response, just return raw JSON text.

Content:
${sampleText}
`;

  try {
    const apiKey = getApiKey();
    const model = getModel();
    const endpoint = `${GROQ_BASE_URL}/chat/completions`;

    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('API request success (generateWebsiteSummary)');

    let text = response.data.choices[0].message.content.trim();
    
    // Clean up code blocks if the model included them
    if (text.startsWith('```json')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    return JSON.parse(text);
  } catch (error) {
    console.error(`Error generating website summary: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Body:   ${JSON.stringify(error.response.data)}`);
    }
    // Return structured default summary if generation fails
    return {
      executiveSummary: `This website covers topics related to ${websiteName}. Detailed information was extracted from its pages.`,
      mainTopics: ['Website Overview', 'General Services'],
      keyServices: ['Information Retrieval'],
      importantInfo: ['No contact details extracted'],
      technologies: [],
      keywords: ['general'],
      category: 'Uncategorized',
      contactInfo: [],
      socialLinks: [],
      aiConfidenceScore: 0
    };
  }
}

/**
 * Generate grounded answer using retrieved contexts
 */
async function generateAnswer(query, contextChunks) {
  console.log('Generating answer...');
  
  const contextText = contextChunks.map((c, i) => `[Source ${i+1}]: ${c.sourceUrl}\nContent:\n${c.text}`).join('\n\n---\n\n');

  const prompt = `
You are an expert AI Assistant representing the content of the website. Your task is to answer the user's question truthfully, using ONLY the retrieved context below.

Rules:
1. Base your answer strictly on the provided context. If the answer cannot be found or inferred from the context, say: "I'm sorry, but I couldn't find that specific information in the website's content."
2. Do not use outside knowledge or hallucinate features.
3. Format your response beautifully using clean markdown, spacing, bold text, and bullet points where helpful.

Context:
---
${contextText}
---

User Question: ${query}
`;

  try {
    const apiKey = getApiKey();
    const model = getModel();
    const endpoint = `${GROQ_BASE_URL}/chat/completions`;

    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('API request success (generateAnswer)');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating RAG answer: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Body:   ${JSON.stringify(error.response.data)}`);
    }
    let userMsg = error.message;
    if (error.response) {
      const apiMsg = error.response.data?.error?.message || error.response.data?.message || '';
      userMsg = `Groq API Error (${error.response.status}): ${apiMsg}`;
    }
    return `I apologize, but I encountered an error while formulating my answer: ${userMsg}`;
  }
}

/**
 * Generate grounded answer as stream
 */
async function generateAnswerStream(query, contextChunks, onChunkCallback) {
  console.log('Streaming started...');
  
  const contextText = contextChunks.map((c, i) => `[Source ${i+1}]: ${c.sourceUrl}\nContent:\n${c.text}`).join('\n\n---\n\n');

  const prompt = `
You are an expert AI Assistant representing the content of the website. Your task is to answer the user's question truthfully, using ONLY the retrieved context below.

Rules:
1. Base your answer strictly on the provided context. If the answer cannot be found or inferred from the context, say: "I'm sorry, but I couldn't find that specific information in the website's content."
2. Do not use outside knowledge or hallucinate.
3. Format your response beautifully using clean markdown, spacing, bold text, and bullet points where helpful.

Context:
---
${contextText}
---

User Question: ${query}
`;

  let fallbackRequired = false;

  try {
    const apiKey = getApiKey();
    const model = getModel();
    const endpoint = `${GROQ_BASE_URL}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        stream: true
      }),
      signal: AbortSignal.timeout(60000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq streaming error - Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line === 'data: [DONE]') {
          console.log('Streaming finished.');
          return;
        }
        
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
              onChunkCallback(data.choices[0].delta.content);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
    
    console.log('Streaming finished.');
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn('Streaming timed out, falling back to non-streaming...');
      fallbackRequired = true;
    } else {
      console.error(`Streaming error: ${error.message}`);
      onChunkCallback(`I apologize, but I encountered an error while streaming my response: ${error.message}`);
    }
  }

  // Fallback to non-streaming response if streaming failed
  if (fallbackRequired) {
    try {
       const text = await generateAnswer(query, contextChunks);
       onChunkCallback(text);
       console.log('Streaming finished. (Fallback)');
    } catch (e) {
       onChunkCallback(`I apologize, but I encountered an error (fallback): ${e.message}`);
    }
  }
}

/**
 * Generate full structured documentation for a website
 */
async function generateFullDocumentation(websiteName, pageTexts, existingSummary) {
  console.log('Generating full website documentation...');
  
  const sampleText = pageTexts.join('\n\n').slice(0, 15000); // Send up to 15k chars
  const summaryContext = existingSummary ? JSON.stringify(existingSummary, null, 2) : 'None';

  const prompt = `
You are an expert technical writer and content analyzer. Read this text content extracted from the website "${websiteName}".
Also, here is an initial summary previously generated: ${summaryContext}

Generate a comprehensive, structured documentation of the website in JSON format.
The output MUST be a JSON object containing exactly these fields:

1. "executiveSummary": string. High-level summary of the website (can reuse or expand from initial summary).
2. "websiteOverview": string. A detailed 2-3 paragraph overview of the website's purpose, audience, and value proposition.
3. "mainTopics": array of strings. Main topics covered.
4. "keyServices": array of strings. Key services or products offered.
5. "technologies": array of strings. Technologies or platforms mentioned.
6. "importantPages": array of objects with { "title": string, "url": string, "description": string }. Try to infer the most important pages or sections of the site.
7. "contactInfo": array of strings. Extracted contact information.
8. "faq": array of objects with { "question": string, "answer": string }. Generate 5-8 frequently asked questions and answers based entirely on the content.
9. "keywords": array of strings. SEO keywords relevant to the website.
10. "aiInsights": array of strings. 3-5 analytical insights or unique observations about the website's content, structure, or tone.

Format the output strictly as a JSON object. Do not include markdown code block formatting (like \`\`\`json) in your response, just return raw JSON text.

Content:
${sampleText}
`;

  try {
    const apiKey = getApiKey();
    const model = getModel();
    const endpoint = `${GROQ_BASE_URL}/chat/completions`;

    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000 // Documentation takes longer
      }
    );

    console.log('API request success (generateFullDocumentation)');

    let text = response.data.choices[0].message.content.trim();
    if (text.startsWith('```json')) text = text.substring(7);
    else if (text.startsWith('```')) text = text.substring(3);
    if (text.endsWith('```')) text = text.substring(0, text.length - 3);
    text = text.trim();

    return JSON.parse(text);
  } catch (error) {
    console.error(`Error generating full documentation: ${error.message}`);
    // Return empty/safe default structure
    return {
      executiveSummary: existingSummary?.executiveSummary || '',
      websiteOverview: 'Could not generate detailed overview.',
      mainTopics: existingSummary?.mainTopics || [],
      keyServices: existingSummary?.keyServices || [],
      technologies: existingSummary?.technologies || [],
      importantPages: [],
      contactInfo: existingSummary?.contactInfo || [],
      faq: [],
      keywords: existingSummary?.keywords || [],
      aiInsights: ['Documentation generation failed or timed out.']
    };
  }
}

module.exports = {
  generateWebsiteSummary,
  generateAnswer,
  generateAnswerStream,
  generateFullDocumentation
};
