export type InsightType = 'WEEKLY_SUMMARY' | 'SAVINGS_TIP' | 'ANOMALY' | 'FORECAST';

export interface AiInsight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  month?: number;
  year?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ForecastResult {
  day30: number;
  day60: number;
  day90: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
