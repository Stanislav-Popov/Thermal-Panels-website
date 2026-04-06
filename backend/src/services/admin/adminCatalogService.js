import {
  addProductImage,
  createProduct,
  deleteProduct,
  deleteProductImage,
  findProductById,
  listProducts,
  reorderProductImages,
  updateProduct,
} from '../../repositories/productRepository.js'
import { createHttpError } from '../../utils/httpErrors.js'
import {
  normalizeProductImageInput,
  normalizeProductImageOrderInput,
  normalizeProductInput,
} from './adminValidators.js'

function toPersistenceError(error) {
  if (error?.code === '23505') {
    throw createHttpError(409, 'CONFLICT', 'Запись с таким уникальным значением уже существует.')
  }

  throw error
}

export async function listAdminProducts() {
  return listProducts({
    includeHidden: true,
  })
}

export async function createAdminProduct(payload) {
  try {
    return await createProduct(normalizeProductInput(payload))
  } catch (error) {
    toPersistenceError(error)
  }
}

export async function updateAdminProduct(productId, payload) {
  const normalizedId = Number(productId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор товара.')
  }

  try {
    const product = await updateProduct(normalizedId, normalizeProductInput(payload))

    if (!product) {
      throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.')
    }

    return product
  } catch (error) {
    toPersistenceError(error)
  }
}

export async function deleteAdminProduct(productId) {
  const normalizedId = Number(productId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор товара.')
  }

  const isDeleted = await deleteProduct(normalizedId)

  if (!isDeleted) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.')
  }
}

export async function createAdminProductImage(productId, payload) {
  const normalizedId = Number(productId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор товара.')
  }

  const product = await findProductById(normalizedId, {
    includeHidden: true,
  })

  if (!product) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.')
  }

  return addProductImage(normalizedId, normalizeProductImageInput(payload))
}

export async function reorderAdminProductImages(productId, payload) {
  const normalizedId = Number(productId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор товара.')
  }

  const product = await findProductById(normalizedId, {
    includeHidden: true,
  })

  if (!product) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.')
  }

  const imageIds = normalizeProductImageOrderInput(payload)
  const currentImageIds = product.gallery.map((image) => image.id)
  const isOrderPayloadActual =
    imageIds.length === currentImageIds.length &&
    imageIds.every((imageId) => currentImageIds.includes(imageId))

  if (!isOrderPayloadActual) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Передан неполный или устаревший список фотографий товара.'
    )
  }

  const updatedProduct = await reorderProductImages(normalizedId, imageIds)

  if (!updatedProduct) {
    throw createHttpError(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.')
  }

  return updatedProduct
}

export async function deleteAdminProductImage(productId, imageId) {
  const normalizedProductId = Number(productId)
  const normalizedImageId = Number(imageId)

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор товара.')
  }

  if (!Number.isInteger(normalizedImageId) || normalizedImageId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор изображения.')
  }

  const isDeleted = await deleteProductImage(normalizedProductId, normalizedImageId)

  if (!isDeleted) {
    throw createHttpError(404, 'IMAGE_NOT_FOUND', 'Изображение не найдено.')
  }
}
