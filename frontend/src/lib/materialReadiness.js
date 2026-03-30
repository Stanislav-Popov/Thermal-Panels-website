const fallbackAssetPrefixes = ['/media/fallback/']
const legacyPlaceholderAssetPaths = new Set(['/placeholder.jpg'])
const placeholderExternalUrls = new Set([
  'https://telegram.org',
  'https://telegram.org/',
  'https://vk.com',
  'https://vk.com/',
])

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isFallbackAssetPath(value) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return false
  }

  return (
    legacyPlaceholderAssetPaths.has(normalizedValue) ||
    fallbackAssetPrefixes.some((prefix) => normalizedValue.startsWith(prefix))
  )
}

export function isPlaceholderExternalUrl(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue ? placeholderExternalUrls.has(normalizedValue) : false
}

export function hasConfiguredExternalUrl(value) {
  const normalizedValue = normalizeText(value)
  return normalizedValue !== '' && !isPlaceholderExternalUrl(normalizedValue)
}

export function getProductMaterialGapCount(product) {
  return Array.isArray(product?.gallery)
    ? product.gallery.filter((image) => isFallbackAssetPath(image?.image)).length
    : 0
}

export function getShowcaseMaterialGapCount(showcaseObject) {
  return isFallbackAssetPath(showcaseObject?.coverImagePath) ? 1 : 0
}

export function getContactsMaterialGapCount(contacts) {
  if (!contacts) {
    return 0
  }

  const missingLinks = [contacts?.telegramUrl, contacts?.vkUrl].filter(
    (value) => !hasConfiguredExternalUrl(value)
  )

  return missingLinks.length
}

export function getBlockMaterialGapCount(block) {
  const extraData = block?.extraData ?? {}

  switch (block?.blockKey) {
    case 'hero':
      return isFallbackAssetPath(extraData.image) ? 1 : 0
    case 'product-overview':
      return isFallbackAssetPath(extraData.featureImage) ? 1 : 0
    case 'gallery':
      return Array.isArray(extraData.cards)
        ? extraData.cards.filter((card) => isFallbackAssetPath(card?.image)).length
        : 0
    case 'self-install':
      return isFallbackAssetPath(extraData.image) ? 1 : 0
    default:
      return 0
  }
}
