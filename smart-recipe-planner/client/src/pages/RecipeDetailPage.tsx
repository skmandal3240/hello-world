import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipesApi } from '../api/recipes';
import { Recipe } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    recipesApi.get(id)
      .then((res) => setRecipe(res.data))
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  if (error || !recipe) return (
    <div className="p-6 text-center">
      <p className="text-red-500 mb-4">{error || 'Recipe not found'}</p>
      <Button onClick={() => navigate('/recipes')} color="secondary">← Back to Recipes</Button>
    </div>
  );

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
            {recipe.aiGenerated && <Badge color="green">AI Generated</Badge>}
          </div>
          <p className="text-gray-600 mb-4">{recipe.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>⏱ Prep: {recipe.prepTimeMinutes}m</span>
            <span>🔥 Cook: {recipe.cookTimeMinutes}m</span>
            <span>⏰ Total: {totalTime}m</span>
            <span>🍽 Serves: {recipe.servings}</span>
            {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
          </div>
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => <Badge key={tag} color="gray">{tag}</Badge>)}
            </div>
          )}
        </div>

        {recipe.nutritionPerServing && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Nutrition per serving</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Calories', value: recipe.nutritionPerServing.calories },
                { label: 'Protein', value: `${recipe.nutritionPerServing.protein}g` },
                { label: 'Carbs', value: `${recipe.nutritionPerServing.carbs}g` },
                { label: 'Fat', value: `${recipe.nutritionPerServing.fat}g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg p-2 border border-gray-200">
                  <div className="font-bold text-emerald-600">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Ingredients</h3>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{ing.quantity} {ing.unit} {ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-3">
                  <span className="shrink-0 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
