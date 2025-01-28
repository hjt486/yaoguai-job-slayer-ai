import { AI_CONFIG, AI_PROMPTS } from './Constants';
import { storageService } from '../../services/storageService';

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
        content: `${AI_PROMPTS.JOB_MATCH}\n\n**Job Description:**\n${jobDescription}\n\n**Candidate Profile:**\n${JSON.stringify(profile, null, 2)}`
      }
    ];

    const response = await this.sendChatRequest(apiSettings, messages);
    
    try {
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = response.choices[0].message.content;
      let parsedData;

      // First try to parse as pure JSON
      try {
        parsedData = JSON.parse(content);
      } catch (e) {
        // If pure JSON parsing fails, try to extract from markdown
        const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          throw new Error('Could not parse response as JSON');
        }
        parsedData = JSON.parse(jsonMatch[1].trim());
      }

      if (!parsedData.missingKeywords || !Array.isArray(parsedData.missingKeywords)) {
        throw new Error('Invalid response format: missing keywords array not found');
      }

      // Return both missingKeywords and metadata
      return {
        missingKeywords: parsedData.missingKeywords.map(keyword => ({
          keyword,
          rating: 0,
          description: ''
        })),
        metadata: parsedData.metadata || {}
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error, response);
      throw new Error('Failed to parse job match analysis');
    }
  },

  async generateEnhancedProfile(apiSettings, currentProfile, jobDescription, missingKeywords) {
    if (!currentProfile || !jobDescription || !missingKeywords) {
      throw new Error('Current profile, job description, and missing keywords are required');
    }

    console.log('Profile Enhancement Request:', {
      profile: currentProfile.metadata?.profileName || 'Unnamed Profile',
      jobDescription: jobDescription.substring(0, 100) + '...',
      missingKeywordsCount: missingKeywords.length,
      missingKeywords: missingKeywords.map(k => k.keyword)
    });

    const messages = [
      AI_CONFIG.SYSTEM_MESSAGE,
      {
        role: "user",
        content: `${AI_PROMPTS.PROFILE_ENHANCE}

Current Profile:
${JSON.stringify(currentProfile, null, 2)}

Job Description:
${jobDescription}

Missing Keywords (with ratings and descriptions):
${JSON.stringify(missingKeywords, null, 2)}`
      }
    ];

    try {
      const response = await this.sendChatRequest(apiSettings, messages);
      
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = response.choices[0].message.content;
      // Extract JSON from markdown code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const enhancedProfile = JSON.parse(jsonMatch[1]);
      
      console.log('Profile Enhancement Result:', {
        originalName: currentProfile.metadata?.profileName,
        enhancedName: enhancedProfile.metadata?.profileName,
        skillsCount: enhancedProfile.skills?.length || 0,
        addedSkills: enhancedProfile.skills?.filter(
          skill => !currentProfile.skills?.includes(skill)
        ),
        coverLetterLength: enhancedProfile.coverLetter?.length || 0
      });

      // Validate the enhanced profile structure matches DEFAULT_PROFILE_STRUCTURE
      if (!enhancedProfile.metadata || !enhancedProfile.personal) {
        throw new Error('Enhanced profile does not match required structure');
      }

      return enhancedProfile;

    } catch (error) {
      console.error('Failed to parse enhanced profile response:', error);
      throw new Error('Failed to generate enhanced profile');
    }
  }
};