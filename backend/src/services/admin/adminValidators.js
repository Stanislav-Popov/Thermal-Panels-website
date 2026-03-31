import { createHttpError } from '../../utils/httpErrors.js'

function normalizeText(value, fieldLabel, { required = true } = {}) {
  if (typeof value !== 'string') {
    if (!required && (value === undefined || value === null)) {
      return ''
    }

    throw createHttpError(400, 'VALIDATION_ERROR', `${fieldLabel} должно быть строкой.`)
  }

  const trimmedValue = value.trim()

  if (required && !trimmedValue) {
    throw createHttpError(400, 'VALIDATION_ERROR', `${fieldLabel} обязательно.`)
  }

  return trimmedValue
}

function normalizeBoolean(value, fieldLabel) {
  if (typeof value !== 'boolean') {
    throw createHttpError(400, 'VALIDATION_ERROR', `${fieldLabel} должно быть true или false.`)
  }

  return value
}

function normalizeNumber(value, fieldLabel, { nullable = false, min = 0 } = {}) {
  if (nullable && (value === null || value === '')) {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue < min) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно быть числом не меньше ${min}.`
    )
  }

  return parsedValue
}

export function normalizeSlug(value) {
  const slug = normalizeText(value, 'Slug')

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Slug должен содержать только латинские буквы в нижнем регистре, цифры и дефисы.'
    )
  }

  return slug
}

export function normalizeProductInput(payload) {
  return {
    slug: normalizeSlug(payload?.slug),
    name: normalizeText(payload?.name, 'Название товара'),
    texture: normalizeText(payload?.texture, 'Фактура'),
    brickColor: normalizeText(payload?.brickColor, 'Цвет кирпича'),
    jointColor: normalizeText(payload?.jointColor, 'Цвет шва'),
    thickness: normalizeText(payload?.thickness, 'Толщина'),
    panelArea: normalizeNumber(payload?.panelArea, 'Площадь панели', { min: 0.01 }),
    priceCurrent: normalizeNumber(payload?.priceCurrent, 'Текущая цена', { min: 0 }),
    priceOld: normalizeNumber(payload?.priceOld, 'Старая цена', {
      nullable: true,
      min: 0,
    }),
    availabilityStatus: normalizeText(payload?.availabilityStatus, 'Статус наличия'),
    shortDescription: normalizeText(payload?.shortDescription, 'Краткое описание'),
    fullDescription: normalizeText(payload?.fullDescription, 'Полное описание'),
    isHidden: normalizeBoolean(payload?.isHidden ?? false, 'Признак скрытия'),
  }
}

export function normalizeProductImageInput(payload) {
  return {
    image: normalizeText(payload?.image, 'Путь к изображению'),
    alt: normalizeText(payload?.alt, 'Alt-текст изображения'),
    kind: normalizeText(payload?.kind, 'Тип изображения'),
    note: normalizeText(payload?.note, 'Подпись изображения'),
    sortOrder: normalizeNumber(payload?.sortOrder ?? 0, 'Порядок сортировки', {
      min: 0,
    }),
  }
}

export function normalizeShowcaseObjectInput(payload) {
  return {
    title: normalizeText(payload?.title, 'Название объекта'),
    texture: normalizeText(payload?.texture, 'Фактура объекта'),
    color: normalizeText(payload?.color, 'Цвет объекта'),
    description: normalizeText(payload?.description, 'Описание объекта'),
    coverImagePath: normalizeText(payload?.coverImagePath, 'Обложка объекта'),
    isPublished: normalizeBoolean(payload?.isPublished ?? false, 'Публикация объекта'),
  }
}

export function normalizeSiteContentBlockInput(blockKey, payload) {
  const normalizedKey = normalizeText(blockKey, 'Ключ блока')
  const extraData = payload?.extraData ?? {}

  if (typeof extraData !== 'object' || extraData === null || Array.isArray(extraData)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'extraData должно быть JSON-объектом.'
    )
  }

  return {
    blockKey: normalizedKey,
    title: normalizeText(payload?.title ?? '', 'Заголовок блока', { required: false }),
    subtitle: normalizeText(payload?.subtitle ?? '', 'Подзаголовок блока', {
      required: false,
    }),
    body: normalizeText(payload?.body ?? '', 'Текст блока', { required: false }),
    ctaLabel: normalizeText(payload?.ctaLabel ?? '', 'Текст CTA', {
      required: false,
    }),
    ctaLink: normalizeText(payload?.ctaLink ?? '', 'Ссылка CTA', {
      required: false,
    }),
    extraData,
  }
}

export function normalizeContactsInput(payload) {
  return {
    phone: normalizeText(payload?.phone, 'Телефон'),
    whatsappUrl: normalizeText(payload?.whatsappUrl, 'Ссылка WhatsApp'),
    telegramUrl: normalizeText(payload?.telegramUrl, 'Ссылка Telegram'),
    maxUrl: normalizeText(payload?.maxUrl ?? '', 'Ссылка Max', { required: false }),
    vkUrl: normalizeText(payload?.vkUrl, 'Ссылка VK'),
    address: normalizeText(payload?.address ?? '', 'Адрес', { required: false }),
    workingHours: normalizeText(payload?.workingHours ?? '', 'График работы', {
      required: false,
    }),
  }
}
