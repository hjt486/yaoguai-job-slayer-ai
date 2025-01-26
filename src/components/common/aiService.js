import { AI_CONFIG, AI_PROMPTS } from './Constants';

export const aiService = {
  async sendChatRequest(apiSettings, messages) {
    const apiEndpoint = apiSettings.apiEndpoint.replace(/\/$/, '');
    
    const requestBody = {
      model: apiSettings.modelName,
      messages,
      temperature: AI_CONFIG.TEMPERATURE,
      max_tokens: AI_CONFIG.MAX_TOKENS
    };

    console.log('AI Request:', {
      endpoint: apiEndpoint,
      model: apiSettings.modelName,
      messages: messages,
      messagesCount: messages.length
    });

    const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiSettings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('AI Response:', data);
    return data;
  },

  async parseResume(apiSettings, resumeContent) {
    const messages = [
      AI_CONFIG.SYSTEM_MESSAGE,
      {
        role: "user",
        content: AI_PROMPTS.RESUME_PARSE + "\n\nHere's the resume content:\n\n" + resumeContent
      }
    ];

    return this.sendChatRequest(apiSettings, messages);
  },

  async analyzeJobMatch(apiSettings, profile, jobDescription) {
    if (!profile || !jobDescription) {
      throw new Error('Profile and job description are required');
    }

    const messages = [
      AI_CONFIG.SYSTEM_MESSAGE,
      {
        role: "user",
        content: `${AI_PROMPTS.JOB_MATCH}\n\nJob Description:\n${jobDescription}\n\nCandidate Profile:\n${JSON.stringify(profile, null, 2)}`
      }
    ];

    const response = await this.sendChatRequest(apiSettings, messages);
    
    try {
      // Check if response has the expected structure
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = response.choices[0].message.content;
      const parsedData = JSON.parse(content);

      if (!parsedData.missingKeywords || !Array.isArray(parsedData.missingKeywords)) {
        throw new Error('Invalid response format');
      }

      // Transform the array of strings into array of objects
      return {
        missingKeywords: parsedData.missingKeywords.map(keyword => ({
          keyword,
          rating: 0,
          description: ''
        }))
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error, response);
      throw new Error('Failed to parse job match analysis');
    }
  }
};