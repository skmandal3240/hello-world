import React from 'react';
import { useShoppingList } from '../hooks/useShoppingList';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';

export default function ShoppingListPage() {
  const { list, loading, generating, generate: generateList, toggleItem, deleteItem: removeItem } = useShoppingList();
  const { showToast } = useToast();

  const handleGenerate = async () => {
    try {
      await generateList();
      showToast('Shopping list generated!');
    } catch {
      showToast('Failed to generate list', 'error');
    }
  };

  const handleToggle = async (id: string) => {
    try { await toggleItem(id); } catch { showToast('Failed to update item', 'error'); }
  };

  const handleRemove = async (id: string) => {
    try { await removeItem(id); } catch { showToast('Failed to remove item', 'error'); }
  };

  const unchecked = list?.items.filter((i) => !i.checked) ?? [];
  const checked = list?.items.filter((i) => i.checked) ?? [];

  const grouped = unchecked.reduce<Record<string, typeof unchecked>>((acc, item) => {
    const key = item.category;
    return { ...acc, [key]: [...(acc[key] ?? []), item] };
  }, {});

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
          {list && <p className="text-gray-500 text-sm mt-1">{unchecked.length} items to buy</p>}
        </div>
        <Button onClick={handleGenerate} loading={generating}>♻️ Regenerate</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !list || list.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛒</div>
          <p className="mb-4">Your shopping list is empty. Generate it from your meal plan!</p>
          <Button onClick={handleGenerate} loading={generating}>Generate List</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggle(item.id)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span className="flex-1 text-sm text-gray-800">
                      {item.quantity} {item.unit} {item.name}
                    </span>
                    {item.estimatedPrice && (
                      <span className="text-xs text-gray-400">${item.estimatedPrice.toFixed(2)}</span>
                    )}
                    <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {checked.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">✓ Done ({checked.length})</h4>
              <div className="space-y-1">
                {checked.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 opacity-50">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => handleToggle(item.id)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span className="flex-1 text-sm line-through text-gray-500">{item.quantity} {item.unit} {item.name}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
