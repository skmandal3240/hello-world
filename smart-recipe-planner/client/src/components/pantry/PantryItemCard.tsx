import React from 'react';
import { PantryItem } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  item: PantryItem;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  PRODUCE: 'green',
  PROTEIN: 'red',
  DAIRY: 'blue',
  GRAINS: 'yellow',
  PANTRY: 'gray',
  SPICES: 'yellow',
  FROZEN: 'blue',
  BEVERAGES: 'blue',
  OTHER: 'gray',
};

export function PantryItemCard({ item, onDelete }: Props) {
  const isExpiringSoon = item.expiryDate
    ? new Date(item.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500">
            {item.quantity} {item.unit}
            {item.expiryDate && (
              <span className={isExpiringSoon ? 'text-red-500 ml-2' : 'text-gray-400 ml-2'}>
                · exp {new Date(item.expiryDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Badge color={categoryColors[item.category] ?? 'gray'}>{item.category}</Badge>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm"
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}
