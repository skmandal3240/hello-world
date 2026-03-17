import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

function parseJson<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    logger.error({ raw }, 'Failed to parse AI JSON response');
    return null;
  }
}

// ── 1. Auto-categorize transactions ──────────────────────────────────────────

export interface CategorizeItem {
  id: string;
  description: string;
}

export interface CategorizeResult {
  id: string;
  categoryId: string;
  confidence: number;
}

export async function categorizeBatch(
  items: CategorizeItem[],
  categories: { id: string; name: string }[]
): Promise<CategorizeResult[]> {
  if (items.length === 0) return [];

  const catList = categories.map((c) => `${c.id}: ${c.name}`).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a personal finance transaction categorizer. Given a list of transaction descriptions and available categories, assign the best category to each transaction.
Return ONLY a JSON array matching exactly: [{"id": "<tx_id>", "categoryId": "<cat_id>", "confidence": 0.0-1.0}]
No prose, no markdown.`,
    messages: [{
      role: 'user',
      content: `Available categories:\n${catList}\n\nTransactions to categorize:\n${JSON.stringify(items)}`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '[]';
  return parseJson<CategorizeResult[]>(raw) || [];
}

// ── 2. Monthly spending analysis ──────────────────────────────────────────────

export interface SpendingAnalysisInput {
  month: number;
  year: number;
  currency: string;
  spendingByCategory: { categoryName: string; spent: number; budget?: number }[];
  totalSpent: number;
  totalIncome: number;
  prevMonthTotalSpent: number;
}

export interface SpendingAnalysisResult {
  title: string;
  body: string;
  tips: string[];
  data: Record<string, number>;
}

export async function analyzeSpending(input: SpendingAnalysisInput): Promise<SpendingAnalysisResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a personal finance coach. Analyze the user's monthly spending and provide actionable, encouraging insights.
Return ONLY JSON: {"title": "string", "body": "string (2-3 sentences)", "tips": ["string", ...], "data": {"key": number, ...}}
No markdown, no prose outside JSON.`,
    messages: [{
      role: 'user',
      content: `Month: ${input.month}/${input.year}, Currency: ${input.currency}
Total spent: ${input.totalSpent}, Total income: ${input.totalIncome}
Previous month spent: ${input.prevMonthTotalSpent}
Spending by category: ${JSON.stringify(input.spendingByCategory)}`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseJson<SpendingAnalysisResult>(raw) || {
    title: `Your ${input.month}/${input.year} Summary`,
    body: 'Your spending analysis is ready.',
    tips: [],
    data: {},
  };
}

// ── 3. Anomaly detection ──────────────────────────────────────────────────────

export interface AnomalyInput {
  transactions: { id: string; description: string; amount: number; category?: string; date: string }[];
  averageByCategory: { category: string; average: number }[];
}

export interface AnomalyResult {
  title: string;
  body: string;
  anomalyIds: string[];
}

export async function detectAnomalies(input: AnomalyInput): Promise<AnomalyResult | null> {
  if (input.transactions.length === 0) return null;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are a financial anomaly detector. Identify transactions that are unusually large, from new merchants, or otherwise notable.
If no anomalies found, return null. Otherwise return JSON: {"title": "string", "body": "string", "anomalyIds": ["id1", ...]}
No markdown.`,
    messages: [{
      role: 'user',
      content: `Historical category averages: ${JSON.stringify(input.averageByCategory)}
Recent transactions: ${JSON.stringify(input.transactions)}`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : 'null';
  if (raw === 'null') return null;
  return parseJson<AnomalyResult>(raw);
}

// ── 4. Balance forecast ───────────────────────────────────────────────────────

export interface ForecastInput {
  currentBalance: number;
  currency: string;
  avgMonthlySpend: number;
  avgMonthlyIncome: number;
  recurringExpenses: { description: string; amount: number }[];
}

export interface ForecastResult {
  day30: number;
  day60: number;
  day90: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export async function forecastBalance(input: ForecastInput): Promise<ForecastResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are a financial forecasting assistant. Project the user's balance at 30, 60, and 90 days.
Return ONLY JSON: {"day30": number, "day60": number, "day90": number, "riskLevel": "low|medium|high", "recommendations": ["string",...]}`,
    messages: [{
      role: 'user',
      content: `Current balance: ${input.currentBalance} ${input.currency}
Average monthly income: ${input.avgMonthlyIncome}
Average monthly spend: ${input.avgMonthlySpend}
Recurring expenses: ${JSON.stringify(input.recurringExpenses)}`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseJson<ForecastResult>(raw) || {
    day30: input.currentBalance,
    day60: input.currentBalance,
    day90: input.currentBalance,
    riskLevel: 'low',
    recommendations: [],
  };
}

// ── 5. Natural language Q&A chat ──────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FinancialContext {
  currency: string;
  totalBalance: number;
  monthlySpend: number;
  monthlyIncome: number;
  topCategories: { name: string; spent: number }[];
  budgetStatus: { category: string; budget: number; spent: number }[];
}

export async function chat(
  messages: ChatMessage[],
  context: FinancialContext
): Promise<string> {
  const contextSummary = `User's financial context:
- Currency: ${context.currency}
- Total balance across all accounts: ${context.totalBalance}
- This month's spend: ${context.monthlySpend} | income: ${context.monthlyIncome}
- Top spending categories: ${context.topCategories.map((c) => `${c.name}: ${c.spent}`).join(', ')}
- Budget status: ${context.budgetStatus.map((b) => `${b.category} ${b.spent}/${b.budget}`).join(', ')}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are a helpful personal finance assistant. Answer the user's questions based on their financial data provided below. Be concise, accurate, and encouraging.

${contextSummary}`,
    messages: messages.slice(-10),
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'I could not process your request.';
}
