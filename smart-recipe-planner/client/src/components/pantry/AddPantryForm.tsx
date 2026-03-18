import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { IngredientCategory } from '../../types';

interface FormData {
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
  expiryDate: string;
}

interface Props {
  onAdd: (data: { name: string; quantity: number; unit: string; category: IngredientCategory; expiryDate?: string }) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES: IngredientCategory[] = ['PRODUCE', 'PROTEIN', 'DAIRY', 'GRAINS', 'PANTRY', 'SPICES', 'FROZEN', 'BEVERAGES', 'OTHER'];
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

export function AddPantryForm({ onAdd, loading }: Props) {
  const [form, setForm] = useState<FormData>({ name: '', quantity: '1', unit: '', category: 'OTHER', expiryDate: '' });
  const [error, setError] = useState('');

  const setField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.unit.trim()) { setError('Name and unit are required'); return; }
    const qty = parseFloat(form.quantity);
    if (isNaN(qty) || qty <= 0) { setError('Quantity must be a positive number'); return; }
    setError('');
    await onAdd({
      name: form.name.trim(),
      quantity: qty,
      unit: form.unit.trim(),
      category: form.category,
      expiryDate: form.expiryDate || undefined,
    });
    setForm({ name: '', quantity: '1', unit: '', category: 'OTHER', expiryDate: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Item name" value={form.name} onChange={setField('name')} required />
        <div className="flex gap-2">
          <Input type="number" placeholder="Qty" value={form.quantity} onChange={setField('quantity')} min="0.01" step="0.01" className="w-24" />
          <Input placeholder="Unit (g, ml, pcs...)" value={form.unit} onChange={setField('unit')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select options={CATEGORY_OPTIONS} value={form.category} onChange={setField('category')} />
        <Input type="date" value={form.expiryDate} onChange={setField('expiryDate')} placeholder="Expiry (optional)" />
      </div>
      <Button type="submit" loading={loading} className="w-full">Add to Pantry</Button>
    </form>
  );
}
