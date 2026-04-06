import { Section } from './Section.jsx'

export function SelfInstallSection({ content }) {
  const normalizedVideoUrl =
    typeof content.videoUrl === 'string' ? content.videoUrl.trim() : ''
  const overlayClassName = normalizedVideoUrl
    ? 'install-media__overlay install-media__overlay--video'
    : 'install-media__overlay'

  return (
    <Section
      description={content.description ?? ''}
      eyebrow={content.eyebrow ?? ''}
      id="self-install"
      title={content.title ?? 'Монтаж можно выполнить самостоятельно'}
    >
      <div className="install-grid">
        <div className="install-media">
          {normalizedVideoUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="install-media__video"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={normalizedVideoUrl}
              title={content.videoLabel ?? 'Видео по самостоятельному монтажу'}
            />
          ) : (
            <img
              alt="Монтаж фасадных термопанелей"
              className="install-media__image"
              src={content.image}
            />
          )}
          <div className={overlayClassName}>
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
