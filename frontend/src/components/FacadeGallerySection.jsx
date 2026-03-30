import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Section } from './Section.jsx'

export function FacadeGallerySection({
  cards,
  description = '',
  examples,
  eyebrow = '',
  footerActionHref = '#catalog',
  footerActionLabel = 'Получить каталог',
  hint = '',
  title = 'Варианты панелей и фасадов',
}) {
  const galleryItems = useMemo(
    () => [
      ...cards.map((card) => ({
        type: 'panel',
        title: card.title,
        label: card.meta,
        image: card.image,
      })),
      ...examples.map((example) => ({
        type: 'example',
        title: example.title,
        label: example.texture,
        image: example.image,
      })),
    ],
    [cards, examples]
  )
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const trackNode = trackRef.current

    if (!trackNode) {
      return undefined
    }

    const handleScroll = () => {
      const firstSlide = trackNode.querySelector('.gallery-card')

      if (!firstSlide) {
        return
      }

      const slideWidth = firstSlide.getBoundingClientRect().width + 16
      const nextIndex = Math.round(trackNode.scrollLeft / slideWidth)
      setActiveIndex(Math.max(0, Math.min(nextIndex, galleryItems.length - 1)))
    }

    trackNode.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      trackNode.removeEventListener('scroll', handleScroll)
    }
  }, [galleryItems.length])

  const scrollToCard = useCallback(
    (index, behavior = 'smooth') => {
      const trackNode = trackRef.current

      if (!trackNode) {
        return
      }

      const nextIndex = Math.max(0, Math.min(index, galleryItems.length - 1))
      const targetCard = trackNode.children[nextIndex]

      if (!targetCard) {
        return
      }

      trackNode.scrollTo({
        left: targetCard.offsetLeft,
        behavior,
      })
      setActiveIndex(nextIndex)
    },
    [galleryItems.length]
  )

  useEffect(() => {
    if (galleryItems.length < 2) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % galleryItems.length
      scrollToCard(nextIndex)
    }, 4200)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeIndex, galleryItems.length, scrollToCard])

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="panel-range"
      title={title}
    >
      <div className="gallery-shell">
        {hint ? (
          <div className="gallery-shell__toolbar">
            <div className="gallery-shell__hint">{hint}</div>
          </div>
        ) : null}

        <div className="gallery-track" ref={trackRef}>
          {galleryItems.map((item, index) => (
            <article
              className={`gallery-card${index === activeIndex ? ' gallery-card--active' : ''}`}
              key={`${item.type}-${item.title}`}
            >
              <img
                alt={item.title}
                className="gallery-card__image"
                src={item.image}
              />
              <div className="gallery-card__overlay">
                <span className="gallery-card__badge">
                  {item.type === 'panel' ? 'Панель' : 'Фасад'}
                </span>
                <p className="gallery-card__title">{item.title}</p>
                <p className="gallery-card__meta">{item.label}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="gallery-dots" aria-label="Навигация по карточкам">
          {galleryItems.map((item, index) => (
            <button
              aria-label={`Показать карточку ${item.title}`}
              aria-pressed={index === activeIndex}
              className={`gallery-dots__button${index === activeIndex ? ' gallery-dots__button--active' : ''}`}
              key={`${item.type}-${item.title}`}
              onClick={() => scrollToCard(index)}
              type="button"
            />
          ))}
        </div>

        <div className="gallery-shell__footer">
          <a className="button-link" href={footerActionHref}>
            {footerActionLabel}
          </a>
        </div>
      </div>
    </Section>
  )
}
