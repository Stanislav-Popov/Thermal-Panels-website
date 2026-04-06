import { createHttpError } from '../../utils/httpErrors.js'

const placeholderExternalUrls = new Set([
  'https://telegram.org',
  'https://telegram.org/',
  'https://vk.com',
  'https://vk.com/',
])

const contactChannelSystemKeys = new Set([
  'phone',
  'whatsapp',
  'telegram',
  'max',
  'vk',
])

const contentBlockExtraDataNormalizers = {
  header: normalizeHeaderExtraData,
  hero: normalizeHeroExtraData,
  'product-overview': normalizeProductOverviewExtraData,
  'why-us': normalizeWhyUsExtraData,
  gallery: normalizeGalleryExtraData,
  catalog: normalizeEmptyExtraData,
  calculator: normalizeEmptyExtraData,
  'self-install': normalizeSelfInstallExtraData,
  partners: normalizePartnersExtraData,
  contacts: normalizeContactsExtraData,
  footer: normalizeFooterExtraData,
}

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
  const slug = normalizeText(value, 'URL товара')

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'URL товара должен содержать только латинские буквы в нижнем регистре, цифры и дефисы.'
    )
  }

  return slug
}

function assertPlainObject(value, fieldLabel) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно быть JSON-объектом.`
    )
  }

  return value
}

function assertKnownObjectKeys(value, fieldLabel, allowedKeys) {
  const unknownKeys = Object.keys(value).filter(
    (key) => !allowedKeys.includes(key)
  )

  if (unknownKeys.length > 0) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} содержит неизвестные поля: ${unknownKeys.join(', ')}.`
    )
  }
}

