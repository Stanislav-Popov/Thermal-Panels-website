import { getPublicProductBySlug } from './catalogService.js'

const allowedInstallationModes = new Set(['self', 'assisted'])

function roundMoney(value) {
  return Number(value.toFixed(2))
}

export async function createEstimate(input, options = {}) {
  const { productSlug, facadeArea, installationMode } = input
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

  if (!allowedInstallationModes.has(installationMode)) {
    return {
      error: {
        code: 'INVALID_INSTALLATION_MODE',
        message: 'Неверно указан сценарий монтажа.',
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
        installationMode,
        installationCostIncluded: false,
        isPreliminary: true,
        note:
          installationMode === 'self'
            ? 'Предварительный расчёт показывает ориентир по материалу. Точное количество зависит от конфигурации фасада, подрезок и узлов.'
            : 'Предварительный расчёт показывает ориентир по материалу. Стоимость монтажа уточняется отдельно после консультации, фото фасада и состава работ.',
      },
    },
  }
}
