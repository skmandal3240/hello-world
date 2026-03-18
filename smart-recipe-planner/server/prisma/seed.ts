import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Demo user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      displayName: 'Demo Chef',
      dietaryPreferences: ['NONE'],
      servings: 2,
    },
  });

  // Seed pantry items
  const pantryItems = [
    { name: 'Chicken Breast', quantity: 500, unit: 'g', category: 'PROTEIN' as const },
    { name: 'Olive Oil', quantity: 1, unit: 'bottle', category: 'PANTRY' as const },
    { name: 'Garlic', quantity: 5, unit: 'cloves', category: 'PRODUCE' as const },
    { name: 'Onion', quantity: 3, unit: 'pcs', category: 'PRODUCE' as const },
    { name: 'Tomatoes', quantity: 4, unit: 'pcs', category: 'PRODUCE' as const },
    { name: 'Pasta', quantity: 400, unit: 'g', category: 'GRAINS' as const },
    { name: 'Parmesan Cheese', quantity: 100, unit: 'g', category: 'DAIRY' as const },
    { name: 'Eggs', quantity: 6, unit: 'pcs', category: 'PROTEIN' as const },
    { name: 'Flour', quantity: 500, unit: 'g', category: 'GRAINS' as const },
    { name: 'Butter', quantity: 200, unit: 'g', category: 'DAIRY' as const },
  ];

  for (const item of pantryItems) {
    await prisma.pantryItem.upsert({
      where: { id: `seed-pantry-${item.name}` },
      update: {},
      create: { id: `seed-pantry-${item.name}`, userId: user.id, ...item },
    }).catch(() => prisma.pantryItem.create({ data: { userId: user.id, ...item } }));
  }

  // Seed 3 demo recipes
  const recipes = [
    {
      id: 'seed-recipe-pasta',
      name: 'Classic Spaghetti Carbonara',
      description: 'A creamy Italian pasta dish made with eggs, cheese, and pantry staples.',
      ingredients: [
        { name: 'Pasta', quantity: 200, unit: 'g' },
        { name: 'Eggs', quantity: 3, unit: 'pcs' },
        { name: 'Parmesan Cheese', quantity: 50, unit: 'g' },
        { name: 'Garlic', quantity: 2, unit: 'cloves' },
        { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
        { name: 'Black Pepper', quantity: 1, unit: 'tsp' },
      ],
      instructions: [
        'Boil pasta in salted water until al dente.',
        'Whisk eggs and Parmesan in a bowl.',
        'Sauté garlic in olive oil for 1 minute.',
        'Drain pasta, reserving 1 cup of cooking water.',
        'Remove pan from heat, add pasta, then egg mixture.',
        'Toss quickly, adding pasta water to loosen. Season with pepper.',
      ],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      cuisine: 'Italian',
      tags: ['pasta', 'quick', 'dinner'],
      nutritionPerServing: { calories: 520, protein: 24, carbs: 65, fat: 18 },
      aiGenerated: false,
    },
    {
      id: 'seed-recipe-chicken',
      name: 'Garlic Herb Roasted Chicken',
      description: 'Tender roasted chicken breast with aromatic herbs and garlic.',
      ingredients: [
        { name: 'Chicken Breast', quantity: 250, unit: 'g' },
        { name: 'Garlic', quantity: 3, unit: 'cloves' },
        { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
        { name: 'Rosemary', quantity: 1, unit: 'sprig' },
        { name: 'Salt', quantity: 1, unit: 'tsp' },
      ],
      instructions: [
        'Preheat oven to 200°C.',
        'Mix olive oil, minced garlic, and herbs.',
        'Coat chicken with herb mixture.',
        'Roast for 25-30 minutes until cooked through.',
        'Rest for 5 minutes before serving.',
      ],
      prepTimeMinutes: 10,
      cookTimeMinutes: 30,
      servings: 2,
      cuisine: 'Mediterranean',
      tags: ['chicken', 'healthy', 'dinner'],
      nutritionPerServing: { calories: 310, protein: 38, carbs: 3, fat: 16 },
      aiGenerated: false,
    },
    {
      id: 'seed-recipe-omelette',
      name: 'Herb Omelette with Parmesan',
      description: 'A fluffy French-style omelette perfect for breakfast or a light meal.',
      ingredients: [
        { name: 'Eggs', quantity: 3, unit: 'pcs' },
        { name: 'Butter', quantity: 1, unit: 'tbsp' },
        { name: 'Parmesan Cheese', quantity: 20, unit: 'g' },
        { name: 'Salt', quantity: 0.5, unit: 'tsp' },
      ],
      instructions: [
        'Beat eggs with salt until combined.',
        'Melt butter in a non-stick pan over medium heat.',
        'Pour in eggs and cook, pulling edges inward.',
        'Sprinkle Parmesan when mostly set.',
        'Fold and slide onto a plate.',
      ],
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 1,
      cuisine: 'French',
      tags: ['breakfast', 'quick', 'eggs'],
      nutritionPerServing: { calories: 280, protein: 20, carbs: 2, fat: 22 },
      aiGenerated: false,
    },
  ];

  for (const recipe of recipes) {
    await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: recipe,
    });
  }

  console.log('✅ Seed complete: demo user, pantry items, and 3 starter recipes created.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
