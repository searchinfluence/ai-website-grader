'use client';

import ResourceCard from './ResourceCard';

export default function ResourcesSection() {
  const resources = [
    {
      image: 'data:image/svg+xml,%3Csvg width="360" height="240" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%233498db;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%232980b9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="360" height="240" fill="url(%23grad1)"/%3E%3Ctext x="180" y="110" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle"%3EAI Search%3C/text%3E%3Ctext x="180" y="140" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle"%3EResearch Study%3C/text%3E%3C/svg%3E',
      title: '2025 AI Search in Higher Education Research Study',
      description: "Get the Latest Data on Your Prospects' Search Behavior",
      buttonText: 'Download Now',
      buttonLink: 'https://info.searchinfluence.com/2025-upcea-ai-search-higher-education-research-study/',
    },
    {
      image: 'data:image/svg+xml,%3Csvg width="360" height="240" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f39c12;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23e67e22;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="360" height="240" fill="url(%23grad2)"/%3E%3Ctext x="180" y="110" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle"%3ESEO%3C/text%3E%3Ctext x="180" y="140" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle"%3EFundamentals%3C/text%3E%3C/svg%3E',
      title: 'SEO Fundamentals Workbook',
      description: 'Identify 3 Months of SEO Techniques You Can Execute Immediately',
      buttonText: 'Download Now',
      buttonLink: 'https://info.searchinfluence.com/seo-workbook-for-higher-education-websites/',
    },
    {
      image: 'data:image/svg+xml,%3Csvg width="360" height="240" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2316a085;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%231abc9c;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="360" height="240" fill="url(%23grad3)"/%3E%3Ctext x="180" y="110" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle"%3ECustom SEO%3C/text%3E%3Ctext x="180" y="140" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle"%3ERoadmap%3C/text%3E%3C/svg%3E',
      title: 'Custom Higher Ed SEO Roadmap',
      description: 'Drive More Enrollments With Your Personalized AI SEO Roadmap',
      buttonText: 'Book Now',
      buttonLink: 'https://info.searchinfluence.com/higher-ed-seo-roadmap-universities/',
    },
  ];

  return (
    <section
      style={{
        padding: '60px 0',
        background: 'var(--lighter-blue)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: 'var(--white)',
            textAlign: 'center',
            margin: '0 0 40px 0',
          }}
        >
          Get More AI Search Insights
        </h2>

        {/* Resources Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {resources.map((resource, index) => (
            <ResourceCard
              key={index}
              image={resource.image}
              title={resource.title}
              description={resource.description}
              buttonText={resource.buttonText}
              buttonLink={resource.buttonLink}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
