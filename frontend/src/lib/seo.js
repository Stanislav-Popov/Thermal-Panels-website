const priceFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

export const brandName = 'Thermal Panels'
export const defaultSeoDescription =
  'Thermal Panels: декоративные термопанели для утепления и облицовки фасада, каталог фактур, предварительный калькулятор стоимости и быстрые контакты.'
export const defaultSeoImagePath = '/media/content/hero-block.webp'
export const defaultSeoTitle = `Термопанели для фасада | ${brandName}`

export function normalizeSiteUrl(value) {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : ''
}

export function buildAbsoluteUrl(siteUrl, pathname = '/') {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const normalizedPathname =
    typeof pathname === 'string' && pathname.trim() ? pathname.trim() : '/'

  if (!normalizedSiteUrl) {
    return normalizedPathname
  }

  if (/^https?:\/\//i.test(normalizedPathname)) {
    return normalizedPathname
  }

  return `${normalizedSiteUrl}${normalizedPathname.startsWith('/') ? normalizedPathname : `/${normalizedPathname}`}`
}

export function getProductPagePath(slug) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : ''
  return normalizedSlug ? `/catalog/${normalizedSlug}` : '/catalog'
}

export function readProductSlugFromPathname(pathname) {
  const normalizedPathname =
    typeof pathname === 'string' ? pathname.replace(/\/+$/, '') || '/' : '/'
  const match = normalizedPathname.match(/^\/catalog\/([^/]+)$/i)
  return match ? decodeURIComponent(match[1]) : ''
}

export function getProductPrimaryImage(product) {
  return product?.gallery?.[0]?.image || defaultSeoImagePath
}

function formatPrice(value) {
  return priceFormatter.format(value)
}

export function getProductSeoTitle(product) {
  if (!product?.name) {
    return defaultSeoTitle
  }

  return `${product.name} | Каталог термопанелей | ${brandName}`
}

export function getProductSeoDescription(product) {
  if (!product) {
    return defaultSeoDescription
  }

  const details = [
    product.texture ? `${product.texture} фактура` : '',
    product.thickness ? `толщина ${product.thickness}` : '',
    Number.isFinite(product.priceCurrent)
      ? `цена от ${formatPrice(product.priceCurrent)} ₽/м²`
      : '',
  ].filter(Boolean)

  const productLead = details.length > 0 ? `${details.join(', ')}.` : ''
  const shortDescription =
    typeof product.shortDescription === 'string'
      ? product.shortDescription.trim()
      : ''

  return [productLead, shortDescription].filter(Boolean).join(' ')
}
