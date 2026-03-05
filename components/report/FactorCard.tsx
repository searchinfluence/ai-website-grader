import { ScoringFactorResult } from '@/types';

interface FactorCardProps {
  factor: ScoringFactorResult;
  accent: string;
  borderColor: string;
  gradient: string;
}

const statusCopy: Record<ScoringFactorResult['status'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-improvement': 'Needs Improvement',
  poor: 'Poor',
  critical: 'Critical'
};

export default function FactorCard({ factor, accent, borderColor, gradient }: FactorCardProps) {
  return (
    <div style={{
      textAlign: 'left',
      padding: '16px',
      background: gradient,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      borderLeft: `5px solid ${accent}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3 style={{ margin: 0, color: 'var(--content-text)', fontSize: '1.02rem', fontWeight: 700 }}>{factor.label}</h3>
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
          background: 'rgba(255,255,255,0.65)'
        }}>
          {statusCopy[factor.status]}
        </span>
        <span style={{ fontSize: '0.86rem', color: 'var(--secondary-content)', fontWeight: 600 }}>
          Weight {Math.round(factor.weight * 100)}%
        </span>
      </div>
    </div>
  );
}
