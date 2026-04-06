import { Section } from './Section.jsx'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'

export function ProductOverviewSection({
  badges = [],
  blocks,
  ctaHref = sectionTextDefaults.productOverview.ctaHref,
  ctaLabel = sectionTextDefaults.productOverview.ctaLabel,
  composition = [],
  description = '',
  eyebrow = '',
  feature,
  overview,
  title = sectionTextDefaults.productOverview.title,
}) {
  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="benefits"
      title={title}
    >
      <div className="product-overview">
        <div className="product-overview__media">
          <img
            alt="Термопанели для фасада дома"
            className="product-overview__image"
            src={feature.image}
          />

          {badges.length > 0 ? (
            <div className="product-overview__floating">
              {badges.map((badge) => (
                <span className="product-overview__badge" key={badge}>
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-overview__content">
          <div className="product-overview__intro">
            <h3 className="product-overview__title">{feature.title}</h3>
            {feature.locationNote ? (
              <p className="product-overview__paragraph">
                <strong>{feature.locationNote}</strong>
              </p>
            ) : null}
            {feature.text ? (
              <p className="product-overview__paragraph">{feature.text}</p>
            ) : null}
            {overview.map((paragraph) => (
              <p className="product-overview__paragraph" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="product-outline">
            {blocks.map((block) => (
              <article className="product-outline__item" key={block.title}>
                <h3 className="product-outline__title">{block.title}</h3>
                <p className="product-outline__text">{block.text}</p>
              </article>
            ))}
          </div>

          {composition.length > 0 ? (
            <div className="composition-list" aria-label="Состав и материалы">
              {composition.map((item) => (
                <span className="composition-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div className="product-overview__actions">
            <a className="button-link" href={ctaHref}>
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
