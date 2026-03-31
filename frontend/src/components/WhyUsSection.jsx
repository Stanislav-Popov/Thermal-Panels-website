import { Section } from './Section.jsx'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'

export function WhyUsSection({
  columns,
  description = '',
  eyebrow = '',
  title = sectionTextDefaults.whyUs.title,
}) {
  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="why-us"
      title={title}
    >
      <div className="comparison-grid">
        {columns.map((column) => (
          <article
            className={`comparison-card comparison-card--${column.variant}`}
            key={column.title}
          >
            <h3 className="comparison-card__title">{column.title}</h3>
            <ul className="comparison-card__list">
              {column.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  )
}
