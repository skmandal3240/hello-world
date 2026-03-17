import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CreateHabitData } from '../../api/habits';
import { HabitCategory, HabitFrequency } from '../../types';

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'HEALTH', label: 'Health' }, { value: 'FITNESS', label: 'Fitness' },
  { value: 'LEARNING', label: 'Learning' }, { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'MINDFULNESS', label: 'Mindfulness' }, { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'SOCIAL', label: 'Social' }, { value: 'CREATIVITY', label: 'Creativity' },
  { value: 'FINANCE', label: 'Finance' }, { value: 'OTHER', label: 'Other' },
];

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHabitData) => Promise<void>;
  initial?: Partial<CreateHabitData>;
  title?: string;
}

export function HabitForm({ open, onClose, onSubmit, initial = {}, title = 'New Habit' }: HabitFormProps) {
  const [form, setForm] = useState<CreateHabitData>({
    name: initial.name ?? '',
    description: initial.description ?? '',
    frequency: initial.frequency ?? 'DAILY',
    category: initial.category ?? 'OTHER',
    targetDays: initial.targetDays ?? 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    try {
      setLoading(true);
      await onSubmit(form);
      onClose();
    } catch {
      setError('Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Habit name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Morning run"
        />
        <Input
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. 30 minutes of jogging"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as HabitCategory }))}
            options={CATEGORIES}
          />
          <Select
            label="Frequency"
            value={form.frequency}
            onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as HabitFrequency }))}
            options={[{ value: 'DAILY', label: 'Daily' }, { value: 'WEEKLY', label: 'Weekly' }]}
          />
        </div>
        <Input
          label="Target (days)"
          type="number"
          min={1}
          max={365}
          value={form.targetDays}
          onChange={(e) => setForm((f) => ({ ...f, targetDays: parseInt(e.target.value) || 30 }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Habit</Button>
        </div>
      </form>
    </Modal>
  );
}
