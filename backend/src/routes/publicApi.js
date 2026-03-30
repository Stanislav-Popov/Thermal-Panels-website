import { Router } from 'express'
import { config } from '../config.js'
import {
  getPublicProductBySlug,
  listPublicProducts,
} from '../services/catalogService.js'
import { createEstimate } from '../services/calculatorService.js'
import { getPublicSiteContent } from '../services/siteContentService.js'

export const publicApiRouter = Router()

publicApiRouter.get('/health', (_request, response) => {
  response.json({
    ok: true,
  })
})

publicApiRouter.get('/products', async (_request, response) => {
  response.json({
    items: await listPublicProducts(),
  })
})

publicApiRouter.get('/products/:slug', async (request, response) => {
  const product = await getPublicProductBySlug(request.params.slug)

  if (!product) {
    response.status(404).json({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Товар не найден.',
      },
    })
    return
  }

  response.json(product)
})

publicApiRouter.post('/calculator/estimate', async (request, response) => {
  const result = await createEstimate(request.body ?? {}, {
    reserveRate: config.reserveRate,
  })

  if (result.error) {
    response.status(400).json({
      error: result.error,
    })
    return
  }

  response.json(result.value)
})

publicApiRouter.get('/site-content', async (_request, response) => {
  response.json(await getPublicSiteContent())
})
