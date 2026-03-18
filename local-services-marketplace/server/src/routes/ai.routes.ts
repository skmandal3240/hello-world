import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RecommendSchema = z.object({
  description: z.string().min(10).max(500),
  zipCode: z.string().optional(),
});

router.post('/recommend', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = RecommendSchema.parse(req.body);

    const categories = await prisma.serviceCategory.findMany({ select: { name: true, slug: true, description: true } });
    const categoryList = categories.map(c => `- ${c.name} (${c.slug}): ${c.description}`).join('\n');

    const prompt = `You are a helpful local services marketplace assistant. A user needs help and described their problem as: "${body.description}"

Available service categories:
${categoryList}

Respond with a JSON object containing:
- "category": the most relevant category slug from the list above
- "categoryName": the display name of that category
- "reasoning": a 1-2 sentence explanation of why this category fits
- "tips": an array of 2-3 helpful tips for hiring this type of service provider

Return ONLY valid JSON, no markdown.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text;
    const recommendation = JSON.parse(text);
    res.json(recommendation);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'AI recommend failed');
    res.status(500).json({ error: 'Failed to get AI recommendation' });
  }
});

const PriceEstimateSchema = z.object({
  categorySlug: z.string(),
  jobDescription: z.string().min(10).max(500),
});

router.post('/price-estimate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = PriceEstimateSchema.parse(req.body);

    const category = await prisma.serviceCategory.findUnique({ where: { slug: body.categorySlug } });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const providers = await prisma.providerProfile.findMany({
      where: { services: { some: { category: { slug: body.categorySlug } } } },
      select: { hourlyRate: true },
      take: 20,
    });

    const avgRate = providers.length
      ? providers.reduce((sum, p) => sum + p.hourlyRate, 0) / providers.length
      : 50;

    const prompt = `You are a pricing expert for local services. Given this ${category.name} job: "${body.jobDescription}"
Average hourly rate in our marketplace: $${avgRate.toFixed(0)}/hr

Provide a JSON price estimate with:
- "low": minimum expected cost (number)
- "high": maximum expected cost (number)
- "unit": "fixed" or "hourly"
- "estimatedHours": estimated hours if hourly (number or null)
- "factors": array of 3 key factors affecting the price

Return ONLY valid JSON.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text;
    const estimate = JSON.parse(text);
    res.json(estimate);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Price estimate failed');
    res.status(500).json({ error: 'Failed to get price estimate' });
  }
});

export default router;
