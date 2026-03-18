import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePantry } from '../hooks/usePantry';
import { useSavedRecipes } from '../hooks/useRecipes';
import { useShoppingList } from '../hooks/useShoppingList';
import { Spinner } from '../components/ui/Spinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { items: pantryItems, loading: pantryLoading } = usePantry();
  const { saved, loading: recipesLoading } = useSavedRecipes();
  const { list, loading: listLoading } = useShoppingList();

  const expiringItems = pantryItems.filter((item) =>
    item.expiryDate && new Date(item.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
  );
  const uncheckedItems = list?.items.filter((i) => !i.checked) ?? [];

  const stats = [
    { label: 'Pantry Items', value: pantryItems.length, to: '/pantry', icon: '🧺', loading: pantryLoading },
    { label: 'Saved Recipes', value: saved.length, to: '/recipes', icon: '📖', loading: recipesLoading },
    { label: 'To Buy', value: uncheckedItems.length, to: '/shopping-list', icon: '🛒', loading: listLoading },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Good day, {user?.displayName}! 👋</h2>
        <p className="text-gray-500 mt-1">Here's what's cooking in your kitchen.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, to, icon, loading }) => (
          <Link key={label} to={to} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-sm transition-all">
            <div className="text-2xl mb-2">{icon}</div>
            {loading ? <Spinner size="sm" /> : <div className="text-3xl font-bold text-emerald-600">{value}</div>}
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      {expiringItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2">⚠️ Expiring Soon</h3>
          <div className="space-y-1">
            {expiringItems.map((item) => (
              <p key={item.id} className="text-sm text-orange-700">
                {item.name} — expires {new Date(item.expiryDate!).toLocaleDateString()}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link to="/recipes" className="block bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-5 hover:opacity-90 transition-opacity">
          <div className="text-2xl mb-2">✨</div>
          <div className="font-semibold">Generate AI Recipe</div>
          <div className="text-emerald-100 text-sm mt-1">Based on your pantry items</div>
        </Link>
        <Link to="/meal-plan" className="block bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5 hover:opacity-90 transition-opacity">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold">Plan This Week</div>
          <div className="text-blue-100 text-sm mt-1">AI-generated meal plan</div>
        </Link>
      </div>
    </div>
  );
}
