import { Section } from './Section.jsx'

export function PartnersSection({
  description = '',
  eyebrow = '',
  ctaHref = '#contacts',
  ctaLabel = 'Обсудить условия',
  options,
  title = 'Сотрудничество и условия для партнёров',
}) {
  const normalizedOptions = Array.isArray(options) ? options : []

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="partners"
      title={title}
    >
      <div className="partners-layout">
        <article className="partners-lead">
          <span className="partners-lead__badge">B2B и объектные поставки</span>
          <h3 className="partners-lead__title">
            Подберём формат сотрудничества под ваш канал продаж, бригаду или объект
          </h3>
          {description ? (
            <p className="partners-lead__text">{description}</p>
          ) : null}
          <div className="partners-lead__actions">
            <a className="button-link" href={ctaHref}>
              {ctaLabel}
            </a>
          </div>
        </article>

        <div className="partners-stack">
          {normalizedOptions.map((item, index) => (
            <article
              className={`partner-panel${index === 0 ? ' partner-panel--wide' : ''}${index === 1 ? ' partner-panel--accent' : ''}`}
              key={item.title}
            >
              <span className="partner-panel__index">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="partner-panel__title">{item.title}</h3>
              <p className="partner-panel__text">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
