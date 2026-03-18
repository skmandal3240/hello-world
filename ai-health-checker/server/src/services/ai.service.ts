import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../lib/logger';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are HealthCheck AI, a compassionate health information assistant. Your role is to help users understand their symptoms and determine the appropriate level of care.

MANDATORY RULES:
1. You are NOT a doctor and CANNOT diagnose conditions. Always use language like "may suggest", "could indicate", "worth discussing with a doctor".
2. Every response MUST end with this exact disclaimer: "*⚠️ This is not medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.*"
3. Ask ONE clarifying question at a time. Focus on: symptom duration, severity (1–10), exact location, whether it's worsening or improving, associated symptoms, and relevant medical history.
4. After gathering enough information (typically 4–6 exchanges), include a triage recommendation using EXACTLY this format on its own line: TRIAGE: [EMERGENT|URGENT|SEE_DOCTOR|MONITOR|SELF_CARE]
5. If symptoms suggest a medical emergency (chest pain, difficulty breathing, signs of stroke, severe allergic reaction, uncontrolled bleeding), immediately recommend calling 911 and include TRIAGE: EMERGENT.
6. Be warm, empathetic, and clear. Avoid medical jargon.

Triage levels:
- EMERGENT: Life-threatening, call 911 immediately
- URGENT: Needs care within hours (urgent care or ER)
- SEE_DOCTOR: Schedule appointment within days
- MONITOR: Watch at home, see doctor if worsens
- SELF_CARE: Manageable at home with rest/OTC remedies`;

const GREETING_PROMPT = `Generate a warm, welcoming greeting for someone who has come to check their symptoms. Introduce yourself as HealthCheck AI. Ask them what symptoms they're experiencing today. Keep it brief (2-3 sentences). Do NOT include the disclaimer in this greeting — this is just the opening message. Do NOT include any triage recommendation in this greeting.`;

const SUMMARY_SYSTEM = `You are a medical documentation assistant. Create a structured doctor appointment preparation summary based on the symptom conversation provided. Format it clearly with these sections:

**Chief Complaint:** (main symptom in one sentence)
**Symptom Duration:**
**Severity:** (1-10 scale)
**Location/Description:**
**Associated Symptoms:**
**What Makes It Better/Worse:**
**Questions to Ask the Doctor:**
1.
2.
3.

End with: "*⚠️ Remember: This summary is for informational purposes only. Your doctor will make the actual diagnosis and treatment decisions.*"`;

type Message = { role: 'user' | 'assistant'; content: string };

async function callClaude(
  systemPrompt: string,
  messages: Message[],
  maxTokens = 600,
  maxRetries = 3
): Promise<string> {
  const delays = [2000, 4000, 8000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      });
      return (response.content[0] as { text: string }).text;
    } catch (error: unknown) {
      if (attempt === maxRetries) throw error;
      const err = error as { status?: number };
      if (err.status === 429 || (err.status !== undefined && err.status >= 500)) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

export async function generateGreeting(): Promise<string> {
  try {
    return await callClaude(SYSTEM_PROMPT, [{ role: 'user', content: GREETING_PROMPT }], 200);
  } catch (error) {
    logger.error({ error }, 'Failed to generate greeting');
    return "Hello! I'm HealthCheck AI, your health information assistant. I'm here to help you understand your symptoms and determine the appropriate level of care. What symptoms are you experiencing today?";
  }
}

export async function generateResponse(
  priorMessages: Message[],
  userMessage: string
): Promise<string> {
  const messages: Message[] = [
    ...priorMessages,
    { role: 'user', content: userMessage },
  ];
  try {
    return await callClaude(SYSTEM_PROMPT, messages, 600);
  } catch (error) {
    logger.error({ error }, 'Failed to generate AI response');
    return "I apologize, I'm having trouble processing your message. Please try again. *⚠️ This is not medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.*";
  }
}

export async function generateSummary(conversationText: string): Promise<string> {
  try {
    return await callClaude(
      SUMMARY_SYSTEM,
      [{ role: 'user', content: `Please create a doctor appointment preparation summary based on this symptom consultation:\n\n${conversationText}` }],
      800
    );
  } catch (error) {
    logger.error({ error }, 'Failed to generate summary');
    throw new Error('Failed to generate doctor preparation summary');
  }
}

export function extractTriageLevel(text: string): string | null {
  const match = text.match(/TRIAGE:\s*(EMERGENT|URGENT|SEE_DOCTOR|MONITOR|SELF_CARE)/);
  return match ? match[1] : null;
}
