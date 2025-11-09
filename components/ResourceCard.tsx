'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface ResourceCardProps {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function ResourceCard({
  image,
  title,
  description,
  buttonText,
  buttonLink,
}: ResourceCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image Area */}
      <div
        style={{
          width: '100%',
          height: '240px',
          position: 'relative',
          background: 'var(--lighter-blue)',
          overflow: 'hidden',
        }}
      >
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Content Area */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        {/* Hyperlinked Title */}
        <a
          href={buttonLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--orange-accent)',
            textDecoration: 'none',
            lineHeight: '1.4',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--orange-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--orange-accent)';
          }}
        >
          <span style={{ flex: 1 }}>{title}</span>
          <ExternalLink size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
        </a>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--light-gray)',
            lineHeight: '1.6',
            margin: '0 0 auto 0',
            paddingBottom: '20px',
          }}
        >
          {description}
        </p>

        {/* Button */}
        <a
          href={buttonLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
          }}
        >
          <button
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, var(--orange-accent) 0%, var(--orange-dark) 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-stack)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(230, 126, 34, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--orange-light) 0%, var(--orange-accent) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--orange-accent) 0%, var(--orange-dark) 100%)';
            }}
          >
            {buttonText}
          </button>
        </a>
      </div>
    </div>
  );
}
