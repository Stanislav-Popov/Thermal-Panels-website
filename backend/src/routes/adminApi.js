import { Router } from 'express'
import { requireAdminAuth } from '../middleware/requireAdminAuth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authenticateAdmin } from '../services/admin/adminAuthService.js'
import {
  createAdminProduct,
  createAdminProductImage,
  deleteAdminProduct,
  deleteAdminProductImage,
  listAdminProducts,
  updateAdminProduct,
} from '../services/admin/adminCatalogService.js'
import {
  getAdminContacts,
  listAdminSiteContentBlocks,
  updateAdminContacts,
  updateAdminSiteContentBlock,
} from '../services/admin/adminContentService.js'
import {
  createAdminShowcaseObject,
  deleteAdminShowcaseObject,
  listAdminShowcaseObjects,
  updateAdminShowcaseObject,
} from '../services/admin/adminShowcaseService.js'
import {
  adminImageUploadMiddleware,
  getUploadedImagePayload,
} from '../services/uploads/uploadService.js'

export const adminApiRouter = Router()

adminApiRouter.post('/auth/login', asyncHandler(async (request, response) => {
  const result = await authenticateAdmin(request.body ?? {})

  if (result.error) {
    response.status(401).json({
      error: result.error,
    })
    return
  }

  response.json(result.value)
}))

adminApiRouter.post(
  '/uploads/images/:scope',
  requireAdminAuth,
  adminImageUploadMiddleware,
  asyncHandler(async (request, response) => {
    response.status(201).json(
      getUploadedImagePayload(request.file, request.params.scope)
    )
  })
)

adminApiRouter.get('/products', requireAdminAuth, asyncHandler(async (_request, response) => {
  response.json({
    items: await listAdminProducts(),
  })
}))

adminApiRouter.post('/products', requireAdminAuth, asyncHandler(async (request, response) => {
  const product = await createAdminProduct(request.body ?? {})
  response.status(201).json(product)
}))

adminApiRouter.put('/products/:id', requireAdminAuth, asyncHandler(async (request, response) => {
  const product = await updateAdminProduct(request.params.id, request.body ?? {})
  response.json(product)
}))

adminApiRouter.delete('/products/:id', requireAdminAuth, asyncHandler(async (request, response) => {
  await deleteAdminProduct(request.params.id)
  response.status(204).send()
}))

adminApiRouter.post('/products/:id/images', requireAdminAuth, asyncHandler(async (request, response) => {
  const image = await createAdminProductImage(request.params.id, request.body ?? {})
  response.status(201).json(image)
}))

adminApiRouter.delete(
  '/products/:productId/images/:imageId',
  requireAdminAuth,
  asyncHandler(async (request, response) => {
    await deleteAdminProductImage(request.params.productId, request.params.imageId)
    response.status(204).send()
  })
)

adminApiRouter.get('/showcase-objects', requireAdminAuth, asyncHandler(async (_request, response) => {
  response.json({
    items: await listAdminShowcaseObjects(),
  })
}))

adminApiRouter.post('/showcase-objects', requireAdminAuth, asyncHandler(async (request, response) => {
  const object = await createAdminShowcaseObject(request.body ?? {})
  response.status(201).json(object)
}))

adminApiRouter.put('/showcase-objects/:id', requireAdminAuth, asyncHandler(async (request, response) => {
  const object = await updateAdminShowcaseObject(request.params.id, request.body ?? {})
  response.json(object)
}))

adminApiRouter.delete('/showcase-objects/:id', requireAdminAuth, asyncHandler(async (request, response) => {
  await deleteAdminShowcaseObject(request.params.id)
  response.status(204).send()
}))

adminApiRouter.get('/site-content', requireAdminAuth, asyncHandler(async (_request, response) => {
  response.json({
    items: await listAdminSiteContentBlocks(),
  })
}))

adminApiRouter.put('/site-content/:blockKey', requireAdminAuth, asyncHandler(async (request, response) => {
  const block = await updateAdminSiteContentBlock(
    request.params.blockKey,
    request.body ?? {}
  )
  response.json(block)
}))

adminApiRouter.get('/contacts', requireAdminAuth, asyncHandler(async (_request, response) => {
  response.json(await getAdminContacts())
}))

adminApiRouter.put('/contacts', requireAdminAuth, asyncHandler(async (request, response) => {
  const contacts = await updateAdminContacts(request.body ?? {})
  response.json(contacts)
}))
