import React, { useState } from 'react';
import { useRecipes, useSavedRecipes } from '../hooks/useRecipes';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { GenerateRecipeModal } from '../components/recipes/GenerateRecipeModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';

export default function RecipesPage() {
  const { recipes, loading, generate } = useRecipes();
  const { saved, save, unsave } = useSavedRecipes();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const savedRecipeIds = new Set(saved.map((s) => s.recipeId));
  const savedIdMap = Object.fromEntries(saved.map((s) => [s.recipeId, s.id]));

  const handleGenerate = async (params: { cuisinePreference?: string; servings?: number }) => {
    setGenerating(true);
    try {
      const recipe = await generate(params.cuisinePreference, params.servings);
      showToast(`"${recipe.name}" generated!`);
      setModalOpen(false);
    } catch {
      showToast('Failed to generate recipe. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (recipeId: string) => {
    try {
      await save(recipeId);
      showToast('Recipe saved!');
    } catch {
      showToast('Failed to save recipe', 'error');
    }
  };

  const handleUnsave = async (recipeId: string) => {
    const savedId = savedIdMap[recipeId];
    if (!savedId) return;
    try {
      await unsave(savedId);
      showToast('Recipe removed from saved');
    } catch {
      showToast('Failed to remove recipe', 'error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
          <p className="text-gray-500 text-sm mt-1">{recipes.length} recipes</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>✨ Generate with AI</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📖</div>
          <p className="mb-4">No recipes yet. Generate one with AI!</p>
          <Button onClick={() => setModalOpen(true)}>✨ Generate Recipe</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              saved={savedRecipeIds.has(recipe.id)}
              onSave={handleSave}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}

      <GenerateRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerate}
        loading={generating}
      />
    </div>
  );
}
