export const publicFallbackAssets = {
  galleryClinker: '/media/fallback/gallery-clinker-texture.svg',
  galleryContrastFacade: '/media/fallback/gallery-contrast-facade.svg',
  galleryGranular: '/media/fallback/gallery-granular-texture.svg',
  galleryLightFacade: '/media/fallback/gallery-light-facade.svg',
  galleryPalette: '/media/fallback/gallery-color-palette.svg',
  gallerySmooth: '/media/fallback/gallery-smooth-texture.svg',
  hero: '/media/fallback/hero-facade-scene.svg',
  productFeature: '/media/fallback/product-feature-board.svg',
  productHouseExample: '/media/fallback/product-house-example.svg',
  productPanelCloseup: '/media/fallback/product-panel-closeup.svg',
  productPanelFar: '/media/fallback/product-panel-far.svg',
  productPanelSide: '/media/fallback/product-panel-side.svg',
  selfInstall: '/media/fallback/self-install-scene.svg',
  showcaseContrast: '/media/fallback/gallery-contrast-facade.svg',
  showcaseLight: '/media/fallback/gallery-light-facade.svg',
}

const legacyPlaceholderImagePaths = new Set(['/placeholder.jpg'])
const placeholderExternalUrls = new Set([
  'https://telegram.org',
  'https://telegram.org/',
  'https://vk.com',
  'https://vk.com/',
])

const legacyProductOverviewBadges = new Set([
  'Утепление',
  'Облицовка',
  'Фактуры и цвета',
])

const legacyProductOverviewComposition = new Set([
  'Мраморная крошка',
  'Дисперсии',
  'Утепляющий слой',
  'Декоративное покрытие',
  'Форматы под разные фактуры',
])

const upgradedSelfInstallBody =
  'Монтаж термопанелей — это понятный и последовательный процесс, который можно выполнить самостоятельно после консультации и расчёта.'

const upgradedPartnersBody =
  'Работаем с партнёрами, которым важно стабильное качество, понятные условия и предсказуемый результат на объектах.'

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isExactLegacyText(value, expected) {
  return normalizeText(value) === expected
}

function startsWithLegacyText(value, expectedPrefix) {
  return normalizeText(value).startsWith(expectedPrefix)
}

function filterLegacyItems(items, legacyItems) {
  if (!Array.isArray(items)) {
    return items
  }

  return items.filter((item) => !legacyItems.has(normalizeText(item)))
}

export function isLegacyPlaceholderImagePath(value) {
  const normalizedValue = normalizeText(value)
  return legacyPlaceholderImagePaths.has(normalizedValue)
}

export function isPlaceholderExternalUrl(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue ? placeholderExternalUrls.has(normalizedValue) : false
}

export function sanitizePublicExternalUrl(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue && !isPlaceholderExternalUrl(normalizedValue)
    ? normalizedValue
    : ''
}

function resolveImagePath(pathname, fallbackAssetPath) {
  const normalizedPathname = normalizeText(pathname)

  if (!normalizedPathname || isLegacyPlaceholderImagePath(normalizedPathname)) {
    return fallbackAssetPath
  }

  return normalizedPathname
}

function inferGalleryFallbackAsset(card = {}) {
  const subject = `${normalizeText(card.title)} ${normalizeText(card.meta)}`.toLowerCase()

  if (subject.includes('зернист')) {
    return publicFallbackAssets.galleryGranular
  }

  if (subject.includes('гладк')) {
    return publicFallbackAssets.gallerySmooth
  }

  if (subject.includes('клинкер')) {
    return publicFallbackAssets.galleryClinker
  }

  if (subject.includes('контраст')) {
    return publicFallbackAssets.galleryContrastFacade
  }

  if (subject.includes('светл')) {
    return publicFallbackAssets.galleryLightFacade
  }

  return publicFallbackAssets.galleryPalette
}

export function resolveGalleryCardImagePath(pathname, card) {
  return resolveImagePath(pathname, inferGalleryFallbackAsset(card))
}

export function resolveShowcaseImagePath(pathname, showcaseObject = {}) {
  const showcaseSubject = `${normalizeText(showcaseObject.title)} ${normalizeText(
    showcaseObject.texture
  )}`.toLowerCase()

  const fallbackAssetPath =
    showcaseSubject.includes('контраст') || showcaseSubject.includes('клинкер')
      ? publicFallbackAssets.showcaseContrast
      : publicFallbackAssets.showcaseLight

  return resolveImagePath(pathname, fallbackAssetPath)
}

