import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface VocabularySuggestion {
  word: string;
  alternative: string;
  reason: string;
}

export interface FeedbackResult {
  correctedText: string | null;
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabularySuggestion[];
  pronunciationScore: number | null;
  overallFeedback: string | null;
  rawAiResponse: string;
}

const FEEDBACK_SCHEMA = `{
  "correctedText": "string | null — the full utterance with corrections applied, or null if no corrections needed",
  "grammarErrors": [
    {
      "original": "string — the incorrect phrase",
      "corrected": "string — the corrected phrase",
      "explanation": "string — brief, learner-friendly explanation",
      "severity": "minor | moderate | major"
    }
  ],
  "vocabularySuggestions": [
    {
      "word": "string — word used",
      "alternative": "string — more natural or precise alternative",
      "reason": "string — why this alternative is better"
    }
  ],
  "pronunciationScore": "number 0-100 — estimated from written cues like capitalization, punctuation, stutters. Use null if no cues present",
  "overallFeedback": "string — 1-2 encouraging sentences summarizing the feedback"
}`;

export async function analyzeSpeech(
  transcript: string,
  targetLanguage: string,
  proficiencyLevel: string,
  recentContext: Array<{ role: 'learner' | 'partner'; text: string }>
): Promise<FeedbackResult> {
  const contextLines = recentContext
    .map((u) => `[${u.role}]: ${u.text}`)
    .join('\n');

  const systemPrompt = `You are a language learning assistant. The learner is at ${proficiencyLevel} level learning ${targetLanguage}.
Analyze their transcribed speech and return feedback as a single JSON object matching the exact schema below. Output ONLY the JSON — no markdown, no prose outside the JSON.

Schema:
${FEEDBACK_SCHEMA}`;

  const userPrompt = `${contextLines ? `Recent conversation context:\n${contextLines}\n\n` : ''}Analyze this utterance from the learner:
"${transcript}"`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawAiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    // Strip any accidental markdown code fences
    const cleaned = rawAiResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as Omit<FeedbackResult, 'rawAiResponse'>;
    return {
      correctedText: parsed.correctedText ?? null,
      grammarErrors: Array.isArray(parsed.grammarErrors) ? parsed.grammarErrors : [],
      vocabularySuggestions: Array.isArray(parsed.vocabularySuggestions)
        ? parsed.vocabularySuggestions
        : [],
      pronunciationScore:
        typeof parsed.pronunciationScore === 'number' ? parsed.pronunciationScore : null,
      overallFeedback: parsed.overallFeedback ?? null,
      rawAiResponse,
    };
  } catch (err) {
    logger.error({ err, rawAiResponse }, 'Failed to parse AI feedback JSON');
    return {
      correctedText: null,
      grammarErrors: [],
      vocabularySuggestions: [],
      pronunciationScore: null,
      overallFeedback: 'Feedback could not be processed at this time.',
      rawAiResponse,
    };
  }
}
