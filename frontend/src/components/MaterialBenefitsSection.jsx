import { Section } from './Section.jsx'

export function MaterialBenefitsSection({ composition, feature, overview }) {
  return (
    <Section
      description="Термопанели помогают совместить утепление фасада, аккуратную облицовку и более понятный по срокам монтаж."
      eyebrow="Преимущества"
      id="benefits"
      title="Что дают термопанели фасаду дома"
    >
      <div className="benefits-layout">
        <div className="benefits-media">
          <img
            alt="Термопанели для фасада дома"
            className="benefits-media__image"
            src={feature.image}
          />
          <div className="benefits-media__caption">
            <h3 className="benefits-media__title">{feature.title}</h3>
            <p className="benefits-media__text">{feature.text}</p>
          </div>
        </div>

        <div className="benefits-content">
          <div className="benefits-copy">
            {overview.map((paragraph) => (
              <p className="benefits-copy__paragraph" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="composition-list" aria-label="Состав и материалы">
            {composition.map((item) => (
              <span className="composition-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
