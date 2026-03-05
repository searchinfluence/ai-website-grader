import { ScoringFactorResult } from '@/types';

interface FactorDetailsProps {
  factor: ScoringFactorResult;
}

export default function FactorDetails({ factor }: FactorDetailsProps) {
  return (
    <section style={{
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '16px',
      background: 'var(--content-bg)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{factor.label} ({factor.score}%)</h3>
      <p style={{ marginTop: 0, color: 'var(--muted-text)' }}>
        Status: <strong style={{ textTransform: 'capitalize' }}>{factor.status}</strong>
      </p>

      {factor.findings.length > 0 && (
        <>
          <h4>Findings</h4>
          <ul>
            {factor.findings.map((finding, index) => (
              <li key={`${factor.key}-finding-${index}`}>{finding}</li>
            ))}
          </ul>
        </>
      )}

      {factor.recommendations.length > 0 && (
        <>
          <h4>Recommendations</h4>
          <ul>
            {factor.recommendations.map((recommendation, index) => (
              <li key={`${factor.key}-rec-${index}`}>
                <strong>{recommendation.priority.toUpperCase()}:</strong> {recommendation.text}
                {recommendation.timeToImplement ? ` (${recommendation.timeToImplement})` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
