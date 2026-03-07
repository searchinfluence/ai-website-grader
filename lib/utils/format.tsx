import { ReactNode } from 'react';

export function formatRecommendationText(text: string): ReactNode {
  const parts = text.split(/((?:www\.)?[a-z0-9][-a-z0-9]*(?:\.[a-z]{2,})+|\d+(?:\.\d+)?(?:%|ms|px|s|chars?)?)/gi);
  return parts.map((part, index) => {
    if (/^(?:www\.)?[a-z0-9][-a-z0-9]*(?:\.[a-z]{2,})+$/i.test(part)) {
      return <strong key={index}>{part}</strong>;
    }
    if (/^\d+(?:\.\d+)?(?:%|ms|px|s|chars?)?$/.test(part)) {
      return (
        <strong key={index} style={{ color: 'var(--orange-accent)' }}>
          {part}
        </strong>
      );
    }
    return part;
  });
}

