'use client';

import { useEffect, useState } from 'react';
import { Loader2, Brain, Search, Zap, Target, CheckCircle2 } from 'lucide-react';

interface AnalysisStatusProps {
  isVisible: boolean;
}

const analysisSteps = [
  { text: 'Fetching page content...', icon: Search },
  { text: 'Analyzing structure & schema...', icon: Brain },
  { text: 'Running technical checks...', icon: Zap },
  { text: 'Generating recommendations...', icon: Target }
] as const;

export default function AnalysisStatus({ isVisible }: AnalysisStatusProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    setCurrentStepIndex(0);
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % analysisSteps.length);
    }, 3000);

    return () => clearInterval(stepInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStep = analysisSteps[currentStepIndex];
  const CurrentIcon = currentStep.icon;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(44, 62, 80, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(12px)'
      }}
    >
      <div
        style={{
          background: 'var(--content-bg)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 80px rgba(44, 62, 80, 0.4)',
          border: '2px solid var(--orange-accent)',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px'
            }}
          >
            <Loader2
              size={80}
              style={{
                color: 'var(--orange-accent)',
                animation: 'spin 2s linear infinite'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--content-bg)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CurrentIcon size={24} style={{ color: 'var(--orange-accent)' }} />
            </div>
          </div>
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--content-text)',
            marginBottom: '10px'
          }}
        >
          Analyzing Your Website...
        </h2>

        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'var(--background-gray)',
            borderRadius: '12px',
            border: '1px solid var(--border-gray)'
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '1.05rem',
              color: 'var(--content-text)',
              fontWeight: 600
            }}
          >
            {currentStep.text}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--muted-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {currentStepIndex + 1} of {analysisSteps.length}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
            marginBottom: '24px',
            textAlign: 'left'
          }}
        >
          {analysisSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  border: isCurrent ? '1px solid rgba(230, 126, 34, 0.45)' : '1px solid var(--border-gray)',
                  background: isCurrent ? 'rgba(230, 126, 34, 0.1)' : 'var(--content-bg)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StepIcon size={16} style={{ color: isCurrent ? 'var(--orange-accent)' : 'var(--muted-text)' }} />
                  <span style={{ color: 'var(--content-text)', fontSize: '0.9rem' }}>{step.text}</span>
                </div>
                {isComplete && <CheckCircle2 size={18} style={{ color: 'var(--success-green)' }} />}
              </div>
            );
          })}
        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
