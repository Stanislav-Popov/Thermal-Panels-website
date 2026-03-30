import { useEffect, useState } from 'react'

export function HeroSection({
  actions,
  eyebrow = 'Термопанели для фасада',
  image,
  lead = 'Фактуры под кирпич, варианты цвета и понятный путь к предварительному расчёту стоимости.',
  title = 'Утепление и облицовка фасада в одном решении',
}) {
  const [scrollRatio, setScrollRatio] = useState(0)

  useEffect(() => {
    let frameId = 0

    const updateScroll = () => {
      const nextRatio = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1)
      setScrollRatio(nextRatio)
      frameId = 0
    }

    const handleScroll = () => {
      if (frameId !== 0) {
        return
      }

      frameId = window.requestAnimationFrame(updateScroll)
    }

    updateScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const primaryAction = actions[0]
  const imageStyle = {
    transform: `translate3d(0, ${scrollRatio * 8}%, 0) scale(${1.08 + scrollRatio * 0.06})`,
  }
  const contentStyle = {
    transform: `translate3d(0, ${scrollRatio * -18}px, 0)`,
    opacity: Math.max(1 - scrollRatio * 0.45, 0.64),
  }

  return (
    <section className="hero-section" id="top">
      <div className="hero">
        <img
          alt="Дом с отделкой фасада термопанелями"
          className="hero__image"
          src={image}
          style={imageStyle}
        />
        <div className="hero__overlay">
          <div className="layout-container hero__content">
            <div className="hero__stage" style={contentStyle}>
              <div className="hero__simple">
                <p className="hero__eyebrow">{eyebrow}</p>
                <h1 className="hero__title">{title}</h1>
                <p className="hero__lead">{lead}</p>
                <a
                  className={`hero__action hero__action--${primaryAction.variant} hero__action--single`}
                  href={primaryAction.href}
                >
                  {primaryAction.label}
                </a>
              </div>

              <div className="hero__scroll-indicator" aria-hidden="true">
                <span className="hero__scroll-line" />
                <span className="hero__scroll-text">Листайте ниже</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
