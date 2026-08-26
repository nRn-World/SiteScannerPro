import React from 'react';

interface LegalPageProps {
  title: string;
  updated: string;
  sections: Array<{ heading: string; body: string }>;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, updated, sections }) => {
  return (
    <article className="max-w-3xl mx-auto">
      <p className="eyebrow mb-4">{updated}</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">{title}</h1>
      <div className="space-y-8">
        {sections.map(section => (
          <section key={section.heading} className="surface-card p-6 md:p-8">
            <h2 className="font-display text-xl font-bold mb-3">{section.heading}</h2>
            <p className="text-muted leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
};

export default LegalPage;
