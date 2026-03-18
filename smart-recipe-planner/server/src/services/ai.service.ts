import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { PantryItem } from '@prisma/client';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  tags: string[];
  nutritionPerServing: { calories: number; protein: number; carbs: number; fat: number };
}

interface MealPlanSuggestion {
  dayOfWeek: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipeName: string;
  description: string;
  usesPantryItems: string[];
}

export async function generateRecipe(
  pantryItems: PantryItem[],
  dietaryPreferences: string[],
  servings: number,
  cuisinePreference?: string
): Promise<GeneratedRecipe> {
  const pantryList = pantryItems
    .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
    .join(', ');

  const prompt = `You are a professional chef. Generate a delicious recipe using primarily these pantry ingredients: ${pantryList}.

Dietary requirements: ${dietaryPreferences.join(', ') || 'none'}.
Servings needed: ${servings}.
${cuisinePreference ? `Cuisine preference: ${cuisinePreference}.` : ''}

Return ONLY valid JSON (no markdown, no explanation) matching exactly this structure:
{
  "name": "Recipe Name",
  "description": "Short description",
  "ingredients": [{"name": "item", "quantity": 1.0, "unit": "cup"}],
  "instructions": ["Step 1...", "Step 2..."],
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "servings": ${servings},
  "cuisine": "Italian",
  "tags": ["quick", "healthy"],
  "nutritionPerServing": {"calories": 400, "protein": 25, "carbs": 40, "fat": 12}
}`;

  const delays = [2000, 4000, 8000];
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      return JSON.parse(jsonMatch[0]) as GeneratedRecipe;
    } catch (error: unknown) {
      if (attempt === 3) {
        logger.error({ error }, 'AI recipe generation failed');
        throw new Error('Failed to generate recipe');
      }
      const apiError = error as { status?: number };
      if (apiError.status === 429 || (apiError.status ?? 0) >= 500) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

export async function generateMealPlan(
  pantryItems: PantryItem[],
  dietaryPreferences: string[],
  servings: number,
  days = 7
): Promise<MealPlanSuggestion[]> {
  const pantryList = pantryItems
    .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
    .join(', ');

  const prompt = `You are a professional nutritionist and meal planner. Create a ${days}-day meal plan for ${servings} people.

Available pantry items: ${pantryList || 'basic pantry staples'}.
Dietary requirements: ${dietaryPreferences.join(', ') || 'none'}.

Plan BREAKFAST, LUNCH, and DINNER for each day (${days * 3} total entries).
Days: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday.

Return ONLY valid JSON array (no markdown) with exactly ${days * 3} entries:
[
  {
    "dayOfWeek": 0,
    "mealType": "BREAKFAST",
    "recipeName": "Recipe Name",
    "description": "Brief description",
    "usesPantryItems": ["ingredient1", "ingredient2"]
  }
]`;

  const delays = [2000, 4000, 8000];
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      return JSON.parse(jsonMatch[0]) as MealPlanSuggestion[];
    } catch (error: unknown) {
      if (attempt === 3) {
        logger.error({ error }, 'AI meal plan generation failed');
        throw new Error('Failed to generate meal plan');
      }
      const apiError = error as { status?: number };
      if (apiError.status === 429 || (apiError.status ?? 0) >= 500) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
