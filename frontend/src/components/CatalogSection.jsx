import { useEffect, useState } from 'react'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'
import { Section } from './Section.jsx'

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
const fallbackGalleryItem = {
  alt: 'Изображение товара временно недоступно',
  image: '/media/fallback/product-panel-far.svg',
  kind: 'Фото товара',
  note: 'Фотографии товара появятся после публикации карточки в админ-панели.',
}

function getProductDiscount(product) {
  if (!product.priceOld || product.priceOld <= product.priceCurrent) {
    return null
  }

  return Math.round(
    ((product.priceOld - product.priceCurrent) / product.priceOld) * 100
  )
}

function formatArea(value) {
  return `${value.toFixed(2).replace('.', ',')} м²`
}

function formatPrice(value) {
  return priceFormatter.format(value)
}

function getProductGallery(product) {
  return Array.isArray(product?.gallery) && product.gallery.length > 0
    ? product.gallery
    : [fallbackGalleryItem]
}

export function CatalogSection({
  contacts = null,
  ctaHref = sectionTextDefaults.catalog.ctaHref,
  ctaLabel = sectionTextDefaults.catalog.ctaLabel,
  description = '',
  error = '',
  eyebrow = '',
  isLoading = false,
  products,
  title = sectionTextDefaults.catalog.title,
}) {
  const [activeProduct, setActiveProduct] = useState(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const activeGallery = getProductGallery(activeProduct)
  const activeImage = activeGallery[activePhotoIndex] ?? activeGallery[0]
  const phoneHref = contacts?.phoneHref ?? '#contacts'

  useEffect(() => {
    if (!activeProduct) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveProduct(null)
      }
    }

    document.body.classList.add('body--locked')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('body--locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProduct])

  const openProduct = (product) => {
    setActiveProduct(product)
    setActivePhotoIndex(0)
  }

  const handleEstimateLink = (slug, shouldCloseModal = false) => {
    window.dispatchEvent(
      new CustomEvent('calculator:select-product', {
        detail: { slug },
      })
    )

    if (shouldCloseModal) {
      setActiveProduct(null)
    }
  }

  const activeDiscount = activeProduct ? getProductDiscount(activeProduct) : null

  const handleCardKeyDown = (event, product) => {
    if (event.currentTarget !== event.target) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProduct(product)
    }
  }

  if (isLoading) {
    return (
      <Section
        description="Каталог загружается с сервера, чтобы в дальнейшем его можно было перевести на реальные данные и админ-панель."
        eyebrow={eyebrow}
        id="catalog"
        title={title}
      >
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Загружаем товары каталога</h3>
          <p className="catalog-empty__text">
            Подтягиваем позиции и характеристики из backend API.
          </p>
        </div>
      </Section>
    )
  }

  if (error) {
    return (
      <Section
        description="Если каталог временно не загрузился, можно перейти к прямому контакту и уточнить подбор вручную."
        eyebrow={eyebrow}
        id="catalog"
        title={title}
      >
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Не удалось загрузить каталог</h3>
          <p className="catalog-empty__text">{error}</p>
          <a className="catalog-summary__link" href="#contacts">
            Связаться для подбора
          </a>
        </div>
      </Section>
    )
  }

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="catalog"
      title={title}
    >
      <div className="catalog-shell">
        <div className="catalog-summary catalog-summary--actions">
          <a className="catalog-summary__link" href={ctaHref}>
            {ctaLabel}
          </a>
        </div>

        {products.length > 0 ? (
          <div className="catalog-grid">
            {products.map((product) => {
              const discount = getProductDiscount(product)
              const primaryImage = getProductGallery(product)[0]

              return (
                <article
                  aria-label={`Открыть описание товара ${product.name}`}
                  className="catalog-card"
                  key={product.slug}
                  onClick={() => openProduct(product)}
                  onKeyDown={(event) => handleCardKeyDown(event, product)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="catalog-card__media">
                    <img
                      alt={primaryImage.alt}
                      className="catalog-card__image"
                      src={primaryImage.image}
                    />
                  </div>

                  <div className="catalog-card__body">
                    <h3 className="catalog-card__title">{product.name}</h3>

                    <div className="catalog-card__price">
                      <div className="catalog-card__price-group">
                        {discount ? (
                          <span className="catalog-card__price-old">
                            {formatPrice(product.priceOld)}
                          </span>
                        ) : null}
                        <strong className="catalog-card__price-current">
                          {formatPrice(product.priceCurrent)}
                        </strong>
                      </div>
                      <span className="catalog-card__price-note">за м²</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="catalog-empty">
            <h3 className="catalog-empty__title">Каталог пока пуст</h3>
            <p className="catalog-empty__text">
              Товары появятся здесь после публикации в админ-панели.
            </p>
          </div>
        )}
      </div>

      {activeProduct ? (
        <div className="catalog-modal-backdrop" onClick={() => setActiveProduct(null)}>
          <div
            aria-labelledby="catalog-modal-title"
            aria-modal="true"
            className="catalog-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Закрыть карточку товара"
              className="catalog-modal__close"
              onClick={() => setActiveProduct(null)}
              type="button"
            >
              Закрыть
            </button>

            <div className="catalog-modal__layout">
              <div className="catalog-modal__gallery">
                <div className="catalog-modal__main-image-wrap">
                  <img
                    alt={activeImage.alt}
                    className="catalog-modal__main-image"
                    src={activeImage.image}
                  />
                </div>

                {activeGallery.length > 1 ? (
                  <div className="catalog-modal__thumbs" aria-label="Галерея товара">
                    {activeGallery.map((image, index) => (
                      <button
                        aria-label={`Показать фото: ${image.kind}`}
                        aria-pressed={activePhotoIndex === index}
                        className={`catalog-modal__thumb${activePhotoIndex === index ? ' catalog-modal__thumb--active' : ''}`}
                        key={`${activeProduct.slug}-${image.kind}-${index}`}
                        onClick={() => setActivePhotoIndex(index)}
                        type="button"
                      >
                        <img
                          alt={image.alt}
                          className="catalog-modal__thumb-image"
                          src={image.image}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="catalog-modal__content">
                <p className="catalog-modal__eyebrow">{activeProduct.texture}</p>
                <h3 className="catalog-modal__title" id="catalog-modal-title">
                  {activeProduct.name}
                </h3>
                <p className="catalog-modal__text">{activeProduct.fullDescription}</p>

                <div className="catalog-modal__price">
                  <div className="catalog-modal__price-group">
                    {activeDiscount ? (
                      <span className="catalog-modal__price-old">
                        {formatPrice(activeProduct.priceOld)}
                      </span>
                    ) : null}
                    <strong className="catalog-modal__price-current">
                      {formatPrice(activeProduct.priceCurrent)}
                    </strong>
                    <span className="catalog-modal__price-note">за м²</span>
                  </div>
                  <span className="catalog-modal__status">
                    {activeProduct.availabilityStatus}
                  </span>
                </div>

                <dl className="catalog-modal__specs">
                  <div>
                    <dt>Фактура</dt>
                    <dd>{activeProduct.texture}</dd>
                  </div>
                  <div>
                    <dt>Цвет кирпича</dt>
                    <dd>{activeProduct.brickColor}</dd>
                  </div>
                  <div>
                    <dt>Цвет шва</dt>
                    <dd>{activeProduct.jointColor}</dd>
                  </div>
                  <div>
                    <dt>Толщина</dt>
                    <dd>{activeProduct.thickness}</dd>
                  </div>
                  <div>
                    <dt>Площадь панели</dt>
                    <dd>{formatArea(activeProduct.panelArea)}</dd>
                  </div>
                </dl>

                <div className="catalog-modal__cta">
                  <a
                    className="catalog-card__button"
                    href="#calculator"
                    onClick={() => handleEstimateLink(activeProduct.slug, true)}
                  >
                    Рассчитать стоимость своего дома
                  </a>
                  <a
                    className="catalog-card__button catalog-card__button--ghost"
                    href={phoneHref}
                  >
                    Позвонить
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  )
}
