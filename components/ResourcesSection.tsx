'use client';

import ResourceCard from './ResourceCard';

export default function ResourcesSection() {
  const resources = [
    {
      image: '/images/ai-search-research-study.png',
      title: '2025 AI Search in Higher Education Research Study',
      description: "Get the Latest Data on Your Prospects' Search Behavior",
      buttonText: 'Download Now',
      buttonLink: 'https://info.searchinfluence.com/2025-upcea-ai-search-higher-education-research-study/',
    },
    {
      image: '/images/seo-fundamentals-workbook.png',
      title: 'SEO Fundamentals Workbook',
      description: 'Identify 3 Months of SEO Techniques You Can Execute Immediately',
      buttonText: 'Download Now',
      buttonLink: 'https://info.searchinfluence.com/seo-workbook-for-higher-education-websites/',
    },
    {
      image: '/images/custom-seo-roadmap.png',
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
