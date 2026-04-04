import { ScoringFactorResult } from '@/types';
import { type LucideIcon } from 'lucide-react';

interface FactorCardProps {
  factor: ScoringFactorResult;
  accent: string;
  borderColor: string;
  background: string;
  icon?: LucideIcon;
}

const statusCopy: Record<ScoringFactorResult['status'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-improvement': 'Needs Improvement',
  poor: 'Poor',
  critical: 'Critical'
};

export default function FactorCard({ factor, accent, borderColor, background, icon: Icon }: FactorCardProps) {
  const clampedScore = Math.max(0, Math.min(100, factor.score));

  return (
    <div style={{
      textAlign: 'left',
      padding: '18px',
      background: background,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      borderLeft: `5px solid ${accent}`,
      minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3 style={{ margin: 0, color: 'var(--content-text)', fontSize: '1.1rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={18} style={{ color: accent }} />}
          {factor.label}
        </h3>
        <strong style={{ color: accent, fontSize: '1.65rem', lineHeight: 1, whiteSpace: 'nowrap' }}>{factor.score}%</strong>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: accent,
          border: `1px solid ${borderColor}`,
          borderRadius: '999px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.78)'
        }}>
          {statusCopy[factor.status]}
        </span>
        <span style={{ fontSize: '0.86rem', color: 'var(--secondary-content)', fontWeight: 600 }}>
          Weight {Math.round(factor.weight * 100)}%
        </span>
      </div>
      <div style={{ marginTop: '14px', height: '6px', borderRadius: '999px', background: 'rgba(1, 44, 58, 0.1)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${clampedScore}%`,
            background: accent,
            borderRadius: 'inherit',
            transition: 'width 0.45s ease'
          }}
        />
      </div>
    </div>
  );
}
