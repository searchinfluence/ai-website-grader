'use client';

import Script from 'next/script';

interface GoogleSearchConsoleProps {
  verificationCode?: string;
}

export default function GoogleSearchConsole({ verificationCode }: GoogleSearchConsoleProps) {
  if (!verificationCode) {
    return null;
  }

  return (
    <>
      {/* Google Search Console Verification */}
      <meta name="google-site-verification" content={verificationCode} />
      
      {/* Alternative verification methods */}
      <Script id="google-search-console" strategy="afterInteractive">
        {`
          // Google Search Console verification
          if (typeof window !== 'undefined') {
            // Add any additional GSC tracking here
            console.log('Google Search Console verification loaded');
          }
        `}
      </Script>
    </>
  );
}

// Helper function to generate GSC verification meta tag
export function getGSCVerificationMeta(verificationCode: string) {
  return {
    'google-site-verification': verificationCode
  };
} 