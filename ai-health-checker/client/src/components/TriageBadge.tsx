import { TriageLevel } from '../types';

const TRIAGE_CONFIG: Record<TriageLevel, { label: string; color: string; icon: string; desc: string }> = {
  EMERGENT:   { label: 'Emergency',      color: 'bg-red-100 text-red-700 border-red-200',       icon: '🚨', desc: 'Call 911 immediately' },
  URGENT:     { label: 'Urgent',         color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⚠️', desc: 'Seek care within hours' },
  SEE_DOCTOR: { label: 'See a Doctor',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '👨‍⚕️', desc: 'Schedule appointment soon' },
  MONITOR:    { label: 'Monitor',        color: 'bg-sky-100 text-sky-700 border-sky-200',         icon: '👁️', desc: 'Watch at home' },
  SELF_CARE:  { label: 'Self-Care',      color: 'bg-green-100 text-green-700 border-green-200',   icon: '🏠', desc: 'Manageable at home' },
};

interface Props {
  level: TriageLevel | null;
  showDesc?: boolean;
  size?: 'sm' | 'md';
}

export default function TriageBadge({ level, showDesc = false, size = 'md' }: Props) {
  if (!level) return null;
  const cfg = TRIAGE_CONFIG[level];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cfg.color} ${padding}`}>
        <span>{cfg.icon}</span>
        {cfg.label}
      </span>
      {showDesc && <p className="text-xs text-gray-500">{cfg.desc}</p>}
    </div>
  );
}
