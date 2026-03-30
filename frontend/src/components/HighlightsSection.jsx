import { useEffect, useRef, useState } from 'react'
import { Section } from './Section.jsx'

export function HighlightsSection({ cards }) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const trackNode = trackRef.current

    if (!trackNode) {
      return undefined
    }

    const handleScroll = () => {
      const firstSlide = trackNode.querySelector('.panel-slide')

      if (!firstSlide) {
        return
      }

      const slideWidth = firstSlide.getBoundingClientRect().width + 16
      const nextIndex = Math.round(trackNode.scrollLeft / slideWidth)
      setActiveIndex(Math.max(0, Math.min(nextIndex, cards.length - 1)))
    }

    trackNode.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      trackNode.removeEventListener('scroll', handleScroll)
    }
  }, [cards.length])

  const scrollToCard = (index) => {
    const trackNode = trackRef.current

    if (!trackNode) {
      return
    }

    const nextIndex = Math.max(0, Math.min(index, cards.length - 1))
    const targetCard = trackNode.children[nextIndex]

    if (!targetCard) {
      return
    }

    targetCard.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
    setActiveIndex(nextIndex)
  }

  return (
    <Section
      description="Покажите больше самого продукта: фактуру, крупный план панели и характер фасада."
      eyebrow="Варианты панелей"
      id="panel-range"
      title="Фактуры и цветовые решения для фасада"
    >
      <div className="panel-carousel">
        <div className="panel-carousel__topbar">
          <div className="panel-carousel__hint">
            Листайте карточки, чтобы посмотреть фактуры и варианты подачи.
          </div>

          <div className="panel-carousel__controls">
            <button
              aria-label="Предыдущая карточка"
              className="panel-carousel__button"
              onClick={() => scrollToCard(activeIndex - 1)}
              type="button"
            >
              Назад
            </button>
            <button
              aria-label="Следующая карточка"
              className="panel-carousel__button panel-carousel__button--accent"
              onClick={() => scrollToCard(activeIndex + 1)}
              type="button"
            >
              Далее
            </button>
          </div>
        </div>

        <div className="panel-carousel__track" ref={trackRef}>
          {cards.map((card, index) => (
            <article
              className={`panel-slide${index === activeIndex ? ' panel-slide--active' : ''}`}
              key={card.title}
            >
              <img
                alt={card.title}
                className="panel-slide__image"
                src={card.image}
              />
              <div className="panel-slide__overlay">
                <p className="panel-slide__meta">{card.meta}</p>
                <h3 className="panel-slide__title">{card.title}</h3>
                <div className="panel-slide__tags">
                  {card.tags.slice(0, 2).map((tag) => (
                    <span className="panel-slide__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <a className="panel-slide__link" href={card.actionHref}>
                  {card.actionLabel}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="panel-carousel__dots" aria-label="Навигация по карточкам">
          {cards.map((card, index) => (
            <button
              aria-label={`Показать карточку ${card.title}`}
              aria-pressed={index === activeIndex}
              className={`panel-carousel__dot${index === activeIndex ? ' panel-carousel__dot--active' : ''}`}
              key={card.title}
              onClick={() => scrollToCard(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
