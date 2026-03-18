import React, { useState } from 'react';
import { usePantry } from '../hooks/usePantry';
import { PantryItemCard } from '../components/pantry/PantryItemCard';
import { AddPantryForm } from '../components/pantry/AddPantryForm';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { IngredientCategory } from '../types';

export default function PantryPage() {
  const { items, loading, addItem, deleteItem } = usePantry();
  const { showToast } = useToast();
  const [addLoading, setAddLoading] = useState(false);
  const [search, setSearch] = useState('');

  const handleAdd = async (data: { name: string; quantity: number; unit: string; category: IngredientCategory; expiryDate?: string }) => {
    setAddLoading(true);
    try {
      await addItem(data);
      showToast('Item added to pantry!');
    } catch {
      showToast('Failed to add item', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      showToast('Item removed');
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
    const key = item.category;
    return { ...acc, [key]: [...(acc[key] ?? []), item] };
  }, {});

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Pantry</h2>
          <p className="text-gray-500 text-sm mt-1">{items.length} items tracked</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Add Item</h3>
        <AddPantryForm onAdd={handleAdd} loading={addLoading} />
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search pantry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🧺</div>
          <p>{search ? 'No items match your search' : 'Your pantry is empty — add some items!'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([category, categoryItems]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <PantryItemCard key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