export function resolveProductImagePath(pathname, imageKind) {
  const normalizedKind = normalizeText(imageKind).toLowerCase()

  if (normalizedKind.includes('круп')) {
    return resolveImagePath(pathname, publicFallbackAssets.productPanelCloseup)
  }

  if (normalizedKind.includes('сбок')) {
    return resolveImagePath(pathname, publicFallbackAssets.productPanelSide)
  }

  if (normalizedKind.includes('фасад') || normalizedKind.includes('дом')) {
    return resolveImagePath(pathname, publicFallbackAssets.productHouseExample)
  }

  return resolveImagePath(pathname, publicFallbackAssets.productPanelFar)
}

export function stripLegacySiteContentBlockCopy(block) {
  const extraData = { ...(block.extraData ?? {}) }
  let subtitle = block.subtitle
  let body = block.body

  switch (block.blockKey) {
    case 'product-overview':
      if (isExactLegacyText(subtitle, 'Преимущества и описание')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(
          body,
          'Собрали в одном месте главное о материале'
        )
      ) {
        body = ''
      }

      extraData.badges = filterLegacyItems(
        extraData.badges,
        legacyProductOverviewBadges
      )
      extraData.composition = filterLegacyItems(
        extraData.composition,
        legacyProductOverviewComposition
      )
      break
    case 'why-us':
      if (isExactLegacyText(subtitle, 'Почему мы')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(
          body,
          'Делаем акцент на технологии производства'
        )
      ) {
        body = ''
      }
      break
    case 'gallery':
      if (isExactLegacyText(subtitle, 'Фактуры и объекты')) {
        subtitle = ''
      }

      if (startsWithLegacyText(body, 'Крупные фото, фактуры панелей')) {
        body = ''
      }

      if (
        startsWithLegacyText(
          extraData.hint,
          'Галерея пролистывается автоматически'
        )
      ) {
        extraData.hint = ''
      }
      break
    case 'catalog':
      if (isExactLegacyText(subtitle, 'Каталог')) {
        subtitle = ''
      }

      if (startsWithLegacyText(body, 'В каталоге собраны')) {
        body = ''
      }
      break
    case 'calculator':
      if (isExactLegacyText(subtitle, 'Калькулятор')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(body, 'Выберите панель, укажите площадь фасада')
      ) {
        body = ''
      }
      break
    case 'self-install':
      if (isExactLegacyText(subtitle, 'Самостоятельный монтаж')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(
          body,
          'После консультации проще оценить объём работ'
        )
      ) {
        body = upgradedSelfInstallBody
      }
      break
    case 'partners':
      if (isExactLegacyText(subtitle, 'Партнёрам')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(
          body,
          'Для партнёров можно обсуждать ассортимент'
        )
      ) {
        body = upgradedPartnersBody
      }
      break
    case 'contacts':
      if (isExactLegacyText(subtitle, 'Контакты')) {
        subtitle = ''
      }

      if (
        startsWithLegacyText(
          body,
          'Если нужен предварительный расчёт, подбор фактуры'
        )
      ) {
        body = ''
      }
      break
    default:
      break
  }

  return {
    ...block,
    subtitle,
    body,
    extraData,
  }
}

export function normalizeSiteContentBlockForPresentation(block) {
  const normalizedBlock = stripLegacySiteContentBlockCopy(block)
  const extraData = { ...(normalizedBlock.extraData ?? {}) }

  switch (normalizedBlock.blockKey) {
    case 'hero':
      extraData.image = resolveImagePath(extraData.image, publicFallbackAssets.hero)
      break
    case 'product-overview':
      extraData.featureImage = resolveImagePath(
        extraData.featureImage,
        publicFallbackAssets.productFeature
      )
      break
    case 'gallery':
      extraData.cards = Array.isArray(extraData.cards)
        ? extraData.cards.map((card) => ({
            ...card,
            image: resolveGalleryCardImagePath(card?.image, card),
          }))
        : []
      break
    case 'self-install':
      extraData.image = resolveImagePath(
        extraData.image,
        publicFallbackAssets.selfInstall
      )
      break
    default:
      break
  }

  return {
    ...normalizedBlock,
    extraData,
  }
}

export function normalizeSiteContentBlockMedia(block) {
  return normalizeSiteContentBlockForPresentation(block)
}
