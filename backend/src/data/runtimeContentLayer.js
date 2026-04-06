import {
  defaultContactChannelConfigs,
  legacyHeroText,
  sectionTextDefaults,
} from '../../../shared/siteTextDefaults.js'

export const publicFallbackAssets = {
  galleryClinker: '/media/products/product-3/product-3-2.webp',
  galleryContrastFacade: '/media/gallery/Panel-and-facade-options-5.webp',
  galleryGranular: '/media/products/product-1/product-1-2.webp',
  galleryLightFacade: '/media/gallery/Panel-and-facade-options-4.webp',
  galleryPalette: '/media/gallery/Panel-and-facade-options-3.webp',
  gallerySmooth: '/media/products/product-2/product-2-2.webp',
  hero: '/media/content/hero-block.webp',
  productFeature:
    '/media/content/What-is-important-to-know-about-thermalpanels-block.webp',
  productHouseExample: '/media/fallback/product-house-example.svg',
  productPanelCloseup: '/media/fallback/product-panel-closeup.svg',
  productPanelFar: '/media/fallback/product-panel-far.svg',
  productPanelSide: '/media/fallback/product-panel-side.svg',
  selfInstall: '/media/fallback/self-install-scene.svg',
  showcaseContrast: '/media/gallery/Panel-and-facade-options-2.webp',
  showcaseLight: '/media/gallery/Panel-and-facade-options-1.webp',
}

const legacyPlaceholderImagePaths = new Set(['/placeholder.jpg'])
const legacyFallbackAssetPrefixes = ['/media/fallback/']
const placeholderExternalUrls = new Set([
  'https://telegram.org',
  'https://telegram.org/',
  'https://vk.com',
  'https://vk.com/',
])

const productGalleryFallbackAssetsBySlug = {
  'clinker-graphite-ice': {
    closeup: '/media/products/product-3/product-3-2.webp',
    facade: '/media/products/product-3/product-3-4.webp',
    far: '/media/products/product-3/product-3-1.webp',
    side: '/media/products/product-3/product-3-3.webp',
  },
  'granit-light-sand': {
    closeup: '/media/products/product-1/product-1-2.webp',
    facade: '/media/products/product-1/product-1-4.webp',
    far: '/media/products/product-1/product-1-1.webp',
    side: '/media/products/product-1/product-1-3.webp',
  },
  'smooth-milk-graphite': {
    closeup: '/media/products/product-2/product-2-2.webp',
    facade: '/media/products/product-2/product-2-4.webp',
    far: '/media/products/product-2/product-2-1.webp',
    side: '/media/products/product-2/product-2-3.webp',
  },
  'smooth-warm-stone': {
    closeup: '/media/products/product-4/product-4-2.webp',
    facade: '/media/products/product-4/product-4-4.webp',
    far: '/media/products/product-4/product-4-1.webp',
    side: '/media/products/product-4/product-4-3.webp',
  },
}

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

function normalizeComparableText(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim()
}

function isExactLegacyText(value, expected) {
  return normalizeText(value) === expected
}

function matchesLegacyVariant(value, variants) {
  const normalizedValue = normalizeComparableText(value)

  if (!normalizedValue || !Array.isArray(variants)) {
    return false
  }

  return variants.some(
    (variant) => normalizeComparableText(variant) === normalizedValue
  )
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

function mergeDefaultContactChannels(channels) {
  const normalizedChannels = Array.isArray(channels) ? channels : []
  const existingKeys = new Set(
    normalizedChannels.map((item) => normalizeText(item?.key)).filter(Boolean)
  )

  return [
    ...normalizedChannels,
    ...defaultContactChannelConfigs
      .filter((item) => !existingKeys.has(item.key))
      .map((item) => ({ ...item })),
  ]
}

function isLegacyFallbackAssetPath(value) {
  return legacyFallbackAssetPrefixes.some((prefix) => value.startsWith(prefix))
}

export function isLegacyPlaceholderImagePath(value) {
  const normalizedValue = normalizeText(value)
  return (
    legacyPlaceholderImagePaths.has(normalizedValue) ||
    isLegacyFallbackAssetPath(normalizedValue)
  )
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

function inferProductGalleryFallbackAsset(productSlug, imageKind, sortOrder) {
  const galleryAssets =
    productGalleryFallbackAssetsBySlug[normalizeText(productSlug).toLowerCase()] ??
    null
  const normalizedKind = normalizeText(imageKind).toLowerCase()
  const inferredSlot =
    normalizedKind.includes('круп') || normalizedKind.includes('close')
      ? 'closeup'
      : normalizedKind.includes('сбок') || normalizedKind.includes('side')
        ? 'side'
        : normalizedKind.includes('фасад') || normalizedKind.includes('дом')
          ? 'facade'
          : normalizedKind.includes('далек') ||
              normalizedKind.includes('общий') ||
              normalizedKind.includes('общ')
            ? 'far'
            : ''

  if (!galleryAssets) {
    if (inferredSlot === 'closeup') {
      return publicFallbackAssets.productPanelCloseup
    }

    if (inferredSlot === 'side') {
      return publicFallbackAssets.productPanelSide
    }

    if (inferredSlot === 'facade') {
      return publicFallbackAssets.productHouseExample
    }

    return publicFallbackAssets.productPanelFar
  }

  if (inferredSlot && galleryAssets[inferredSlot]) {
    return galleryAssets[inferredSlot]
  }

  switch (Number(sortOrder)) {
    case 1:
      return galleryAssets.closeup
    case 2:
      return galleryAssets.side
    case 3:
      return galleryAssets.facade
    default:
      return galleryAssets.far
  }
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

export function resolveProductImagePath(pathname, imageKind, options = {}) {
  return resolveImagePath(
    pathname,
    inferProductGalleryFallbackAsset(
      options.productSlug,
      imageKind,
      options.sortOrder
    )
  )
}

export function stripLegacySiteContentBlockCopy(block) {
  const extraData = { ...(block.extraData ?? {}) }
  let title = block.title
  let subtitle = block.subtitle
  let body = block.body

  switch (block.blockKey) {
    case 'hero':
      if (
        matchesLegacyVariant(title, legacyHeroText.titleVariants) ||
        matchesLegacyVariant(title, legacyHeroText.bodyVariants)
      ) {
        title = sectionTextDefaults.hero.title
      }

      if (
        matchesLegacyVariant(subtitle, legacyHeroText.subtitleVariants) ||
        matchesLegacyVariant(subtitle, legacyHeroText.titleVariants) ||
        matchesLegacyVariant(subtitle, legacyHeroText.bodyVariants)
      ) {
        subtitle = sectionTextDefaults.hero.subtitle
      }

      if (
        matchesLegacyVariant(body, legacyHeroText.bodyVariants) ||
        matchesLegacyVariant(body, legacyHeroText.titleVariants)
      ) {
        body = sectionTextDefaults.hero.body
      }
      delete extraData.actions
      delete extraData.facts
      delete extraData.highlights
      break
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
      if (isExactLegacyText(title, 'Варианты панелей и фасадов')) {
        title = sectionTextDefaults.gallery.title
      }

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

      delete extraData.cards
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

      delete extraData.installationOptions
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
    title,
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
      delete extraData.cards
      break
    case 'self-install':
      extraData.image = resolveImagePath(
        extraData.image,
        publicFallbackAssets.selfInstall
      )
      extraData.videoUrl = normalizeText(extraData.videoUrl)
      break
    case 'contacts':
      extraData.channels = mergeDefaultContactChannels(extraData.channels)
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
