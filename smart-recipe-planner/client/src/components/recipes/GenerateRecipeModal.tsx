import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (params: { cuisinePreference?: string; servings?: number }) => Promise<void>;
  loading: boolean;
}

const SERVINGS_OPTIONS = [1, 2, 3, 4, 6, 8].map((n) => ({ value: String(n), label: `${n} serving${n > 1 ? 's' : ''}` }));

export function GenerateRecipeModal({ open, onClose, onGenerate, loading }: Props) {
  const [cuisine, setCuisine] = useState('');
  const [servings, setServings] = useState('2');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      cuisinePreference: cuisine.trim() || undefined,
      servings: parseInt(servings) || 2,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate AI Recipe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Claude will generate a recipe based on your pantry items and dietary preferences.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Preference (optional)</label>
          <Input
            placeholder="e.g. Italian, Asian, Mexican..."
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <Select options={SERVINGS_OPTIONS} value={servings} onChange={(e) => setServings(e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">✨ Generate</Button>
        </div>
      </form>
    </Modal>
  );
}
