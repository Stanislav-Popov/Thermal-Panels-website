const RESERVE_RATE = 0.07

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('ru-RU')

function roundNumber(value) {
  return Number(value.toFixed(2))
}

export function formatCalculatorPrice(value) {
  return priceFormatter.format(value)
}

export function formatCalculatorSquareMeters(value) {
  return `${decimalFormatter.format(value)} м²`
}

export function formatCalculatorInteger(value) {
  return integerFormatter.format(value)
}

export function getCalculatorAreaValidationMessage(areaValue, hasInteracted) {
  if (!hasInteracted) {
    return ''
  }

  const normalizedValue =
    typeof areaValue === 'string' ? areaValue.trim() : String(areaValue ?? '').trim()

  if (!normalizedValue) {
    return 'Укажите площадь фасада.'
  }

  const numericValue = Number(normalizedValue)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 'Площадь должна быть больше 0 м².'
  }

  return ''
}

export function createCalculatorEstimate(product, facadeArea) {
  if (!product) {
    return null
  }

  const parsedArea = Number(facadeArea)

  if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
    return null
  }

  const reserveArea = parsedArea * RESERVE_RATE
  const areaWithReserve = parsedArea + reserveArea
  const panelCount = Math.ceil(areaWithReserve / product.panelArea)
  const coveredArea = panelCount * product.panelArea
  const totalCost = roundNumber(coveredArea * product.priceCurrent)

  return {
    coveredArea: roundNumber(coveredArea),
    facadeArea: roundNumber(parsedArea),
    panelCount,
    pricePerSquareMeter: product.priceCurrent,
    productSlug: product.slug,
    totalCost,
  }
}
