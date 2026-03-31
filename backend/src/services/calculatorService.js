import { getPublicProductBySlug } from './catalogService.js'

function roundMoney(value) {
  return Number(value.toFixed(2))
}

export async function createEstimate(input, options = {}) {
  const { productSlug, facadeArea } = input
  const reserveRate = options.reserveRate ?? 0.07
  const parsedArea = Number(facadeArea)

  if (!productSlug) {
    return {
      error: {
        code: 'PRODUCT_REQUIRED',
        message: 'Нужно выбрать товар для расчёта.',
      },
    }
  }

  if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
    return {
      error: {
        code: 'INVALID_AREA',
        message: 'Площадь фасада должна быть числом больше нуля.',
      },
    }
  }

  const product = await getPublicProductBySlug(productSlug)

  if (!product) {
    return {
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Выбранный товар не найден.',
      },
    }
  }

  const reserveArea = parsedArea * reserveRate
  const areaWithReserve = parsedArea + reserveArea
  const panelCount = Math.ceil(areaWithReserve / product.panelArea)
  const coveredArea = panelCount * product.panelArea
  const materialCost = roundMoney(coveredArea * product.priceCurrent)

  return {
    value: {
      product,
      calculation: {
        facadeArea: roundMoney(parsedArea),
        reserveRate,
        reserveArea: roundMoney(reserveArea),
        areaWithReserve: roundMoney(areaWithReserve),
        coveredArea: roundMoney(coveredArea),
        panelCount,
        materialCost,
        totalCost: materialCost,
        isPreliminary: true,
        note:
          'Предварительный расчёт показывает ориентир по материалу. Точное количество зависит от конфигурации фасада, подрезок и узлов.',
      },
    },
  }
}
