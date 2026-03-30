import { Section } from './Section.jsx'

export function SelfInstallSection({ content }) {
  return (
    <Section
      description={content.description ?? ''}
      eyebrow={content.eyebrow ?? ''}
      id="self-install"
      title={content.title ?? 'Монтаж можно выполнить самостоятельно'}
    >
      <div className="install-grid">
        <div className="install-media">
          <img
            alt="Монтаж фасадных термопанелей"
            className="install-media__image"
            src={content.image}
          />
          <div className="install-media__overlay">
            <span aria-hidden="true" className="install-media__play">
              ▶
            </span>
            <div>
              <p className="install-media__label">
                {content.videoLabel ?? 'Видео по самостоятельному монтажу'}
              </p>
              <p className="install-media__text">
                {content.mediaText ??
                  'Коротко покажем основные этапы установки, подрезки и аккуратной посадки панели на фасад.'}
              </p>
            </div>
          </div>
        </div>

        <article className="install-card">
          {content.body ? (
            <p className="install-card__text">{content.body}</p>
          ) : null}

          <ul className="install-card__list">
            {content.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <a className="button-link" href={content.ctaHref ?? '#contacts'}>
            {content.ctaLabel ?? 'Получить консультацию'}
          </a>
        </article>
      </div>
    </Section>
  )
}