function normalizeArray(value, fieldLabel, normalizeItem) {
  if (!Array.isArray(value)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно быть массивом.`
    )
  }

  return value.map((item, index) => normalizeItem(item, `${fieldLabel}[${index + 1}]`))
}

function normalizeStringArray(value, fieldLabel) {
  return normalizeArray(value, fieldLabel, (item, itemLabel) =>
    normalizeText(item, itemLabel)
  )
}

function normalizeExternalUrl(value, fieldLabel, { required = true } = {}) {
  const normalizedValue = normalizeText(value, fieldLabel, { required })

  if (!normalizedValue) {
    return ''
  }

  let parsedUrl = null

  try {
    parsedUrl = new URL(normalizedValue)
  } catch {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно быть корректным URL с http:// или https://.`
    )
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно использовать протокол http:// или https://.`
    )
  }

  if (placeholderExternalUrls.has(parsedUrl.href)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} не должно быть служебной ссылкой-заглушкой.`
    )
  }

  return parsedUrl.href
}

function normalizeContentLink(value, fieldLabel, { required = false } = {}) {
  const normalizedValue = normalizeText(value, fieldLabel, { required })

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.startsWith('#') || normalizedValue.startsWith('/')) {
    if (/\s/.test(normalizedValue)) {
      throw createHttpError(
        400,
        'VALIDATION_ERROR',
        `${fieldLabel} не должно содержать пробелы.`
      )
    }

    return normalizedValue
  }

  if (normalizedValue.startsWith('tel:')) {
    if (!/^tel:\+?[0-9()\-.\s]{5,}$/.test(normalizedValue)) {
      throw createHttpError(
        400,
        'VALIDATION_ERROR',
        `${fieldLabel} должно быть корректной tel:-ссылкой.`
      )
    }

    return normalizedValue
  }

  return normalizeExternalUrl(normalizedValue, fieldLabel)
}

function normalizeMediaSource(value, fieldLabel, { required = false } = {}) {
  const normalizedValue = normalizeText(value, fieldLabel, { required })

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.startsWith('/')) {
    if (/\s/.test(normalizedValue)) {
      throw createHttpError(
        400,
        'VALIDATION_ERROR',
        `${fieldLabel} не должно содержать пробелы.`
      )
    }

    return normalizedValue
  }

  return normalizeExternalUrl(normalizedValue, fieldLabel)
}

function normalizeVariant(value, fieldLabel, allowedValues, fallbackValue) {
  const normalizedValue = normalizeText(value ?? fallbackValue, fieldLabel)

  if (!allowedValues.includes(normalizedValue)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      `${fieldLabel} должно быть одним из значений: ${allowedValues.join(', ')}.`
    )
  }

  return normalizedValue
}

function normalizeMenuItem(item, fieldLabel) {
  const normalizedItem = assertPlainObject(item, fieldLabel)
  assertKnownObjectKeys(normalizedItem, fieldLabel, ['href', 'label'])

  return {
    href: normalizeContentLink(normalizedItem.href, `${fieldLabel}: ссылка`, {
      required: true,
    }),
    label: normalizeText(normalizedItem.label, `${fieldLabel}: текст`),
  }
}

function normalizeActionItem(item, fieldLabel) {
  const normalizedItem = assertPlainObject(item, fieldLabel)
  assertKnownObjectKeys(normalizedItem, fieldLabel, [
    'external',
    'href',
    'label',
    'variant',
  ])

  return {
    external: normalizeBoolean(
      normalizedItem.external ?? false,
      `${fieldLabel}: внешняя ссылка`
    ),
    href: normalizeContentLink(normalizedItem.href, `${fieldLabel}: ссылка`, {
      required: true,
    }),
    label: normalizeText(normalizedItem.label, `${fieldLabel}: текст`),
    variant: normalizeVariant(
      normalizedItem.variant,
      `${fieldLabel}: вариант кнопки`,
      ['primary', 'secondary'],
      'secondary'
    ),
  }
}

function normalizeTextBlock(item, fieldLabel) {
  const normalizedItem = assertPlainObject(item, fieldLabel)
  assertKnownObjectKeys(normalizedItem, fieldLabel, ['text', 'title'])

  return {
    text: normalizeText(normalizedItem.text, `${fieldLabel}: текст`),
    title: normalizeText(normalizedItem.title, `${fieldLabel}: заголовок`),
  }
}

function normalizeComparisonColumn(item, fieldLabel) {
  const normalizedItem = assertPlainObject(item, fieldLabel)
  assertKnownObjectKeys(normalizedItem, fieldLabel, ['points', 'title', 'variant'])

  return {
    points: normalizeStringArray(normalizedItem.points, `${fieldLabel}: тезисы`),
    title: normalizeText(normalizedItem.title, `${fieldLabel}: заголовок`),
    variant: normalizeVariant(
      normalizedItem.variant,
      `${fieldLabel}: стиль`,
      ['muted', 'accent'],
      'muted'
    ),
  }
}

function normalizeContactChannel(item, fieldLabel) {
  const normalizedItem = assertPlainObject(item, fieldLabel)
  assertKnownObjectKeys(normalizedItem, fieldLabel, [
    'actionLabel',
    'description',
    'external',
    'href',
    'key',
    'label',
    'value',
  ])
  const key = normalizeText(normalizedItem.key, `${fieldLabel}: ключ`)
  const isSystemChannel = contactChannelSystemKeys.has(key)

  return {
    actionLabel: normalizeText(
      normalizedItem.actionLabel,
      `${fieldLabel}: текст действия`
    ),
    description: normalizeText(
      normalizedItem.description,
      `${fieldLabel}: описание`
    ),
    external: normalizeBoolean(
      normalizedItem.external ?? false,
      `${fieldLabel}: внешняя ссылка`
    ),
    href: normalizeContentLink(
      normalizedItem.href ?? '',
      `${fieldLabel}: своя ссылка`,
      { required: !isSystemChannel }
    ),
    key,
    label: normalizeText(normalizedItem.label, `${fieldLabel}: заголовок`),
    value: normalizeText(normalizedItem.value ?? '', `${fieldLabel}: значение`, {
      required: false,
    }),
  }
}

function normalizeHeaderExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'header.extraData', [
    'brandBadge',
    'ctaShortLabel',
    'menuActions',
    'menuItems',
    'messengerLabels',
    'phoneShortLabel',
  ])
  const messengerLabels = assertPlainObject(
    extraData.messengerLabels ?? {},
    'header.extraData.messengerLabels'
  )
  assertKnownObjectKeys(messengerLabels, 'header.extraData.messengerLabels', [
    'telegram',
    'vk',
    'whatsapp',
  ])

  return {
    brandBadge: normalizeText(
      extraData.brandBadge ?? '',
      'header.extraData.brandBadge',
      { required: false }
    ),
    ctaShortLabel: normalizeText(
      extraData.ctaShortLabel ?? '',
      'header.extraData.ctaShortLabel',
      { required: false }
    ),
    menuActions: normalizeArray(
      extraData.menuActions ?? [],
      'header.extraData.menuActions',
      normalizeActionItem
    ),
    menuItems: normalizeArray(
      extraData.menuItems ?? [],
      'header.extraData.menuItems',
      normalizeMenuItem
    ),
    messengerLabels: {
      telegram: normalizeText(
        messengerLabels.telegram ?? '',
        'header.extraData.messengerLabels.telegram',
        { required: false }
      ),
      vk: normalizeText(
        messengerLabels.vk ?? '',
        'header.extraData.messengerLabels.vk',
        { required: false }
      ),
      whatsapp: normalizeText(
        messengerLabels.whatsapp ?? '',
        'header.extraData.messengerLabels.whatsapp',
        { required: false }
      ),
    },
    phoneShortLabel: normalizeText(
      extraData.phoneShortLabel ?? '',
      'header.extraData.phoneShortLabel',
      { required: false }
    ),
  }
}

function normalizeHeroExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'hero.extraData', ['image'])
  return {
    image: normalizeMediaSource(extraData.image ?? '', 'hero.extraData.image', {
      required: false,
    }),
  }
}

function normalizeProductOverviewExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'product-overview.extraData', [
    'badges',
    'blocks',
    'composition',
    'featureImage',
    'featureText',
    'featureTitle',
    'overview',
  ])
  return {
    badges: normalizeStringArray(
      extraData.badges ?? [],
      'product-overview.extraData.badges'
    ),
    blocks: normalizeArray(
      extraData.blocks ?? [],
      'product-overview.extraData.blocks',
      normalizeTextBlock
    ),
    composition: normalizeStringArray(
      extraData.composition ?? [],
      'product-overview.extraData.composition'
    ),
    featureImage: normalizeMediaSource(
      extraData.featureImage ?? '',
      'product-overview.extraData.featureImage',
      { required: false }
    ),
    featureText: normalizeText(
      extraData.featureText ?? '',
      'product-overview.extraData.featureText',
      { required: false }
    ),
    featureTitle: normalizeText(
      extraData.featureTitle ?? '',
      'product-overview.extraData.featureTitle',
      { required: false }
    ),
    overview: normalizeStringArray(
      extraData.overview ?? [],
      'product-overview.extraData.overview'
    ),
  }
}

function normalizeWhyUsExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'why-us.extraData', ['columns'])
  return {
    columns: normalizeArray(
      extraData.columns ?? [],
      'why-us.extraData.columns',
      normalizeComparisonColumn
    ),
  }
}

function normalizeGalleryExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'gallery.extraData', ['hint'])
  return {
    hint: normalizeText(extraData.hint ?? '', 'gallery.extraData.hint', {
      required: false,
    }),
  }
}

function normalizeEmptyExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'extraData', [])
  return {}
}

function normalizeSelfInstallExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'self-install.extraData', [
    'image',
    'mediaText',
    'points',
    'videoLabel',
    'videoUrl',
  ])
  return {
    image: normalizeMediaSource(
      extraData.image ?? '',
      'self-install.extraData.image',
      { required: false }
    ),
    mediaText: normalizeText(
      extraData.mediaText ?? '',
      'self-install.extraData.mediaText',
      { required: false }
    ),
    points: normalizeStringArray(
      extraData.points ?? [],
      'self-install.extraData.points'
    ),
    videoLabel: normalizeText(
      extraData.videoLabel ?? '',
      'self-install.extraData.videoLabel',
      { required: false }
    ),
    videoUrl: normalizeExternalUrl(
      extraData.videoUrl ?? '',
      'self-install.extraData.videoUrl',
      { required: false }
    ),
  }
}

function normalizePartnersExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'partners.extraData', [
    'leadBadge',
    'leadTitle',
    'options',
  ])
  return {
    leadBadge: normalizeText(
      extraData.leadBadge ?? '',
      'partners.extraData.leadBadge',
      { required: false }
    ),
    leadTitle: normalizeText(
      extraData.leadTitle ?? '',
      'partners.extraData.leadTitle',
      { required: false }
    ),
    options: normalizeArray(
      extraData.options ?? [],
      'partners.extraData.options',
      normalizeTextBlock
    ),
  }
}

function normalizeContactsExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'contacts.extraData', [
    'channels',
    'introEyebrow',
    'introText',
  ])
  return {
    channels: normalizeArray(
      extraData.channels ?? [],
      'contacts.extraData.channels',
      normalizeContactChannel
    ),
    introEyebrow: normalizeText(
      extraData.introEyebrow ?? '',
      'contacts.extraData.introEyebrow',
      { required: false }
    ),
    introText: normalizeText(
      extraData.introText ?? '',
      'contacts.extraData.introText',
      { required: false }
    ),
  }
}

function normalizeFooterExtraData(extraData) {
  assertKnownObjectKeys(extraData, 'footer.extraData', [
    'maxLabel',
    'telegramLabel',
    'vkLabel',
    'whatsappLabel',
  ])
  return {
    maxLabel: normalizeText(extraData.maxLabel ?? '', 'footer.extraData.maxLabel', {
      required: false,
    }),
    telegramLabel: normalizeText(
      extraData.telegramLabel ?? '',
      'footer.extraData.telegramLabel',
      { required: false }
    ),
    vkLabel: normalizeText(extraData.vkLabel ?? '', 'footer.extraData.vkLabel', {
      required: false,
    }),
    whatsappLabel: normalizeText(
      extraData.whatsappLabel ?? '',
      'footer.extraData.whatsappLabel',
      { required: false }
    ),
  }
}

export function normalizeProductInput(payload) {
  const product = {
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

  if (product.priceOld !== null && product.priceOld <= product.priceCurrent) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Старая цена должна быть больше текущей цены.'
    )
  }

  return product
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

export function normalizeProductImageOrderInput(payload) {
  const root = assertPlainObject(payload, 'Порядок фотографий товара')
  assertKnownObjectKeys(root, 'Порядок фотографий товара', ['imageIds'])

  const imageIds = normalizeArray(
    root.imageIds ?? [],
    'Порядок фотографий товара',
    (item, itemLabel) => {
      const imageId = normalizeNumber(item, itemLabel, { min: 1 })

      if (!Number.isInteger(imageId)) {
        throw createHttpError(
          400,
          'VALIDATION_ERROR',
          `${itemLabel} должно быть целым числом.`
        )
      }

      return imageId
    }
  )

  if (new Set(imageIds).size !== imageIds.length) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Порядок фотографий товара не должен содержать повторяющиеся id.'
    )
  }

  return imageIds
}

export function normalizeShowcaseObjectOrderInput(payload) {
  const root = assertPlainObject(payload, 'Порядок фото объектов')
  assertKnownObjectKeys(root, 'Порядок фото объектов', ['showcaseIds'])

  if (!Array.isArray(root.showcaseIds) || root.showcaseIds.length === 0) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'Передайте непустой массив showcaseIds.'
    )
  }

  const showcaseIds = root.showcaseIds.map((item) => Number(item))

  if (showcaseIds.some((item) => !Number.isInteger(item) || item <= 0)) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'showcaseIds должен содержать только положительные целые числа.'
    )
  }

  if (new Set(showcaseIds).size !== showcaseIds.length) {
    throw createHttpError(
      400,
      'VALIDATION_ERROR',
      'showcaseIds не должен содержать дубликаты.'
    )
  }

  return showcaseIds
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
  const normalizedExtraDataRoot = assertPlainObject(extraData, 'extraData')
  const normalizeExtraData =
    contentBlockExtraDataNormalizers[normalizedKey] ??
    ((value) => assertPlainObject(value, `${normalizedKey}.extraData`))

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
    ctaLink: normalizeContentLink(payload?.ctaLink ?? '', 'Ссылка CTA', {
      required: false,
    }),
    extraData: normalizeExtraData(normalizedExtraDataRoot),
  }
}

export function normalizeContactsInput(payload) {
  return {
    phone: normalizeText(payload?.phone, 'Телефон'),
    whatsappUrl: normalizeExternalUrl(
      payload?.whatsappUrl ?? '',
      'Ссылка WhatsApp',
      { required: false }
    ),
    telegramUrl: normalizeExternalUrl(
      payload?.telegramUrl ?? '',
      'Ссылка Telegram',
      { required: false }
    ),
    maxUrl: normalizeExternalUrl(payload?.maxUrl ?? '', 'Ссылка Max', {
      required: false,
    }),
    vkUrl: normalizeExternalUrl(payload?.vkUrl ?? '', 'Ссылка VK', {
      required: false,
    }),
    address: normalizeText(payload?.address ?? '', 'Адрес', { required: false }),
    workingHours: normalizeText(payload?.workingHours ?? '', 'График работы', {
      required: false,
    }),
  }
}
