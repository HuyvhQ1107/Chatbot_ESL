import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from '@google/generative-ai';
import { config } from '../config/env';
import { IScenario } from '../models/Scenario';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 2000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit =
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('quota');

      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.log(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  return fn();
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  private buildSystemPrompt(scenario: IScenario, userLevel: string): string {
    return `You are an AI English tutor helping ESL (English as a Second Language) learners practice conversation.

SCENARIO ROLE:
You are playing the role of: ${scenario.role.name}
Personality: ${scenario.role.personality}
Accent: ${scenario.role.accent}
Speaking Style: ${scenario.role.speakingStyle}

SCENARIO CONTEXT:
${scenario.description}

KEY VOCABULARY for this scenario (use these naturally):
${scenario.vocabulary.map(v => `- ${v.word} (${v.phonetic}) - ${v.meaningVietnamese}`).join('\n')}

GRAMMAR POINTS to gently correct if errors occur:
${scenario.grammarPoints.join(', ')}

USER LEVEL: ${userLevel}

TUTORING GUIDELINES:
1. Stay fully in character as the scenario role.
2. Use vocabulary and grammar appropriate for the user's level.
3. When the user makes language errors:
   - Minor errors (typos, articles): Model correct usage naturally in your next response.
   - Moderate errors (wrong verb tense, word choice): Gently provide a subtle correction.
   - Major errors (completely unclear): Offer a clear but kind correction with explanation.
4. Encourage fluency first, accuracy second.
5. Keep the conversation flowing with follow-up questions.
6. Provide vocabulary hints or sentence starters when the user seems stuck (ZPD scaffolding).
7. Keep responses natural and conversational, 2-4 sentences normally.
8. If the user is silent or hesitant, offer a sentence starter as scaffolding.
9. Celebrate small improvements and be encouraging.
10. NEVER be discouraging, overly critical, or make the user feel embarrassed.
11. After providing corrections, continue the conversation naturally.
12. When correcting, use this format: "[Correction: original → corrected] Explanation." then continue.

IMPORTANT: Respond ONLY as the AI tutor. Do not break character. Keep responses conversational and helpful.`;
  }

  async generateResponse(
    scenario: IScenario,
    userLevel: string,
    conversationHistory: ConversationMessage[],
    userMessage?: string
  ): Promise<string> {
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const systemPrompt = this.buildSystemPrompt(scenario, userLevel);

    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    if (userMessage) {
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    try {
      const result = await withRetry<GenerateContentResult>(async () => {
        return await this.model.generateContent({
          contents,
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }],
          },
          safetySettings,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        });
      });

      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API error:', error?.message || error);
      throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
    }
  }

  async generateInitialPrompt(scenario: IScenario): Promise<string> {
    const prompt = scenario.prompts[0];
    if (prompt) {
      return prompt.text;
    }

    const levelContext: Record<string, string> = {
      beginner: 'Use very simple words and short sentences.',
      elementary: 'Use simple present tense, basic vocabulary.',
      'pre-intermediate': 'Use common vocabulary, simple compound sentences.',
      intermediate: 'Use varied vocabulary, complex sentences appropriately.',
      'upper-intermediate': 'Use sophisticated vocabulary, nuanced expressions.',
      advanced: 'Use idiomatic language, complex discussions.',
    };

    const systemPrompt = `You are ${scenario.role.name} in a ${scenario.title} scenario.
Personality: ${scenario.role.personality}
Generate ONE natural opening line for starting a conversation with an ESL learner at ${scenario.level} level.
${levelContext[scenario.level] || ''}
The context: ${scenario.description}
Keep it to ONE sentence, warm and welcoming.`;

    try {
      const result = await withRetry<GenerateContentResult>(async () => {
        return await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
        });
      });
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini initial prompt error:', error);
      return `Hello! Welcome to ${scenario.title}. How can I help you today?`;
    }
  }

  async analyzeLanguage(
    userText: string,
    expectedPhrases: string[],
    vocabulary: { word: string; meaningVietnamese: string }[]
  ): Promise<{
    errors: { type: string; original: string; correction: string; explanation: string }[];
    vocabularyUsed: string[];
    suggestions: string[];
  }> {
    const analysisPrompt = `Analyze the following English text from an ESL learner.
Text: "${userText}"

Expected vocabulary (if relevant): ${vocabulary.map(v => `${v.word} (${v.meaningVietnamese})`).join(', ')}

Identify:
1. Grammar errors (tense, articles, prepositions, word order, etc.)
2. Vocabulary usage (correct/incorrect word choice)
3. Suggestions for improvement

Respond in JSON format:
{
  "errors": [{"type": "grammar/vocab", "original": "...", "correction": "...", "explanation": "..."}],
  "vocabularyUsed": ["word1", "word2"],
  "suggestions": ["Try using...", "Consider..."]
}`;

    try {
      const result = await withRetry<GenerateContentResult>(async () => {
        return await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        });
      });

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { errors: [], vocabularyUsed: [], suggestions: [] };
    } catch (error) {
      console.error('Language analysis error:', error);
      return { errors: [], vocabularyUsed: [], suggestions: [] };
    }
  }
}

export const geminiService = new GeminiService();
