import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../lib/logger';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callClaude(systemPrompt: string, userMessage: string, maxRetries = 3): Promise<string> {
  const delays = [2000, 4000, 8000, 16000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      return (response.content[0] as { text: string }).text;
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      if (error.status === 429 || error.status >= 500) {
        await new Promise(r => setTimeout(r, delays[attempt]));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

export async function generateEntryReflection(content: string, moodScore: number): Promise<string> {
  const system = `You are a compassionate therapist. Provide a warm, non-judgmental reflection on this journal entry. Acknowledge the emotions expressed, identify any notable cognitive patterns if present, and offer one gentle reframe or CBT insight. Keep it under 150 words. Write in second person (you/your).`;
  const user = `Mood score: ${moodScore}/10\n\nJournal entry:\n${content}`;
  try {
    return await callClaude(system, user);
  } catch (error) {
    logger.error({ error }, 'Failed to generate entry reflection');
    return 'Thank you for sharing your thoughts today. Take a moment to sit with what you\'ve written — your willingness to reflect is itself an act of self-care.';
  }
}

export async function generateDailyPrompt(): Promise<string> {
  const system = `Generate one thoughtful, open-ended journaling prompt for someone practicing mindfulness and self-reflection. Keep it warm, specific, and around 1-2 sentences. Do not include quotation marks or labels — just the prompt itself.`;
  const user = `Today's date: ${new Date().toDateString()}. Generate a fresh, meaningful journaling prompt.`;
  try {
    return await callClaude(system, user);
  } catch (error) {
    logger.error({ error }, 'Failed to generate daily prompt');
    return 'What is one small moment from today that you want to remember, and why does it matter to you?';
  }
}

export async function generateWeeklySummary(
  entries: Array<{ content: string; moodScore: number; createdAt: Date }>,
  moodLogs: Array<{ score: number; loggedAt: Date }>
): Promise<string> {
  const avgMood = moodLogs.length
    ? (moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length).toFixed(1)
    : 'not logged';

  const entrySummary = entries
    .map(e => `[Mood ${e.moodScore}/10] ${e.content.slice(0, 200)}`)
    .join('\n\n');

  const system = `You are a gentle wellness coach. Summarize this week's journaling and mood trends. Highlight what went well, identify one pattern to be aware of, and suggest one small actionable step for next week. Keep it under 200 words. Write in second person (you/your). Be warm and encouraging.`;
  const user = `Average mood this week: ${avgMood}/10\n\nJournal entries:\n${entrySummary}`;
  try {
    return await callClaude(system, user);
  } catch (error) {
    logger.error({ error }, 'Failed to generate weekly summary');
    return 'You showed up for yourself this week by journaling — that takes courage and commitment. Keep going.';
  }
}

export async function recommendExercise(
  avgMood: number,
  recentTags: string[]
): Promise<{ category: string; reason: string }> {
  const system = `Based on mood trends and journal themes, recommend the most suitable CBT exercise category. Return ONLY valid JSON with two fields: "category" (one of: THOUGHT_RECORD, GRATITUDE, BREATHING, GROUNDING, COGNITIVE_RESTRUCTURING, BEHAVIORAL_ACTIVATION) and "reason" (one sentence explaining why).`;
  const user = `7-day average mood: ${avgMood.toFixed(1)}/10\nRecent journal themes/tags: ${recentTags.join(', ') || 'general reflection'}`;
  try {
    const text = await callClaude(system, user);
    return JSON.parse(text);
  } catch {
    return { category: 'GRATITUDE', reason: 'Gratitude practices are universally helpful for improving mood and perspective.' };
  }
}
