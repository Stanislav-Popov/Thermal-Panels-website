import {
  createShowcaseObject,
  deleteShowcaseObject,
  listShowcaseObjects,
  reorderShowcaseObjects,
  updateShowcaseObject,
} from '../../repositories/siteContentRepository.js'
import { createHttpError } from '../../utils/httpErrors.js'
import {
  normalizeShowcaseObjectInput,
  normalizeShowcaseObjectOrderInput,
} from './adminValidators.js'

export async function listAdminShowcaseObjects() {
  return listShowcaseObjects({
    includeUnpublished: true,
  })
}

export async function createAdminShowcaseObject(payload) {
  return createShowcaseObject(normalizeShowcaseObjectInput(payload))
}

export async function updateAdminShowcaseObject(showcaseId, payload) {
  const normalizedId = Number(showcaseId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор объекта.')
  }

  const object = await updateShowcaseObject(
    normalizedId,
    normalizeShowcaseObjectInput(payload)
  )

  if (!object) {
    throw createHttpError(404, 'SHOWCASE_NOT_FOUND', 'Объект не найден.')
  }

  return object
}

export async function deleteAdminShowcaseObject(showcaseId) {
  const normalizedId = Number(showcaseId)

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Некорректный идентификатор объекта.')
  }

  const isDeleted = await deleteShowcaseObject(normalizedId)

  if (!isDeleted) {
    throw createHttpError(404, 'SHOWCASE_NOT_FOUND', 'Объект не найден.')
  }
}

export async function reorderAdminShowcaseObjects(payload) {
  const showcaseIds = normalizeShowcaseObjectOrderInput(payload)
  const currentShowcaseObjects = await listShowcaseObjects({
    includeUnpublished: true,
  })
  const currentShowcaseIds = currentShowcaseObjects.map((item) => item.id)
  const isOrderPayloadActual =
    showcaseIds.length === currentShowcaseIds.length &&
    showcaseIds.every((showcaseId) => currentShowcaseIds.includes(showcaseId))

  if (!isOrderPayloadActual) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Передан неполный или устаревший список фото объектов.'
    )
  }

  return reorderShowcaseObjects(showcaseIds)
}
