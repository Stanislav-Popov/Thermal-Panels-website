import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'
import { Section } from './Section.jsx'

export function FacadeGallerySection({
  description = '',
  examples,
  eyebrow = '',
  footerActionHref = sectionTextDefaults.gallery.ctaHref,
  footerActionLabel = sectionTextDefaults.gallery.ctaLabel,
  hint = '',
  title = sectionTextDefaults.gallery.title,
}) {
  const galleryItems = useMemo(() => examples, [examples])
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
              key={`${item.image}-${item.title}`}
            >
              <img
                alt={item.title}
                className="gallery-card__image"
                src={item.image}
              />
            </article>
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
