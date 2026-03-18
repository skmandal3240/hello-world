import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  recipe: Recipe;
  saved?: boolean;
  onSave?: (recipeId: string) => void;
  onUnsave?: (recipeId: string) => void;
}

export function RecipeCard({ recipe, saved, onSave, onUnsave }: Props) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/recipes/${recipe.id}`} className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2">
            {recipe.name}
          </Link>
          {recipe.aiGenerated && <Badge color="green">AI</Badge>}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span>⏱ {totalTime}m</span>
          <span>🍽 {recipe.servings} servings</span>
          {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
        </div>
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} color="gray">{tag}</Badge>
            ))}
          </div>
        )}
        {(onSave || onUnsave) && (
          <button
            onClick={() => saved ? onUnsave?.(recipe.id) : onSave?.(recipe.id)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              saved
                ? 'border-emerald-600 text-emerald-600 hover:bg-red-50 hover:border-red-400 hover:text-red-500'
                : 'border-gray-300 text-gray-500 hover:border-emerald-600 hover:text-emerald-600'
            }`}
          >
            {saved ? '✓ Saved' : '+ Save'}
          </button>
        )}
      </div>
    </div>
  );
}
