export type DietaryPreference = 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'KETO' | 'PALEO' | 'LOW_CARB' | 'HALAL' | 'KOSHER';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type IngredientCategory = 'PRODUCE' | 'PROTEIN' | 'DAIRY' | 'GRAINS' | 'PANTRY' | 'SPICES' | 'FROZEN' | 'BEVERAGES' | 'OTHER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  dietaryPreferences: DietaryPreference[];
  servings: number;
  weeklyBudget?: number;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  expiryDate?: string;
  createdAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine?: string;
  tags: string[];
  nutritionPerServing?: NutritionInfo;
  aiGenerated: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface SavedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  recipe: Recipe;
  rating?: number;
  notes?: string;
  savedAt: string;
}

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId?: string;
  recipe?: Recipe;
  dayOfWeek: number;
  mealType: MealType;
  customName?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  entries: MealPlanEntry[];
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
  estimatedPrice?: number;
}

export interface ShoppingList {
  id: string;
  userId: string;
  weekStart: string;
  items: ShoppingListItem[];
  createdAt: string;
}
