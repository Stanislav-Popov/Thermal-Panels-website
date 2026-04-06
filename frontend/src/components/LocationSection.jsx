import { sectionTextDefaults } from '../content/siteTextDefaults.js'
import { Section } from './Section.jsx'

export function LocationSection({
  address = '',
  mapEmbedSrc = '',
  mapHref = '',
  title = sectionTextDefaults.location.title,
  description = sectionTextDefaults.location.description,
  eyebrow = sectionTextDefaults.location.eyebrow,
  workingHours = '',
}) {
  const normalizedAddress = typeof address === 'string' ? address.trim() : ''
  const normalizedMapHref = typeof mapHref === 'string' ? mapHref.trim() : ''
  const normalizedMapEmbedSrc =
    typeof mapEmbedSrc === 'string' ? mapEmbedSrc.trim() : ''
  const normalizedWorkingHours =
    typeof workingHours === 'string' ? workingHours.trim() : ''

  if (!normalizedAddress || !normalizedMapHref || !normalizedMapEmbedSrc) {
    return null
  }

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="location"
      title={title}
    >
      <div className="location-block">
        <div className="location-block__info">
          <p className="location-block__label">
            {sectionTextDefaults.location.addressLabel}
          </p>
          <h3 className="location-block__address">{normalizedAddress}</h3>
          <p className="location-block__text">
            {sectionTextDefaults.location.addressHint}
          </p>

          {normalizedWorkingHours ? (
            <p className="location-block__hours">
              <span>График</span>
              {normalizedWorkingHours}
            </p>
          ) : null}

          <a
            className="button-link location-block__cta"
            href={normalizedMapHref}
            rel="noreferrer"
            target="_blank"
          >
            {sectionTextDefaults.location.ctaLabel}
          </a>
        </div>

        <div className="location-block__map">
          <iframe
            allowFullScreen
            className="location-block__frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={normalizedMapEmbedSrc}
            title={`Яндекс Карты: ${normalizedAddress}`}
          />
        </div>
      </div>
    </Section>
  )
}
