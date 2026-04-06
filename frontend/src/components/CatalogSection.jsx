import { useEffect, useState } from 'react'
import { getProductPagePath } from '../lib/seo.js'
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
  activeProductSlug = '',
  contacts = null,
  ctaHref = sectionTextDefaults.catalog.ctaHref,
  ctaLabel = sectionTextDefaults.catalog.ctaLabel,
  description = '',
  error = '',
  eyebrow = '',
  isLoading = false,
  onCloseProduct = null,
  onOpenProduct = null,
  products,
  title = sectionTextDefaults.catalog.title,
}) {
  const [galleryState, setGalleryState] = useState({
    productSlug: '',
    photoIndex: 0,
  })
  const activeProduct =
    activeProductSlug && Array.isArray(products)
      ? products.find((product) => product.slug === activeProductSlug) ?? null
      : null
  const activePhotoIndex =
    galleryState.productSlug === activeProductSlug ? galleryState.photoIndex : 0
  const activeGallery = getProductGallery(activeProduct)
  const activeImage = activeGallery[activePhotoIndex] ?? activeGallery[0]
  const phoneHref = contacts?.phoneHref ?? '#contacts'

  const closeProduct = () => {
    setGalleryState({
      photoIndex: 0,
      productSlug: '',
    })
    onCloseProduct?.()
  }

  useEffect(() => {
    if (!activeProduct) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setGalleryState({
          photoIndex: 0,
          productSlug: '',
        })
        onCloseProduct?.()
      }
    }

    document.body.classList.add('body--locked')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('body--locked')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProduct, onCloseProduct])

  const handleEstimateLink = (slug, shouldCloseModal = false) => {
    window.dispatchEvent(
      new CustomEvent('calculator:select-product', {
        detail: { slug },
      })
    )

    if (shouldCloseModal) {
      closeProduct()
    }
  }

  const activeDiscount = activeProduct ? getProductDiscount(activeProduct) : null

  const handleProductLinkClick = (event, slug) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }

    event.preventDefault()
    setGalleryState({
      photoIndex: 0,
      productSlug: slug,
    })
    onOpenProduct?.(slug)
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
                <article className="catalog-card" key={product.slug}>
                  <a
                    aria-label={`Открыть описание товара ${product.name}`}
                    className="catalog-card__link"
                    href={getProductPagePath(product.slug)}
                    onClick={(event) => handleProductLinkClick(event, product.slug)}
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
                  </a>
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
        <div className="catalog-modal-backdrop" onClick={closeProduct}>
          <div
            className="catalog-modal-shell"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Закрыть карточку товара"
              className="catalog-modal__close"
              onClick={closeProduct}
              type="button"
            >
              <span aria-hidden="true" className="catalog-modal__close-icon">
                ×
              </span>
            </button>

            <div
              aria-labelledby="catalog-modal-title"
              aria-modal="true"
              className="catalog-modal"
              role="dialog"
            >
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
                          onClick={() =>
                            setGalleryState({
                              photoIndex: index,
                              productSlug: activeProduct.slug,
                            })
                          }
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
        </div>
      ) : null}
    </Section>
  )
}
