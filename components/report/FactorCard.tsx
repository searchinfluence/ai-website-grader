import { ScoringFactorResult } from '@/types';

interface FactorCardProps {
  factor: ScoringFactorResult;
}

export default function FactorCard({ factor }: FactorCardProps) {
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '14px',
      background: 'var(--content-bg)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
        <h3 style={{ margin: 0, color: 'var(--content-text)', fontSize: '1.1rem' }}>{factor.label}</h3>
        <strong style={{ color: 'var(--info-blue)', fontSize: '1.2rem' }}>{factor.score}%</strong>
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--muted-text)' }}>
        Weight: {Math.round(factor.weight * 100)}%
      </p>
    </div>
  );
}
