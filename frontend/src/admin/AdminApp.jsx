import { useEffect, useMemo, useRef, useState } from 'react'
import './admin.css'
import {
  createAdminProduct,
  createAdminProductImage,
  createAdminShowcaseObject,
  deleteAdminProduct,
  deleteAdminProductImage,
  deleteAdminShowcaseObject,
  fetchAdminDashboard,
  loginAdmin,
  reorderAdminProductImages,
  reorderAdminShowcaseObjects,
  uploadAdminImage,
  updateAdminContacts,
  updateAdminProduct,
  updateAdminShowcaseObject,
  updateAdminSiteContentBlock,
} from './adminApi.js'
import {
  getContentBlockEditorMeta,
  supportsStructuredContentEditor,
} from './siteContentEditorMeta.js'
import {
  getBlockMaterialGapCount,
  getContactsMaterialGapCount,
  getProductMaterialGapCount,
  getShowcaseMaterialGapCount,
  hasConfiguredExternalUrl,
} from '../lib/materialReadiness.js'
import { setNamedMeta } from '../lib/documentMeta.js'

const ADMIN_TOKEN_KEY = 'thermal-panels-admin-token'

const tabItems = [
  { id: 'products', label: 'Товары' },
  { id: 'showcase', label: 'Объекты' },
  { id: 'content', label: 'Контент' },
  { id: 'contacts', label: 'Контакты' },
]

const productAvailabilityOptions = ['В наличии', 'Под заказ']
const productImageKindSequence = [
  'Фото панели издалека',
  'Крупный план',
  'Фото сбоку',
  'Фото дома',
]
const slugTransliterationMap = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

const adminDashboardRequests = new Map()

function requestAdminDashboard(token) {
  if (!adminDashboardRequests.has(token)) {
    adminDashboardRequests.set(
      token,
      fetchAdminDashboard(token).finally(() => {
        adminDashboardRequests.delete(token)
      })
    )
  }

  return adminDashboardRequests.get(token)
}

function formatDashboardErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return ''
  }

  const labels = errors.map((item) => item.label).filter(Boolean)
  const details = errors.map((item) => item.message).filter(Boolean)
  const summary = labels.length > 0 ? labels.join(', ') : 'часть данных'
  const detailText = details[0] ? ` ${details[0]}` : ''

  return `Не все данные админки удалось загрузить (${summary}). Остальные разделы доступны.${detailText}`
}

function stringifyContentExtraData(value) {
  return JSON.stringify(value ?? {}, null, 2)
}

function parseContentExtraDataText(text) {
  const normalizedText = typeof text === 'string' ? text.trim() : ''
  return normalizedText ? JSON.parse(normalizedText) : {}
}

function cloneContentExtraData(value) {
  return parseContentExtraDataText(stringifyContentExtraData(value))
}

function createEmptyDashboard() {
  return {
    contacts: null,
    products: [],
    showcaseObjects: [],
    siteContentBlocks: [],
  }
}

function createEmptyProductForm() {
  return {
    slug: '',
    name: '',
    texture: '',
    brickColor: '',
    jointColor: '',
    thickness: '',
    panelArea: '',
    priceCurrent: '',
    priceOld: '',
    availabilityStatus: 'В наличии',
    shortDescription: '',
    fullDescription: '',
    isHidden: false,
  }
}

function createEmptyImageForm() {
  return {
    image: '',
    alt: '',
    kind: 'Крупный план',
    note: '',
    sortOrder: '0',
  }
}

function createEmptyShowcaseForm() {
  return {
    title: '',
    texture: '',
    color: '',
    description: '',
    coverImagePath: '',
    isPublished: true,
  }
}

function createEmptyContentDraft() {
  return {
    blockKey: '',
    title: '',
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {},
    extraDataText: '{}',
    extraDataError: '',
    isAdvancedMode: false,
  }
}

function createEmptyContactsForm() {
  return {
    phone: '',
    whatsappUrl: '',
    telegramUrl: '',
    maxUrl: '',
    vkUrl: '',
    address: '',
    workingHours: '',
  }
}

function useObjectUrl(file) {
  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ''),
    [file]
  )

  useEffect(() => {
    if (!objectUrl) {
      return undefined
    }

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return objectUrl
}

function mapProductToForm(product) {
  const description = getProductDescription(product)

  return {
    slug: product.slug,
    name: product.name,
    texture: product.texture,
    brickColor: product.brickColor,
    jointColor: product.jointColor,
    thickness: product.thickness,
    panelArea: String(product.panelArea),
    priceCurrent: String(product.priceCurrent),
    priceOld: product.priceOld === null ? '' : String(product.priceOld),
    availabilityStatus: product.availabilityStatus,
    shortDescription: description,
    fullDescription: description,
    isHidden: product.isHidden,
  }
}

function normalizeProductForm(form) {
  const description = normalizeOptionalText(form.fullDescription)

  return {
    ...form,
    slug: getProductFormSlug(form),
    shortDescription: description,
    fullDescription: description,
    panelArea: Number(form.panelArea),
    priceCurrent: Number(form.priceCurrent),
    priceOld: form.priceOld === '' ? null : Number(form.priceOld),
  }
}

function mapShowcaseToForm(item) {
  return {
    title: item.title,
    texture: item.texture,
    color: item.color,
    description: item.description,
    coverImagePath: item.coverImagePath,
    isPublished: item.isPublished,
  }
}

function mapBlockToDraft(block) {
  const extraData = cloneContentExtraData(block.extraData ?? {})

  return {
    blockKey: block.blockKey,
    title: block.title ?? '',
    subtitle: block.subtitle ?? '',
    body: block.body ?? '',
    ctaLabel: block.ctaLabel ?? '',
    ctaLink: block.ctaLink ?? '',
    extraData,
    extraDataText: stringifyContentExtraData(extraData),
    extraDataError: '',
    isAdvancedMode: !supportsStructuredContentEditor(block.blockKey),
  }
}

function mapContactsToForm(contacts) {
  return contacts
    ? {
        phone: contacts.phone,
        whatsappUrl: contacts.whatsappUrl,
        telegramUrl: contacts.telegramUrl,
        maxUrl: contacts.maxUrl ?? '',
        vkUrl: contacts.vkUrl,
        address: contacts.address,
        workingHours: contacts.workingHours,
      }
    : createEmptyContactsForm()
}

function normalizeOptionalText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getProductDescription(product) {
  return normalizeOptionalText(product?.fullDescription) ||
    normalizeOptionalText(product?.shortDescription)
}

function getProductAvailabilityChoices(currentStatus) {
  const normalizedStatus = normalizeOptionalText(currentStatus)

  return normalizedStatus &&
    !productAvailabilityOptions.includes(normalizedStatus)
    ? [...productAvailabilityOptions, normalizedStatus]
    : productAvailabilityOptions
}

function createProductSlug(value) {
  const slug = normalizeOptionalText(value)
    .toLowerCase()
    .split('')
    .map((symbol) => slugTransliterationMap[symbol] ?? symbol)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'product'
}

function getProductFormSlug(form) {
  return (
    normalizeOptionalText(form.slug) ||
    createProductSlug(
      [
        form.name,
        form.texture,
        form.brickColor,
        form.jointColor,
        form.thickness,
      ]
        .map(normalizeOptionalText)
        .filter(Boolean)
        .join(' ')
    )
  )
}

function getNextProductImageSortOrder(gallery) {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return 0
  }

  return Math.max(...gallery.map((image) => Number(image.sortOrder) || 0)) + 1
}

function moveArrayItem(items, sourceIndex, targetIndex) {
  if (
    !Array.isArray(items) ||
    sourceIndex === targetIndex ||
    sourceIndex < 0 ||
    targetIndex < 0 ||
    sourceIndex >= items.length ||
    targetIndex >= items.length
  ) {
    return Array.isArray(items) ? [...items] : []
  }

  const nextItems = [...items]
  const [movedItem] = nextItems.splice(sourceIndex, 1)
  nextItems.splice(targetIndex, 0, movedItem)

  return nextItems
}

function buildProductImageDraft({ gallery = [], imagePath, kind, productName }) {
  const normalizedKind =
    normalizeOptionalText(kind) ||
    productImageKindSequence[gallery.length] ||
    `Фото товара ${gallery.length + 1}`
  const normalizedProductName = normalizeOptionalText(productName) || 'Товар'

  return {
    alt: `${normalizedProductName}. ${normalizedKind}`,
    image: imagePath,
    kind: normalizedKind,
    note: normalizedKind,
    sortOrder: getNextProductImageSortOrder(gallery),
  }
}

function buildShowcaseObjectDraft({ coverImagePath, fallbackIndex, showcaseForm }) {
  const objectNumber = Number.isInteger(fallbackIndex) ? fallbackIndex + 1 : 1

  return {
    title: normalizeOptionalText(showcaseForm.title) || `Фото объекта ${objectNumber}`,
    texture: normalizeOptionalText(showcaseForm.texture) || 'Объекты',
    color: normalizeOptionalText(showcaseForm.color) || 'Фото фасада',
    description:
      normalizeOptionalText(showcaseForm.description) ||
      'Фото реализованного объекта.',
    coverImagePath,
    isPublished: showcaseForm.isPublished !== false,
  }
}

function sortShowcaseObjectsByDisplayOrder(showcaseObjects) {
  return [...showcaseObjects].sort((left, right) => {
    const leftOrder = Number(left.sortOrder) || 0
    const rightOrder = Number(right.sortOrder) || 0

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return left.id - right.id
  })
}

function validateRequiredNumberField(value, fieldLabel, { min = 0 } = {}) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return `${fieldLabel} обязательно.`
  }

  const numericValue = Number(normalizedValue)

  if (!Number.isFinite(numericValue) || numericValue < min) {
    return `${fieldLabel} должно быть числом не меньше ${min}.`
  }

  return ''
}

function validateRequiredTextField(value, fieldLabel) {
  return normalizeOptionalText(value) ? '' : `${fieldLabel} обязательно.`
}

function validateOptionalNumberField(value, fieldLabel, { min = 0 } = {}) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return ''
  }

  const numericValue = Number(normalizedValue)

  if (!Number.isFinite(numericValue) || numericValue < min) {
    return `${fieldLabel} должно быть числом не меньше ${min}.`
  }

  return ''
}

function validateOptionalExternalUrlField(value, fieldLabel) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return ''
  }

  return hasConfiguredExternalUrl(normalizedValue)
    ? ''
    : `${fieldLabel} должен быть корректным http/https URL и не служебной заглушкой.`
}

function validateOptionalContentHrefField(value, fieldLabel) {
  const normalizedValue = normalizeOptionalText(value)

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.startsWith('#') || normalizedValue.startsWith('/')) {
    return /\s/.test(normalizedValue)
      ? `${fieldLabel} не должна содержать пробелы.`
      : ''
  }

  if (normalizedValue.startsWith('tel:')) {
    return /^tel:\+?[0-9()\-.\s]{5,}$/.test(normalizedValue)
      ? ''
      : `${fieldLabel} должна быть корректной tel:-ссылкой.`
  }

  return validateOptionalExternalUrlField(value, fieldLabel)
}

function validateProductForm(form) {
  const validationError =
    validateRequiredTextField(getProductFormSlug(form), 'URL товара') ||
    validateRequiredTextField(form.name, 'Название товара') ||
    validateRequiredTextField(form.texture, 'Фактура') ||
    validateRequiredTextField(form.availabilityStatus, 'Статус наличия') ||
    validateRequiredTextField(form.brickColor, 'Цвет кирпича') ||
    validateRequiredTextField(form.jointColor, 'Цвет шва') ||
    validateRequiredTextField(form.thickness, 'Толщина') ||
    validateRequiredTextField(form.fullDescription, 'Описание товара') ||
    validateRequiredNumberField(form.panelArea, 'Площадь панели', { min: 0.01 }) ||
    validateRequiredNumberField(form.priceCurrent, 'Текущая цена', { min: 0 }) ||
    validateOptionalNumberField(form.priceOld, 'Старая цена', { min: 0 })

  if (validationError) {
    return validationError
  }

  const currentPrice = Number(normalizeOptionalText(form.priceCurrent))
  const oldPriceText = normalizeOptionalText(form.priceOld)

  if (oldPriceText && Number(oldPriceText) <= currentPrice) {
    return 'Старая цена должна быть больше текущей цены.'
  }

  return ''
}

function validateContentBlockExtraData(blockKey, extraData) {
  if (blockKey === 'self-install') {
    return validateOptionalExternalUrlField(
      extraData?.videoUrl,
      'Video URL / embed'
    )
  }

  return ''
}

function validateContactsForm(form) {
  return (
    validateOptionalExternalUrlField(form.whatsappUrl, 'Ссылка WhatsApp') ||
    validateOptionalExternalUrlField(form.telegramUrl, 'Ссылка Telegram') ||
    validateOptionalExternalUrlField(form.maxUrl, 'Ссылка Max')
  )
}

function getProductDraftBaseline(productId, products) {
  const product = products.find((item) => item.id === productId) ?? null
  return product ? mapProductToForm(product) : createEmptyProductForm()
}

function getShowcaseDraftBaseline(showcaseId, showcaseObjects) {
  const showcaseObject =
    showcaseObjects.find((item) => item.id === showcaseId) ?? null
  return showcaseObject
    ? mapShowcaseToForm(showcaseObject)
    : createEmptyShowcaseForm()
}

function getContentDraftBaseline(blockKey, blocks) {
  const block = blocks.find((item) => item.blockKey === blockKey) ?? null
  return block ? mapBlockToDraft(block) : createEmptyContentDraft()
}

function getContentImageFieldName(blockKey) {
  switch (blockKey) {
    case 'hero':
    case 'self-install':
      return 'image'
    case 'product-overview':
      return 'featureImage'
    default:
      return ''
  }
}

function stringifyFormState(value) {
  return JSON.stringify(value ?? {})
}

function createContentDraftSnapshot(draft) {
  return stringifyFormState({
    blockKey: draft.blockKey,
    body: draft.body,
    ctaLabel: draft.ctaLabel,
    ctaLink: draft.ctaLink,
    extraData: draft.isAdvancedMode || draft.extraDataError
      ? normalizeOptionalText(draft.extraDataText)
      : stringifyContentExtraData(ensureObject(draft.extraData)),
    subtitle: draft.subtitle,
    title: draft.title,
  })
}

function hasProductDraftChanges({
  editingProductId,
  imageForm,
  pendingProductImageFile,
  productForm,
  products,
}) {
  return (
    stringifyFormState(productForm) !==
      stringifyFormState(getProductDraftBaseline(editingProductId, products)) ||
    stringifyFormState(imageForm) !==
      stringifyFormState(createEmptyImageForm()) ||
    Boolean(pendingProductImageFile)
  )
}

function hasShowcaseDraftChanges({
  editingShowcaseId,
  pendingShowcaseImageFile,
  showcaseForm,
  showcaseObjects,
}) {
  return (
    stringifyFormState(showcaseForm) !==
      stringifyFormState(
        getShowcaseDraftBaseline(editingShowcaseId, showcaseObjects)
      ) ||
    Boolean(pendingShowcaseImageFile)
  )
}

function hasContentDraftChanges({
  blockDraft,
  blocks,
  pendingContentImageFile,
  selectedBlockKey,
}) {
  return (
    createContentDraftSnapshot(blockDraft) !==
      createContentDraftSnapshot(
        getContentDraftBaseline(selectedBlockKey, blocks)
      ) ||
    Boolean(pendingContentImageFile)
  )
}

function hasContactsDraftChanges({ contacts, contactsForm }) {
  return (
    stringifyFormState(contactsForm) !==
    stringifyFormState(mapContactsToForm(contacts))
  )
}

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

function AdminField({ children, label }) {
  return (
    <label className="admin-field">
      <span className="admin-label">{label}</span>
      {children}
    </label>
  )
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function replaceArrayItem(items, index, nextValueOrUpdater) {
  return items.map((item, itemIndex) => {
    if (itemIndex !== index) {
      return item
    }

    return typeof nextValueOrUpdater === 'function'
      ? nextValueOrUpdater(item)
      : nextValueOrUpdater
  })
}

function removeArrayItem(items, index) {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

function ContentEditorCard({ actions = null, children, description, title }) {
  return (
    <section className="admin-editor-card">
      <div className="admin-editor-card__header">
        <div>
          <h3 className="admin-editor-card__title">{title}</h3>
          {description ? (
            <p className="admin-editor-card__description">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

function AdminModal({
  children,
  isCloseDisabled = false,
  isOpen,
  onClose,
  title,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="admin-modal-backdrop">
      <section
        aria-label={title}
        aria-modal="true"
        className="admin-panel admin-modal"
        role="dialog"
      >
        <div className="admin-modal__header">
          <h2 className="admin-panel__title">{title}</h2>
          <button
            className="admin-button admin-button--ghost"
            disabled={isCloseDisabled}
            onClick={onClose}
            type="button"
          >
            Закрыть
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </section>
    </div>
  )
}

function ContentEditorItem({ children, description, onRemove, title }) {
  return (
    <div className="admin-editor-item">
      <div className="admin-editor-item__header">
        <div>
          <h4 className="admin-editor-item__title">{title}</h4>
          {description ? (
            <p className="admin-editor-item__description">{description}</p>
          ) : null}
        </div>
        <button
          className="admin-button admin-button--danger"
          onClick={onRemove}
          type="button"
        >
          Удалить
        </button>
      </div>
      {children}
    </div>
  )
}

function ContentImagePreview({ alt, src }) {
  const normalizedSrc = normalizeOptionalText(src)

  if (!normalizedSrc) {
    return null
  }

  return (
    <img
      alt={alt}
      className="admin-form__preview admin-form__preview--small"
      src={normalizedSrc}
    />
  )
}

function ContentImageUploadField({
  imagePath,
  inputRef,
  label,
  onChangeImagePath,
  onSelectFile,
  previewAlt,
  previewUrl,
  uploadName,
}) {
  return (
    <>
      <div className="admin-grid admin-grid--two">
        <AdminField label="Загрузить файл">
          <input
            accept="image/*"
            className="admin-input admin-file-input"
            onChange={onSelectFile}
            ref={inputRef}
            type="file"
          />
        </AdminField>
        <AdminField label={label}>
          <input
            className="admin-input"
            onChange={(event) => onChangeImagePath(event.target.value)}
            value={imagePath}
          />
        </AdminField>
      </div>
      {uploadName ? (
        <div className="admin-upload-note">Выбран файл: {uploadName}</div>
      ) : null}
      <ContentImagePreview alt={previewAlt} src={previewUrl || imagePath} />
    </>
  )
}

function InlineStringListFields({
  addLabel,
  items,
  onChange,
  placeholder = '',
}) {
  const normalizedItems = ensureArray(items)

  return (
    <div className="admin-editor-list">
      {normalizedItems.length > 0 ? (
        normalizedItems.map((item, index) => (
          <div className="admin-editor-inline-row" key={`inline-item-${index}`}>
            <input
              className="admin-input"
              onChange={(event) =>
                onChange(replaceArrayItem(normalizedItems, index, event.target.value))
              }
              placeholder={placeholder}
              value={typeof item === 'string' ? item : ''}
            />
            <button
              className="admin-button admin-button--danger"
              onClick={() => onChange(removeArrayItem(normalizedItems, index))}
              type="button"
            >
              Удалить
            </button>
          </div>
        ))
      ) : (
        <div className="admin-editor-empty">Пока нет элементов.</div>
      )}
      <button
        className="admin-button admin-button--ghost"
        onClick={() => onChange([...normalizedItems, ''])}
        type="button"
      >
        {addLabel}
      </button>
    </div>
  )
}

function StringListEditor({
  addLabel,
  description,
  items,
  onChange,
  placeholder,
  title,
}) {
  return (
    <ContentEditorCard description={description} title={title}>
      <InlineStringListFields
        addLabel={addLabel}
        items={items}
        onChange={onChange}
        placeholder={placeholder}
      />
    </ContentEditorCard>
  )
}

function MenuItemsEditor({ items, onChange }) {
  const normalizedItems = ensureArray(items)

  return (
    <ContentEditorCard
      actions={
        <button
          className="admin-button admin-button--ghost"
          onClick={() => onChange([...normalizedItems, { href: '', label: '' }])}
          type="button"
        >
          Добавить пункт
        </button>
      }
      description="Якорные пункты меню в шапке и мобильной навигации."
      title="Пункты меню"
    >
      <div className="admin-editor-list">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <ContentEditorItem
              description="Обычно это якоря вроде #catalog или #contacts."
              key={`menu-item-${index}`}
              onRemove={() => onChange(removeArrayItem(normalizedItems, index))}
              title={`Пункт ${index + 1}`}
            >
              <div className="admin-grid admin-grid--two">
                <AdminField label="Текст">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          href: item?.href ?? '',
                          label: event.target.value,
                        })
                      )
                    }
                    value={item?.label ?? ''}
                  />
                </AdminField>
                <AdminField label="Ссылка">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          href: event.target.value,
                          label: item?.label ?? '',
                        })
                      )
                    }
                    value={item?.href ?? ''}
                  />
                </AdminField>
              </div>
            </ContentEditorItem>
          ))
        ) : (
          <div className="admin-editor-empty">Пока нет пунктов меню.</div>
        )}
      </div>
    </ContentEditorCard>
  )
}

function ActionsEditor({ description, items, onChange, title }) {
  const normalizedItems = ensureArray(items)

  return (
    <ContentEditorCard
      actions={
        <button
          className="admin-button admin-button--ghost"
          onClick={() =>
            onChange([
              ...normalizedItems,
              { external: false, href: '', label: '', variant: 'secondary' },
            ])
          }
          type="button"
        >
          Добавить CTA
        </button>
      }
      description={description}
      title={title}
    >
      <div className="admin-editor-list">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <ContentEditorItem
              key={`action-item-${index}`}
              onRemove={() => onChange(removeArrayItem(normalizedItems, index))}
              title={`CTA ${index + 1}`}
            >
              <div className="admin-grid admin-grid--two">
                <AdminField label="Текст кнопки">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          label: event.target.value,
                        })
                      )
                    }
                    value={item?.label ?? ''}
                  />
                </AdminField>
                <AdminField label="Ссылка">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          href: event.target.value,
                        })
                      )
                    }
                    value={item?.href ?? ''}
                  />
                </AdminField>
                <AdminField label="Вариант кнопки">
                  <select
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          variant: event.target.value,
                        })
                      )
                    }
                    value={item?.variant ?? 'secondary'}
                  >
                    <option value="primary">primary</option>
                    <option value="secondary">secondary</option>
                  </select>
                </AdminField>
              </div>
              <label className="admin-checkbox">
                <input
                  checked={item?.external === true}
                  onChange={(event) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        external: event.target.checked,
                      })
                    )
                  }
                  type="checkbox"
                />
                <span>Открывать как внешнюю ссылку</span>
              </label>
            </ContentEditorItem>
          ))
        ) : (
          <div className="admin-editor-empty">Пока нет CTA-элементов.</div>
        )}
      </div>
    </ContentEditorCard>
  )
}

function TextBlocksEditor({
  addLabel,
  description,
  items,
  onChange,
  title,
  titleLabel = 'Заголовок',
}) {
  const normalizedItems = ensureArray(items)

  return (
    <ContentEditorCard
      actions={
        <button
          className="admin-button admin-button--ghost"
          onClick={() => onChange([...normalizedItems, { text: '', title: '' }])}
          type="button"
        >
          {addLabel}
        </button>
      }
      description={description}
      title={title}
    >
      <div className="admin-editor-list">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <ContentEditorItem
              key={`${title}-${index}`}
              onRemove={() => onChange(removeArrayItem(normalizedItems, index))}
              title={`${titleLabel} ${index + 1}`}
            >
              <AdminField label={titleLabel}>
                <input
                  className="admin-input"
                  onChange={(event) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        title: event.target.value,
                      })
                    )
                  }
                  value={item?.title ?? ''}
                />
              </AdminField>
              <AdminField label="Текст">
                <textarea
                  className="admin-textarea admin-textarea--compact"
                  onChange={(event) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        text: event.target.value,
                      })
                    )
                  }
                  value={item?.text ?? ''}
                />
              </AdminField>
            </ContentEditorItem>
          ))
        ) : (
          <div className="admin-editor-empty">Пока нет карточек.</div>
        )}
      </div>
    </ContentEditorCard>
  )
}

function ComparisonColumnsEditor({ items, onChange }) {
  const normalizedItems = ensureArray(items)

  return (
    <ContentEditorCard
      actions={
        <button
          className="admin-button admin-button--ghost"
          onClick={() =>
            onChange([
              ...normalizedItems,
              { points: [''], title: '', variant: 'muted' },
            ])
          }
          type="button"
        >
          Добавить колонку
        </button>
      }
      description={'Колонки сравнения для блока "Почему мы".'}
      title="Колонки сравнения"
    >
      <div className="admin-editor-list">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <ContentEditorItem
              key={`comparison-column-${index}`}
              onRemove={() => onChange(removeArrayItem(normalizedItems, index))}
              title={`Колонка ${index + 1}`}
            >
              <div className="admin-grid admin-grid--two">
                <AdminField label="Заголовок колонки">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          title: event.target.value,
                        })
                      )
                    }
                    value={item?.title ?? ''}
                  />
                </AdminField>
                <AdminField label="Стиль">
                  <select
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          variant: event.target.value,
                        })
                      )
                    }
                    value={item?.variant ?? 'muted'}
                  >
                    <option value="muted">muted</option>
                    <option value="accent">accent</option>
                  </select>
                </AdminField>
              </div>
              <div className="admin-field">
                <span className="admin-label">Тезисы внутри колонки</span>
                <InlineStringListFields
                  addLabel="Добавить тезис"
                  items={ensureArray(item?.points)}
                  onChange={(nextPoints) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        points: nextPoints,
                      })
                    )
                  }
                  placeholder="Например: Производство и материалы описаны слишком общо."
                />
              </div>
            </ContentEditorItem>
          ))
        ) : (
          <div className="admin-editor-empty">Пока нет колонок.</div>
        )}
      </div>
    </ContentEditorCard>
  )
}

function ChannelsEditor({ items, onChange }) {
  const normalizedItems = ensureArray(items)

  return (
    <ContentEditorCard
      actions={
        <button
          className="admin-button admin-button--ghost"
          onClick={() =>
            onChange([
              ...normalizedItems,
              {
                actionLabel: '',
                description: '',
                external: false,
                href: '',
                key: '',
                label: '',
                value: '',
              },
            ])
          }
          type="button"
        >
          Добавить канал
        </button>
      }
      description="Порядок и подписи каналов связи. Для key можно использовать phone, whatsapp, telegram, vk или свой код."
      title="Каналы связи"
    >
      <div className="admin-editor-list">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <ContentEditorItem
              key={`contact-channel-${index}`}
              onRemove={() => onChange(removeArrayItem(normalizedItems, index))}
              title={`Канал ${index + 1}`}
            >
              <div className="admin-grid admin-grid--two">
                <AdminField label="Ключ">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          key: event.target.value,
                        })
                    )
                  }
                  value={item?.key ?? ''}
                />
                </AdminField>
                <AdminField label="Заголовок канала">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          label: event.target.value,
                        })
                      )
                    }
                    value={item?.label ?? ''}
                  />
                </AdminField>
                <AdminField label="Значение">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          value: event.target.value,
                        })
                      )
                    }
                    value={item?.value ?? ''}
                  />
                </AdminField>
                <AdminField label="Текст действия">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          actionLabel: event.target.value,
                        })
                      )
                    }
                    value={item?.actionLabel ?? ''}
                  />
                </AdminField>
                <AdminField label="Своя ссылка">
                  <input
                    className="admin-input"
                    onChange={(event) =>
                      onChange(
                        replaceArrayItem(normalizedItems, index, {
                          ...ensureObject(item),
                          href: event.target.value,
                        })
                      )
                    }
                    value={item?.href ?? ''}
                  />
                </AdminField>
              </div>
              <AdminField label="Описание">
                <textarea
                  className="admin-textarea admin-textarea--compact"
                  onChange={(event) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        description: event.target.value,
                      })
                    )
                  }
                  value={item?.description ?? ''}
                />
              </AdminField>
              <label className="admin-checkbox">
                <input
                  checked={item?.external === true}
                  onChange={(event) =>
                    onChange(
                      replaceArrayItem(normalizedItems, index, {
                        ...ensureObject(item),
                        external: event.target.checked,
                      })
                    )
                  }
                  type="checkbox"
                />
                <span>Открывать ссылку в новой вкладке</span>
              </label>
            </ContentEditorItem>
          ))
        ) : (
          <div className="admin-editor-empty">Пока нет каналов связи.</div>
        )}
      </div>
    </ContentEditorCard>
  )
}

function HeaderContentEditor({ extraData, onChangeExtraData }) {
  const messengerLabels = ensureObject(extraData.messengerLabels)

  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Короткие подписи и лейблы рядом с логотипом и быстрыми контактами."
        title="Бренд и контакты в header"
      >
        <div className="admin-grid admin-grid--two">
          <AdminField label="Бейдж бренда">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  brandBadge: event.target.value,
                }))
              }
              value={extraData.brandBadge ?? ''}
            />
          </AdminField>
          <AdminField label="Короткий текст CTA">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  ctaShortLabel: event.target.value,
                }))
              }
              value={extraData.ctaShortLabel ?? ''}
            />
          </AdminField>
          <AdminField label="Короткая подпись телефона">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  phoneShortLabel: event.target.value,
                }))
              }
              value={extraData.phoneShortLabel ?? ''}
            />
          </AdminField>
          <AdminField label="WhatsApp label">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  messengerLabels: {
                    ...ensureObject(current.messengerLabels),
                    whatsapp: event.target.value,
                  },
                }))
              }
              value={messengerLabels.whatsapp ?? ''}
            />
          </AdminField>
          <AdminField label="Telegram label">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  messengerLabels: {
                    ...ensureObject(current.messengerLabels),
                    telegram: event.target.value,
                  },
                }))
              }
              value={messengerLabels.telegram ?? ''}
            />
          </AdminField>
          <AdminField label="VK label">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  messengerLabels: {
                    ...ensureObject(current.messengerLabels),
                    vk: event.target.value,
                  },
                }))
              }
              value={messengerLabels.vk ?? ''}
            />
          </AdminField>
        </div>
      </ContentEditorCard>
      <MenuItemsEditor
        items={extraData.menuItems}
        onChange={(nextItems) =>
          onChangeExtraData((current) => ({ ...current, menuItems: nextItems }))
        }
      />
      <ActionsEditor
        description="Дополнительные кнопки внутри раскрытого меню."
        items={extraData.menuActions}
        onChange={(nextActions) =>
          onChangeExtraData((current) => ({ ...current, menuActions: nextActions }))
        }
        title="Кнопки в меню"
      />
    </div>
  )
}

function HeroContentEditor({
  contentImageInputRef,
  contentImagePreviewUrl,
  contentImageUploadName,
  extraData,
  onChangeExtraData,
  onSelectContentImageFile,
}) {
  return (
    <ContentEditorCard
      description="Основное изображение первого экрана. Текст кнопки и ссылка для hero редактируются в основных полях блока выше."
      title="Изображение первого экрана"
    >
      <ContentImageUploadField
        imagePath={extraData.image ?? ''}
        inputRef={contentImageInputRef}
        label="Путь к изображению"
        onChangeImagePath={(nextImagePath) =>
          onChangeExtraData((current) => ({
            ...current,
            image: nextImagePath,
          }))
        }
        onSelectFile={onSelectContentImageFile}
        previewAlt="Предпросмотр hero-изображения"
        previewUrl={contentImagePreviewUrl}
        uploadName={contentImageUploadName}
      />
    </ContentEditorCard>
  )
}

function ProductOverviewContentEditor({
  contentImageInputRef,
  contentImagePreviewUrl,
  contentImageUploadName,
  extraData,
  onChangeExtraData,
  onSelectContentImageFile,
}) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Главный визуальный блок и вводный акцент внутри секции."
        title="Главный акцент"
      >
        <div className="admin-grid admin-grid--two">
          <AdminField label="Заголовок акцента">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  featureTitle: event.target.value,
                }))
              }
              value={extraData.featureTitle ?? ''}
            />
          </AdminField>
        </div>
        <ContentImageUploadField
          imagePath={extraData.featureImage ?? ''}
          inputRef={contentImageInputRef}
          label="Путь к изображению"
          onChangeImagePath={(nextImagePath) =>
            onChangeExtraData((current) => ({
              ...current,
              featureImage: nextImagePath,
            }))
          }
          onSelectFile={onSelectContentImageFile}
          previewAlt={
            extraData.featureTitle || 'Главное изображение блока описания'
          }
          previewUrl={contentImagePreviewUrl}
          uploadName={contentImageUploadName}
        />
        <AdminField label="Текст акцента">
          <textarea
            className="admin-textarea admin-textarea--compact"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                featureText: event.target.value,
              }))
            }
            value={extraData.featureText ?? ''}
          />
        </AdminField>
      </ContentEditorCard>
      <StringListEditor
        addLabel="Добавить бейдж"
        description="Небольшие плашки над секцией."
        items={extraData.badges}
        onChange={(nextItems) =>
          onChangeExtraData((current) => ({ ...current, badges: nextItems }))
        }
        placeholder="Например: Утепление"
        title="Бейджи"
      />
      <StringListEditor
        addLabel="Добавить абзац"
        description="Основные абзацы с описанием продукта."
        items={extraData.overview}
        onChange={(nextItems) =>
          onChangeExtraData((current) => ({ ...current, overview: nextItems }))
        }
        placeholder="Описание назначения и преимуществ продукта."
        title="Общее описание"
      />
      <StringListEditor
        addLabel="Добавить состав"
        description="Список состава и базовых характеристик материала."
        items={extraData.composition}
        onChange={(nextItems) =>
          onChangeExtraData((current) => ({ ...current, composition: nextItems }))
        }
        placeholder="Например: Мраморная крошка"
        title="Состав и характеристики"
      />
      <TextBlocksEditor
        addLabel="Добавить карточку"
        description="Дополнительные смысловые карточки внутри секции."
        items={extraData.blocks}
        onChange={(nextItems) =>
          onChangeExtraData((current) => ({ ...current, blocks: nextItems }))
        }
        title="Информационные карточки"
      />
    </div>
  )
}

function WhyUsContentEditor({ extraData, onChangeExtraData }) {
  return (
    <ComparisonColumnsEditor
      items={extraData.columns}
      onChange={(nextColumns) =>
        onChangeExtraData((current) => ({ ...current, columns: nextColumns }))
      }
    />
  )
}

function GalleryContentEditor({ extraData, onChangeExtraData }) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description='Карточки этого блока на сайте формируются из опубликованных объектов во вкладке "Объекты".'
        title="Источник карточек"
      >
        <div className="admin-editor-empty">
          Чтобы добавить или изменить пример работы на сайте, редактируйте
          элементы во вкладке &quot;Объекты&quot;.
        </div>
      </ContentEditorCard>
      <ContentEditorCard
        description="Короткая необязательная подпись над списком примеров работ."
        title="Текст-подсказка"
      >
        <AdminField label="Подсказка">
          <textarea
            className="admin-textarea admin-textarea--compact"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                hint: event.target.value,
              }))
            }
            value={extraData.hint ?? ''}
          />
        </AdminField>
      </ContentEditorCard>
    </div>
  )
}

function CatalogContentEditor() {
  return (
    <ContentEditorCard
      description="Для каталога сейчас настраиваются только тексты секции и вспомогательная CTA."
      title="Дополнительные настройки"
    >
      <div className="admin-editor-empty">
        Отдельных JSON-настроек для этого блока пока нет.
      </div>
    </ContentEditorCard>
  )
}

function CalculatorContentEditor() {
  return (
    <ContentEditorCard
      description="Для калькулятора сейчас настраивается только заголовок секции. Дополнительных JSON-настроек нет."
      title="Дополнительные настройки"
    >
      <div className="admin-editor-empty">
        Отдельных JSON-настроек для этого блока больше нет.
      </div>
    </ContentEditorCard>
  )
}

function SelfInstallContentEditor({
  contentImageInputRef,
  contentImagePreviewUrl,
  contentImageUploadName,
  extraData,
  onChangeExtraData,
  onSelectContentImageFile,
}) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Обложка, embed-ссылка и подписи в блоке самостоятельного монтажа."
        title="Медиа-блок"
      >
        <ContentImageUploadField
          imagePath={extraData.image ?? ''}
          inputRef={contentImageInputRef}
          label="Путь к изображению"
          onChangeImagePath={(nextImagePath) =>
            onChangeExtraData((current) => ({
              ...current,
              image: nextImagePath,
            }))
          }
          onSelectFile={onSelectContentImageFile}
          previewAlt={extraData.videoLabel || 'Блок самостоятельного монтажа'}
          previewUrl={contentImagePreviewUrl}
          uploadName={contentImageUploadName}
        />
        <div className="admin-grid admin-grid--two">
          <AdminField label="Video URL / embed">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  videoUrl: event.target.value,
                }))
              }
              value={extraData.videoUrl ?? ''}
            />
          </AdminField>
          <AdminField label="Подпись видео">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  videoLabel: event.target.value,
                }))
              }
              value={extraData.videoLabel ?? ''}
            />
          </AdminField>
        </div>
        <AdminField label="Текст поверх изображения">
          <textarea
            className="admin-textarea admin-textarea--compact"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                mediaText: event.target.value,
              }))
            }
            value={extraData.mediaText ?? ''}
          />
        </AdminField>
      </ContentEditorCard>
      <StringListEditor
        addLabel="Добавить тезис"
        description="Пункты в карточке справа от изображения."
        items={extraData.points}
        onChange={(nextPoints) =>
          onChangeExtraData((current) => ({ ...current, points: nextPoints }))
        }
        placeholder="Например: После консультации проще оценить объём работ."
        title="Тезисы карточки"
      />
    </div>
  )
}

function PartnersContentEditor({ extraData, onChangeExtraData }) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Небольшой бейдж и крупный заголовок внутри левой ведущей панели."
        title="Ведущий оффер"
      >
        <div className="admin-grid admin-grid--two">
          <AdminField label="Бейдж">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  leadBadge: event.target.value,
                }))
              }
              value={extraData.leadBadge ?? ''}
            />
          </AdminField>
          <AdminField label="Крупный оффер">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  leadTitle: event.target.value,
                }))
              }
              value={extraData.leadTitle ?? ''}
            />
          </AdminField>
        </div>
      </ContentEditorCard>
      <TextBlocksEditor
        addLabel="Добавить вариант"
        description="Карточки с описанием сценариев сотрудничества."
        items={extraData.options}
        onChange={(nextOptions) =>
          onChangeExtraData((current) => ({ ...current, options: nextOptions }))
        }
        title="Варианты сотрудничества"
        titleLabel="Название варианта"
      />
    </div>
  )
}

function ContactsContentEditor({ extraData, onChangeExtraData }) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Короткий акцент над телефоном и основной текст, который виден внутри контактного блока."
        title="Вводный текст"
      >
        <div className="admin-grid admin-grid--two">
          <AdminField label="Короткий акцент">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  introEyebrow: event.target.value,
                }))
              }
              value={extraData.introEyebrow ?? ''}
            />
          </AdminField>
        </div>
        <AdminField label="Основной текст блока">
          <textarea
            className="admin-textarea admin-textarea--compact"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                introText: event.target.value,
              }))
            }
            value={extraData.introText ?? ''}
          />
        </AdminField>
      </ContentEditorCard>
      <ChannelsEditor
        items={extraData.channels}
        onChange={(nextChannels) =>
          onChangeExtraData((current) => ({ ...current, channels: nextChannels }))
        }
      />
    </div>
  )
}

function FooterContentEditor({ extraData, onChangeExtraData }) {
  return (
    <ContentEditorCard
      description="Короткие названия для быстрых кнопок мессенджеров в подвале сайта."
      title="Подписи мессенджеров"
    >
      <div className="admin-grid admin-grid--two">
        <AdminField label="WhatsApp">
          <input
            className="admin-input"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                whatsappLabel: event.target.value,
              }))
            }
            value={extraData.whatsappLabel ?? ''}
          />
        </AdminField>
        <AdminField label="Telegram">
          <input
            className="admin-input"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                telegramLabel: event.target.value,
              }))
            }
            value={extraData.telegramLabel ?? ''}
          />
        </AdminField>
        <AdminField label="Max">
          <input
            className="admin-input"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                maxLabel: event.target.value,
              }))
            }
            value={extraData.maxLabel ?? ''}
          />
        </AdminField>
        <AdminField label="VK">
          <input
            className="admin-input"
            onChange={(event) =>
              onChangeExtraData((current) => ({
                ...current,
                vkLabel: event.target.value,
              }))
            }
            value={extraData.vkLabel ?? ''}
          />
        </AdminField>
      </div>
    </ContentEditorCard>
  )
}

function StructuredContentEditor({
  blockKey,
  contentImageInputRef,
  contentImagePreviewUrl,
  contentImageUploadName,
  extraData,
  onChangeExtraData,
  onSelectContentImageFile,
}) {
  switch (blockKey) {
    case 'header':
      return (
        <HeaderContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'hero':
      return (
        <HeroContentEditor
          contentImageInputRef={contentImageInputRef}
          contentImagePreviewUrl={contentImagePreviewUrl}
          contentImageUploadName={contentImageUploadName}
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
          onSelectContentImageFile={onSelectContentImageFile}
        />
      )
    case 'product-overview':
      return (
        <ProductOverviewContentEditor
          contentImageInputRef={contentImageInputRef}
          contentImagePreviewUrl={contentImagePreviewUrl}
          contentImageUploadName={contentImageUploadName}
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
          onSelectContentImageFile={onSelectContentImageFile}
        />
      )
    case 'why-us':
      return (
        <WhyUsContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'gallery':
      return (
        <GalleryContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'catalog':
      return <CatalogContentEditor />
    case 'calculator':
      return (
        <CalculatorContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'self-install':
      return (
        <SelfInstallContentEditor
          contentImageInputRef={contentImageInputRef}
          contentImagePreviewUrl={contentImagePreviewUrl}
          contentImageUploadName={contentImageUploadName}
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
          onSelectContentImageFile={onSelectContentImageFile}
        />
      )
    case 'partners':
      return (
        <PartnersContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'contacts':
      return (
        <ContactsContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'footer':
      return (
        <FooterContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    default:
      return null
  }
}

function ProductsPanel({
  editingProductId,
  isEditorOpen,
  isSaving,
  onChangeProductForm,
  onCloseEditor,
  onDeleteImage,
  onDeleteProduct,
  onEditProduct,
  onReorderImages,
  onSelectImageFile,
  onResetProductForm,
  onSaveProduct,
  productForm,
  productImageInputRef,
  products,
}) {
  const currentProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [editingProductId, products]
  )
  const [draggedImageId, setDraggedImageId] = useState(null)
  const [dragOverImageId, setDragOverImageId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const draggedImageIdRef = useRef(null)
  const currentProductPendingMediaCount = currentProduct
    ? getProductMaterialGapCount(currentProduct)
    : 0
  const availabilityChoices = useMemo(
    () => getProductAvailabilityChoices(productForm.availabilityStatus),
    [productForm.availabilityStatus]
  )

  const handleImageDragStart = (event, imageId) => {
    if (isSaving) {
      event.preventDefault()
      return
    }

    draggedImageIdRef.current = imageId
    setDraggedImageId(imageId)
    setDragOverImageId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(imageId))
  }

  const handleImageDragOver = (event, imageId) => {
    if (isSaving || draggedImageId === imageId) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverImageId(imageId)
  }

  const handleImageDrop = (event, targetImageId) => {
    event.preventDefault()
    const transferImageId = Number(event.dataTransfer.getData('text/plain'))
    const sourceImageId = Number.isInteger(draggedImageIdRef.current)
      ? draggedImageIdRef.current
      : transferImageId

    draggedImageIdRef.current = null
    setDraggedImageId(null)
    setDragOverImageId(null)

    if (
      !currentProduct ||
      !Number.isInteger(sourceImageId) ||
      sourceImageId === targetImageId
    ) {
      return
    }

    onReorderImages(currentProduct.id, sourceImageId, targetImageId)
  }

  const handleImageDragEnd = () => {
    draggedImageIdRef.current = null
    setDraggedImageId(null)
    setDragOverImageId(null)
  }

  const productEditorFormId = `admin-product-editor-${editingProductId ?? 'new'}`
  const activePreviewImage =
    isEditorOpen && previewImage
      ? currentProduct?.gallery.find((image) => image.id === previewImage.id) ?? null
      : null

  return (
    <div className="admin-section">
      <div className="admin-panel admin-panel--single">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Товары каталога</h2>
            <p className="admin-panel__lead">
              Редактирование карточек, цен, скрытия из каталога и набора фото.
            </p>
          </div>
          <button
            className="admin-button admin-button--ghost"
            disabled={isSaving}
            onClick={onResetProductForm}
            type="button"
          >
            Новый товар
          </button>
        </div>

        <div className="admin-card-list">
          {products.map((product) => (
            <article className="admin-card" key={product.id}>
              <div className="admin-card__body">
                {getProductMaterialGapCount(product) > 0 ? (
                  <div className="admin-inline-note admin-inline-note--compact admin-inline-note--warning">
                    Нужны реальные фото товара
                  </div>
                ) : null}
                {product.gallery[0] ? (
                  <img
                    alt={product.gallery[0].alt}
                    className="admin-card__preview"
                    src={product.gallery[0].image}
                  />
                ) : null}
                <div className="admin-card__meta-row">
                  <span className="admin-chip">{product.texture}</span>
                  {getProductMaterialGapCount(product) > 0 ? (
                    <span className="admin-chip admin-chip--warning">
                      {getProductMaterialGapCount(product)} media-gap
                    </span>
                  ) : null}
                  <span
                    className={`admin-chip${product.isHidden ? ' admin-chip--warning' : ''}`}
                  >
                    {product.isHidden ? 'Скрыт' : product.availabilityStatus}
                  </span>
                </div>
                <h3 className="admin-card__title">{product.name}</h3>
                <p className="admin-card__text">{getProductDescription(product)}</p>
                <div className="admin-card__stats">
                  <span>{formatPrice(product.priceCurrent)}</span>
                  <span>{product.gallery.length} фото</span>
                </div>
              </div>
              <div className="admin-card__actions">
                <button
                  className="admin-button admin-button--ghost"
                  disabled={isSaving}
                  onClick={() => onEditProduct(product)}
                  type="button"
                >
                  Редактировать
                </button>
                <button
                  className="admin-button admin-button--danger"
                  disabled={isSaving}
                  onClick={() => onDeleteProduct(product.id)}
                  type="button"
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AdminModal
        isCloseDisabled={isSaving}
        isOpen={isEditorOpen}
        onClose={onCloseEditor}
        title={editingProductId ? 'Редактор товара' : 'Новый товар'}
      >
          <form
            className="admin-form"
            id={productEditorFormId}
            onSubmit={onSaveProduct}
          >
            <div className="admin-grid admin-grid--two">
              <AdminField label="Название">
                <input className="admin-input" name="name" onChange={onChangeProductForm} required value={productForm.name} />
              </AdminField>
              <AdminField label="Фактура">
                <input className="admin-input" name="texture" onChange={onChangeProductForm} required value={productForm.texture} />
              </AdminField>
              <AdminField label="Статус">
                <div className="admin-radio-group">
                  {availabilityChoices.map((status) => (
                    <label className="admin-radio" key={status}>
                      <input
                        checked={productForm.availabilityStatus === status}
                        name="availabilityStatus"
                        onChange={onChangeProductForm}
                        type="radio"
                        value={status}
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </AdminField>
              <AdminField label="Цвет кирпича">
                <input
                  className="admin-input"
                  name="brickColor"
                  onChange={onChangeProductForm}
                  required
                  value={productForm.brickColor}
                />
              </AdminField>
              <AdminField label="Цвет шва">
                <input
                  className="admin-input"
                  name="jointColor"
                  onChange={onChangeProductForm}
                  required
                  value={productForm.jointColor}
                />
              </AdminField>
              <AdminField label="Толщина">
                <input className="admin-input" name="thickness" onChange={onChangeProductForm} required value={productForm.thickness} />
              </AdminField>
              <AdminField label="Площадь панели">
                <input
                  className="admin-input"
                  min="0.01"
                  name="panelArea"
                  onChange={onChangeProductForm}
                  required
                  step="0.01"
                  type="number"
                  value={productForm.panelArea}
                />
              </AdminField>
              <AdminField label="Текущая цена">
                <input
                  className="admin-input"
                  min="0"
                  name="priceCurrent"
                  onChange={onChangeProductForm}
                  required
                  step="0.01"
                  type="number"
                  value={productForm.priceCurrent}
                />
              </AdminField>
              <AdminField label="Старая цена">
                <input
                  className="admin-input"
                  min="0"
                  name="priceOld"
                  onChange={onChangeProductForm}
                  step="0.01"
                  type="number"
                  value={productForm.priceOld}
                />
              </AdminField>
            </div>

            <AdminField label="Описание товара">
              <textarea
                className="admin-textarea"
                name="fullDescription"
                onChange={onChangeProductForm}
                required
                value={productForm.fullDescription}
              />
            </AdminField>

            <label className="admin-checkbox">
              <input
                checked={productForm.isHidden}
                name="isHidden"
                onChange={onChangeProductForm}
                type="checkbox"
              />
              <span>Скрыть товар из публичного каталога</span>
            </label>
          </form>

          <div className="admin-divider" />

          {currentProduct ? (
            <>
              <div className="admin-subsection">
                <h3 className="admin-subsection__title">Фотографии товара</h3>
                {currentProductPendingMediaCount > 0 ? (
                  <div className="admin-inline-note admin-inline-note--warning">
                    Для этого товара ещё не хватает {currentProductPendingMediaCount} реальных
                    изображений. Сейчас на сайте используются service-fallback материалы.
                  </div>
                ) : null}
                {currentProduct.gallery.length > 0 ? (
                  <div className="admin-product-gallery">
                    {currentProduct.gallery.map((image) => (
                      <div
                        className={`admin-product-gallery__item${draggedImageId === image.id ? ' admin-product-gallery__item--dragging' : ''}${dragOverImageId === image.id ? ' admin-product-gallery__item--drag-target' : ''}`}
                        draggable={!isSaving}
                        key={image.id}
                        onDragEnd={handleImageDragEnd}
                        onDragOver={(event) => handleImageDragOver(event, image.id)}
                        onDragStart={(event) =>
                          handleImageDragStart(event, image.id)
                        }
                        onDrop={(event) => handleImageDrop(event, image.id)}
                      >
                        <button
                          aria-label={`Открыть фото: ${image.alt}`}
                          className="admin-product-gallery__thumb"
                          onClick={() => setPreviewImage(image)}
                          type="button"
                        >
                          <img
                            alt={image.alt}
                            className="admin-product-gallery__image"
                            draggable={false}
                            src={image.image}
                          />
                        </button>
                        <div className="admin-product-gallery__tools">
                          <span className="admin-drag-handle" aria-hidden="true">
                            ⇅
                          </span>
                          <button
                            className="admin-button admin-button--danger"
                            disabled={isSaving}
                            onClick={() => onDeleteImage(currentProduct.id, image.id)}
                            type="button"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-inline-note">
                    У товара пока нет фотографий. Загрузите первую картинку ниже.
                  </div>
                )}
              </div>

              <input
                accept="image/*"
                className="admin-hidden-file-input"
                onChange={onSelectImageFile}
                ref={productImageInputRef}
                type="file"
              />
              <div className="admin-form__actions">
                <button
                  className="admin-button"
                  disabled={isSaving}
                  onClick={() => productImageInputRef.current?.click()}
                  type="button"
                >
                  {isSaving ? 'Загружаем фото...' : 'Добавить фото'}
                </button>
              </div>
            </>
          ) : (
            <div className="admin-inline-note">
              Сначала создайте товар или откройте существующий, затем можно управлять его
              галереей.
            </div>
          )}

          <div className="admin-divider" />

          <div className="admin-form__actions admin-form__actions--sticky-bottom">
            <button
              className="admin-button"
              disabled={isSaving}
              form={productEditorFormId}
              type="submit"
            >
              {editingProductId ? 'Сохранить товар' : 'Создать товар'}
            </button>
            <button
              className="admin-button admin-button--ghost"
              disabled={isSaving}
              onClick={onResetProductForm}
              type="button"
            >
              Сбросить
            </button>
          </div>
      </AdminModal>

      <AdminModal
        isOpen={Boolean(activePreviewImage)}
        onClose={() => setPreviewImage(null)}
        title="Просмотр фото"
      >
        {activePreviewImage ? (
          <img
            alt={activePreviewImage.alt}
            className="admin-image-preview"
            draggable={false}
            src={activePreviewImage.image}
          />
        ) : null}
      </AdminModal>
    </div>
  )
}

function ShowcasePanel({
  editingShowcaseId,
  isEditorOpen,
  isSaving,
  onCloseEditor,
  onDeleteShowcase,
  onEditShowcase,
  onReorderShowcase,
  onSelectShowcaseImageFile,
  onResetShowcaseForm,
  onSaveShowcase,
  showcaseImageInputRef,
  showcasePreviewUrl,
  showcaseUploadName,
  showcaseForm,
  showcaseObjects,
}) {
  const [draggedShowcaseId, setDraggedShowcaseId] = useState(null)
  const [dragOverShowcaseId, setDragOverShowcaseId] = useState(null)
  const draggedShowcaseIdRef = useRef(null)

  const handleShowcaseDragStart = (event, showcaseId) => {
    if (isSaving) {
      event.preventDefault()
      return
    }

    draggedShowcaseIdRef.current = showcaseId
    setDraggedShowcaseId(showcaseId)
    setDragOverShowcaseId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(showcaseId))
  }

  const handleShowcaseDragOver = (event, showcaseId) => {
    if (isSaving || draggedShowcaseId === showcaseId) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverShowcaseId(showcaseId)
  }

  const handleShowcaseDrop = (event, targetShowcaseId) => {
    event.preventDefault()
    const transferShowcaseId = Number(event.dataTransfer.getData('text/plain'))
    const sourceShowcaseId = Number.isInteger(draggedShowcaseIdRef.current)
      ? draggedShowcaseIdRef.current
      : transferShowcaseId

    draggedShowcaseIdRef.current = null
    setDraggedShowcaseId(null)
    setDragOverShowcaseId(null)

    if (
      !Number.isInteger(sourceShowcaseId) ||
      sourceShowcaseId === targetShowcaseId
    ) {
      return
    }

    onReorderShowcase(sourceShowcaseId, targetShowcaseId)
  }

  const handleShowcaseDragEnd = () => {
    draggedShowcaseIdRef.current = null
    setDraggedShowcaseId(null)
    setDragOverShowcaseId(null)
  }

  return (
    <div className="admin-section">
      <div className="admin-panel admin-panel--single">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Объекты</h2>
            <p className="admin-panel__lead">
              Управление фотографиями объектов и порядком показа на сайте.
            </p>
          </div>
          <button
            className="admin-button admin-button--ghost"
            disabled={isSaving}
            onClick={onResetShowcaseForm}
            type="button"
          >
            Добавить фото
          </button>
        </div>

        <div className="admin-showcase-gallery">
          {showcaseObjects.map((item) => (
            <article
              className={`admin-showcase-gallery__item${
                draggedShowcaseId === item.id
                  ? ' admin-showcase-gallery__item--dragging'
                  : ''
              }${
                dragOverShowcaseId === item.id
                  ? ' admin-showcase-gallery__item--drag-target'
                  : ''
              }`}
              draggable={!isSaving}
              key={item.id}
              onDragEnd={handleShowcaseDragEnd}
              onDragOver={(event) => handleShowcaseDragOver(event, item.id)}
              onDragStart={(event) => handleShowcaseDragStart(event, item.id)}
              onDrop={(event) => handleShowcaseDrop(event, item.id)}
            >
              <div className="admin-showcase-gallery__thumb">
                {item.coverImagePath ? (
                  <img
                    alt={item.title}
                    className="admin-showcase-gallery__image"
                    draggable={false}
                    src={item.coverImagePath}
                  />
                ) : null}
              </div>
              <div className="admin-showcase-gallery__tools">
                <span className="admin-drag-handle" aria-hidden="true">
                  ⇅
                </span>
                {getShowcaseMaterialGapCount(item) > 0 ? (
                  <span className="admin-chip admin-chip--warning">Нужно фото</span>
                ) : null}
                <button
                  className="admin-button admin-button--ghost"
                  disabled={isSaving}
                  onClick={() => onEditShowcase(item)}
                  type="button"
                >
                  Заменить
                </button>
                <button
                  className="admin-button admin-button--danger"
                  disabled={isSaving}
                  onClick={() => onDeleteShowcase(item.id)}
                  type="button"
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AdminModal
        isCloseDisabled={isSaving}
        isOpen={isEditorOpen}
        onClose={onCloseEditor}
        title={editingShowcaseId ? 'Заменить фото' : 'Добавить фото'}
      >
          <form className="admin-form" onSubmit={onSaveShowcase}>
            <AdminField label="Фото">
              <input
                accept="image/*"
                className="admin-input admin-file-input"
                onChange={onSelectShowcaseImageFile}
                ref={showcaseImageInputRef}
                type="file"
              />
            </AdminField>
            {showcaseUploadName ? (
              <div className="admin-upload-note">Выбран файл: {showcaseUploadName}</div>
            ) : null}
            {showcasePreviewUrl || showcaseForm.coverImagePath ? (
              <img
                alt="Предпросмотр обложки объекта"
                className="admin-form__preview"
                src={showcasePreviewUrl || showcaseForm.coverImagePath}
              />
            ) : null}
            <div className="admin-form__actions admin-form__actions--sticky-bottom">
              <button className="admin-button" disabled={isSaving} type="submit">
                {editingShowcaseId ? 'Сохранить фото' : 'Добавить фото'}
              </button>
              <button
                className="admin-button admin-button--ghost"
                disabled={isSaving}
                onClick={onCloseEditor}
                type="button"
              >
                Закрыть
              </button>
            </div>
          </form>
      </AdminModal>
    </div>
  )
}

function ContentPanel({
  blockDraft,
  blocks,
  contentImageInputRef,
  contentImagePreviewUrl,
  contentImageUploadName,
  isEditorOpen,
  isSaving,
  onChangeBlockDraft,
  onChangeBlockExtraData,
  onChangeBlockJson,
  onCloseEditor,
  onResetContentDraft,
  onSaveBlock,
  onSelectBlock,
  onSelectContentImageFile,
  onToggleBlockAdvanced,
  selectedBlockKey,
}) {
  const selectedBlock = blocks.find((block) => block.blockKey === selectedBlockKey) ?? null
  const blockMeta = getContentBlockEditorMeta(selectedBlockKey)
  const supportsStructuredEditor = supportsStructuredContentEditor(selectedBlockKey)
  const extraData = ensureObject(blockDraft.extraData)

  return (
    <div className="admin-section">
      <div className="admin-panel admin-panel--single">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Контентные блоки</h2>
            <p className="admin-panel__lead">
              Структурированное редактирование текстов, карточек, списков и CTA.
            </p>
          </div>
        </div>

        <div className="admin-tab-list">
          {blocks.map((block) => (
            <button
              className={`admin-tab-item${selectedBlockKey === block.blockKey ? ' admin-tab-item--active' : ''}`}
              disabled={isSaving}
              key={block.blockKey}
              onClick={() => onSelectBlock(block)}
              type="button"
            >
              <span>{getContentBlockEditorMeta(block.blockKey).label}</span>
              <small>
                {block.title || block.blockKey}
                {getBlockMaterialGapCount(block) > 0 ? ' • нужны материалы' : ''}
              </small>
            </button>
          ))}
        </div>
      </div>

      <AdminModal
        isCloseDisabled={isSaving}
        isOpen={isEditorOpen && Boolean(selectedBlockKey)}
        onClose={onCloseEditor}
        title={selectedBlockKey ? blockMeta.label : 'Контентный блок'}
      >
        {selectedBlock ? (
          <p className="admin-panel__lead">{blockMeta.description}</p>
        ) : null}

          {selectedBlock && getBlockMaterialGapCount(selectedBlock) > 0 ? (
            <div className="admin-inline-note admin-inline-note--warning">
              В этом блоке ещё используются service-fallback материалы. После загрузки реальных
              фото или визуалов warning исчезнет автоматически.
            </div>
          ) : null}

          {selectedBlockKey ? (
            <form className="admin-form" onSubmit={onSaveBlock}>
              <div className="admin-editor-stack">
                <ContentEditorCard
                  description="Основные тексты секции, которые выводятся на сайте сразу."
                  title="Основные поля"
                >
                  <div className="admin-grid admin-grid--two">
                    {blockMeta.primaryFields.map((field) => (
                      <AdminField key={field.name} label={field.label}>
                        {field.multiline ? (
                          <textarea
                            className="admin-textarea admin-textarea--compact"
                            name={field.name}
                            onChange={onChangeBlockDraft}
                            value={blockDraft[field.name]}
                          />
                        ) : (
                          <input
                            className="admin-input"
                            name={field.name}
                            onChange={onChangeBlockDraft}
                            value={blockDraft[field.name]}
                          />
                        )}
                      </AdminField>
                    ))}
                  </div>
                </ContentEditorCard>

                {supportsStructuredEditor && !blockDraft.isAdvancedMode ? (
                  <StructuredContentEditor
                    blockKey={selectedBlockKey}
                    contentImageInputRef={contentImageInputRef}
                    contentImagePreviewUrl={contentImagePreviewUrl}
                    contentImageUploadName={contentImageUploadName}
                    extraData={extraData}
                    onChangeExtraData={onChangeBlockExtraData}
                    onSelectContentImageFile={onSelectContentImageFile}
                  />
                ) : null}

                <div className="admin-editor-toggle">
                  <div>
                    <p className="admin-editor-toggle__title">Расширенный JSON-режим</p>
                    <p className="admin-editor-toggle__description">
                      {supportsStructuredEditor
                        ? 'Нужен для редких полей и нестандартных правок. Обычный режим удобнее и безопаснее.'
                        : 'Для этого блока пока доступен только JSON-редактор.'}
                    </p>
                  </div>
                  {supportsStructuredEditor ? (
                    <button
                      className="admin-button admin-button--ghost"
                      onClick={onToggleBlockAdvanced}
                      type="button"
                    >
                      {blockDraft.isAdvancedMode
                        ? 'Вернуться к удобной форме'
                        : 'Открыть JSON'}
                    </button>
                  ) : null}
                </div>

                {blockDraft.isAdvancedMode || !supportsStructuredEditor ? (
                  <ContentEditorCard
                    description="Полезно для тонкой настройки, если нужное поле пока не вынесено в форму."
                    title="extraData"
                  >
                    <textarea
                      className="admin-textarea admin-textarea--code"
                      name="extraDataText"
                      onChange={onChangeBlockJson}
                      value={blockDraft.extraDataText}
                    />
                    {blockDraft.extraDataError ? (
                      <div className="admin-alert admin-alert--warning">
                        {blockDraft.extraDataError}
                      </div>
                    ) : (
                      <div className="admin-editor-empty">
                        JSON синхронизирован с формой и уйдёт на backend как `extraData`.
                      </div>
                    )}
                  </ContentEditorCard>
                ) : null}
              </div>

              <div className="admin-form__actions">
                <button className="admin-button" disabled={isSaving} type="submit">
                  Сохранить блок
                </button>
                <button
                  className="admin-button admin-button--ghost"
                  disabled={isSaving}
                  onClick={onResetContentDraft}
                  type="button"
                >
                  Сбросить
                </button>
              </div>
            </form>
          ) : (
            <div className="admin-inline-note">Выберите блок слева, чтобы открыть редактор.</div>
          )}
      </AdminModal>
    </div>
  )
}

function ContactsPanel({
  contactsForm,
  isSaving,
  onChangeContactsForm,
  onSaveContacts,
}) {
  const contactsMaterialGapCount = getContactsMaterialGapCount(contactsForm)

  return (
    <div className="admin-section">
      <div className="admin-panel admin-panel--single">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Контакты и мессенджеры</h2>
            <p className="admin-panel__lead">
              Редактирование телефонного номера, ссылок и базовой контактной информации.
            </p>
          </div>
        </div>

        {contactsMaterialGapCount > 0 ? (
          <div className="admin-inline-note admin-inline-note--warning">
            Пока не хватает {contactsMaterialGapCount} реальных ссылок на мессенджеры или соцсети.
            Пустые поля и служебные ссылки вроде `telegram.org` лучше заменить перед публикацией.
          </div>
        ) : null}

        <form className="admin-form" onSubmit={onSaveContacts}>
          <div className="admin-grid admin-grid--two">
            <AdminField label="Телефон">
              <input className="admin-input" name="phone" onChange={onChangeContactsForm} value={contactsForm.phone} />
            </AdminField>
            <AdminField label="WhatsApp">
              <input className="admin-input" name="whatsappUrl" onChange={onChangeContactsForm} value={contactsForm.whatsappUrl} />
            </AdminField>
            <AdminField label="Telegram">
              <input className="admin-input" name="telegramUrl" onChange={onChangeContactsForm} value={contactsForm.telegramUrl} />
            </AdminField>
            <AdminField label="Max">
              <input className="admin-input" name="maxUrl" onChange={onChangeContactsForm} value={contactsForm.maxUrl} />
            </AdminField>
            <AdminField label="Адрес">
              <input className="admin-input" name="address" onChange={onChangeContactsForm} value={contactsForm.address} />
            </AdminField>
          </div>

          <div className="admin-form__actions">
            <button className="admin-button" disabled={isSaving} type="submit">
              Сохранить контакты
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) ?? '')
  const [loginForm, setLoginForm] = useState({ login: '', password: '' })
  const [activeTab, setActiveTab] = useState('products')
  const [dashboard, setDashboard] = useState(createEmptyDashboard)
  const [dashboardError, setDashboardError] = useState('')
  const [flash, setFlash] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(createEmptyProductForm)
  const [imageForm, setImageForm] = useState(createEmptyImageForm)
  const [editingShowcaseId, setEditingShowcaseId] = useState(null)
  const [showcaseForm, setShowcaseForm] = useState(createEmptyShowcaseForm)
  const [selectedBlockKey, setSelectedBlockKey] = useState('')
  const [blockDraft, setBlockDraft] = useState(createEmptyContentDraft)
  const [contactsForm, setContactsForm] = useState(createEmptyContactsForm)
  const [pendingProductImageFile, setPendingProductImageFile] = useState(null)
  const [pendingShowcaseImageFile, setPendingShowcaseImageFile] = useState(null)
  const [pendingContentImageFile, setPendingContentImageFile] = useState(null)
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false)
  const [isShowcaseEditorOpen, setIsShowcaseEditorOpen] = useState(false)
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false)
  const productImageInputRef = useRef(null)
  const showcaseImageInputRef = useRef(null)
  const contentImageInputRef = useRef(null)
  const pendingShowcaseImagePreviewUrl = useObjectUrl(pendingShowcaseImageFile)
  const pendingContentImagePreviewUrl = useObjectUrl(pendingContentImageFile)

  useEffect(() => {
    document.documentElement.lang = 'ru'
    document.title = 'Админ-панель | Thermal Panels'
    setNamedMeta(
      'description',
      'Административная панель Thermal Panels для управления товарами, объектами, контентом и контактами.'
    )
    setNamedMeta('robots', 'noindex,nofollow')
  }, [])

  useEffect(() => {
    if (!flash) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => setFlash(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [flash])

  const resetFileInput = (inputRef) => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const hasUnsavedTabDraft = (tabId = activeTab) => {
    switch (tabId) {
      case 'products':
        return hasProductDraftChanges({
          editingProductId,
          imageForm,
          pendingProductImageFile,
          productForm,
          products: dashboard.products,
        })
      case 'showcase':
        return hasShowcaseDraftChanges({
          editingShowcaseId,
          pendingShowcaseImageFile,
          showcaseForm,
          showcaseObjects: dashboard.showcaseObjects,
        })
      case 'content':
        return hasContentDraftChanges({
          blockDraft,
          blocks: dashboard.siteContentBlocks,
          pendingContentImageFile,
          selectedBlockKey,
        })
      case 'contacts':
        return hasContactsDraftChanges({
          contacts: dashboard.contacts,
          contactsForm,
        })
      default:
        return false
    }
  }

  const restoreProductDraftFromSaved = () => {
    const currentProduct =
      dashboard.products.find((item) => item.id === editingProductId) ?? null

    setEditingProductId(currentProduct?.id ?? null)
    setProductForm(
      currentProduct ? mapProductToForm(currentProduct) : createEmptyProductForm()
    )
    setImageForm(createEmptyImageForm())
    setPendingProductImageFile(null)
    resetFileInput(productImageInputRef)
  }

  const restoreShowcaseDraftFromSaved = () => {
    const currentShowcaseObject =
      dashboard.showcaseObjects.find((item) => item.id === editingShowcaseId) ??
      null

    setEditingShowcaseId(currentShowcaseObject?.id ?? null)
    setShowcaseForm(
      currentShowcaseObject
        ? mapShowcaseToForm(currentShowcaseObject)
        : createEmptyShowcaseForm()
    )
    setPendingShowcaseImageFile(null)
    resetFileInput(showcaseImageInputRef)
  }

  const restoreContentDraftFromSaved = () => {
    setBlockDraft(
      getContentDraftBaseline(selectedBlockKey, dashboard.siteContentBlocks)
    )
    setPendingContentImageFile(null)
    resetFileInput(contentImageInputRef)
  }

  const restoreContactsDraftFromSaved = () => {
    setContactsForm(mapContactsToForm(dashboard.contacts))
  }

  const restoreTabDraftFromSaved = (tabId = activeTab) => {
    switch (tabId) {
      case 'products':
        restoreProductDraftFromSaved()
        break
      case 'showcase':
        restoreShowcaseDraftFromSaved()
        break
      case 'content':
        restoreContentDraftFromSaved()
        break
      case 'contacts':
        restoreContactsDraftFromSaved()
        break
      default:
        break
    }
  }

  const closeTabEditor = (tabId = activeTab) => {
    switch (tabId) {
      case 'products':
        setIsProductEditorOpen(false)
        break
      case 'showcase':
        setIsShowcaseEditorOpen(false)
        break
      case 'content':
        setIsContentEditorOpen(false)
        break
      default:
        break
    }
  }

  const confirmDiscardUnsavedDraft = (tabId = activeTab) => {
    if (!hasUnsavedTabDraft(tabId)) {
      return true
    }

    return window.confirm(
      'Есть несохранённые изменения. Сбросить текущий черновик и продолжить?'
    )
  }

  const handleSelectTab = (nextTabId) => {
    if (nextTabId === activeTab) {
      return
    }

    if (!confirmDiscardUnsavedDraft(activeTab)) {
      return
    }

    restoreTabDraftFromSaved(activeTab)
    closeTabEditor(activeTab)
    setActiveTab(nextTabId)
  }

  const handleOpenPublicSite = () => {
    if (!confirmDiscardUnsavedDraft(activeTab)) {
      return
    }

    restoreTabDraftFromSaved(activeTab)
    closeTabEditor(activeTab)
    window.location.assign('/')
  }

  const handleManualLogout = () => {
    if (!confirmDiscardUnsavedDraft(activeTab)) {
      return
    }

    handleLogout()
  }

  const handleLogout = (message) => {
    adminDashboardRequests.delete(token)
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken('')
    setDashboard(createEmptyDashboard())
    setDashboardError('')
    setEditingProductId(null)
    setProductForm(createEmptyProductForm())
    setEditingShowcaseId(null)
    setShowcaseForm(createEmptyShowcaseForm())
    setSelectedBlockKey('')
    setBlockDraft(createEmptyContentDraft())
    setContactsForm(createEmptyContactsForm())
    setPendingProductImageFile(null)
    setPendingShowcaseImageFile(null)
    setPendingContentImageFile(null)
    setIsProductEditorOpen(false)
    setIsShowcaseEditorOpen(false)
    setIsContentEditorOpen(false)
    resetFileInput(productImageInputRef)
    resetFileInput(showcaseImageInputRef)
    resetFileInput(contentImageInputRef)

    if (message) {
      setFlash({ text: message, tone: 'warning' })
    }
  }

  useEffect(() => {
    if (!token) {
      return undefined
    }

    let isCurrent = true

    async function loadDashboard() {
      setIsBootstrapping(true)
      setDashboardError('')

      try {
        const nextDashboard = await requestAdminDashboard(token)

        if (!isCurrent) {
          return
        }

        setDashboard({
          contacts: nextDashboard.contacts,
          products: nextDashboard.products,
          showcaseObjects: nextDashboard.showcaseObjects,
          siteContentBlocks: nextDashboard.siteContentBlocks,
        })
        setContactsForm(mapContactsToForm(nextDashboard.contacts))
        setDashboardError(formatDashboardErrors(nextDashboard.errors))
      } catch (error) {
        if (!isCurrent) {
          return
        }

        if (error.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_KEY)
          setToken('')
          setDashboard(createEmptyDashboard())
          setDashboardError('')
          setFlash({ text: 'Сессия истекла, войдите снова.', tone: 'warning' })
          return
        }

        setDashboardError(error.message)
      } finally {
        if (isCurrent) {
          setIsBootstrapping(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [token])

  useEffect(() => {
    if (dashboard.siteContentBlocks.length === 0) {
      setSelectedBlockKey('')
      setBlockDraft(createEmptyContentDraft())
      return
    }

    const nextBlock =
      dashboard.siteContentBlocks.find((item) => item.blockKey === selectedBlockKey) ??
      dashboard.siteContentBlocks[0]

    setSelectedBlockKey(nextBlock.blockKey)
    setBlockDraft(mapBlockToDraft(nextBlock))
  }, [dashboard.siteContentBlocks, selectedBlockKey])

  const stats = useMemo(
    () => ({
      products: dashboard.products.length,
      showcase: dashboard.showcaseObjects.length,
    }),
    [dashboard]
  )

  const showFlash = (text, tone = 'success') => {
    setFlash({ text, tone })
  }

  const handleLoginFieldChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsAuthenticating(true)
    setDashboardError('')

    try {
      const result = await loginAdmin(loginForm)
      localStorage.setItem(ADMIN_TOKEN_KEY, result.token)
      setToken(result.token)
      showFlash(`Вы вошли как ${result.user.login}.`)
    } catch (error) {
      setDashboardError(error.message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const replaceProduct = (product) => {
    setDashboard((current) => {
      const exists = current.products.some((item) => item.id === product.id)
      return {
        ...current,
        products: exists
          ? current.products.map((item) => (item.id === product.id ? product : item))
          : [...current.products, product].sort((left, right) => left.id - right.id),
      }
    })
  }

  const replaceShowcaseObject = (object) => {
    setDashboard((current) => {
      const exists = current.showcaseObjects.some((item) => item.id === object.id)
      return {
        ...current,
        showcaseObjects: sortShowcaseObjectsByDisplayOrder(
          exists
          ? current.showcaseObjects.map((item) => (item.id === object.id ? object : item))
            : [...current.showcaseObjects, object]
        ),
      }
    })
  }

  const handleProductFieldChange = (event) => {
    const { checked, name, type, value } = event.target
    setProductForm((current) => ({
      ...current,
      ...(name === 'fullDescription'
        ? {
            shortDescription: value,
          }
        : {}),
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSelectImageFile = async (event) => {
    const nextFile = event.target.files?.[0] ?? null

    if (!nextFile) {
      return
    }

    if (!editingProductId) {
      showFlash('Сначала сохраните товар.', 'warning')
      resetFileInput(productImageInputRef)
      return
    }

    setPendingProductImageFile(nextFile)
    setIsSaving(true)

    try {
      const currentProduct =
        dashboard.products.find((item) => item.id === editingProductId) ?? null
      const uploadedImage = await uploadAdminImage(
        token,
        'product-images',
        nextFile
      )

      const savedImage = await createAdminProductImage(token, editingProductId, {
        ...buildProductImageDraft({
          gallery: currentProduct?.gallery ?? [],
          imagePath: uploadedImage.imagePath,
          productName: productForm.name,
        }),
      })

      setDashboard((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === editingProductId
            ? {
                ...item,
                gallery: [...item.gallery, savedImage].sort(
                  (left, right) => left.sortOrder - right.sortOrder
                ),
              }
            : item
        ),
      }))
      showFlash('Фото добавлено.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setImageForm(createEmptyImageForm())
      setPendingProductImageFile(null)
      resetFileInput(productImageInputRef)
      setIsSaving(false)
    }
  }

  const handleResetProductForm = () => {
    if (!confirmDiscardUnsavedDraft('products')) {
      return
    }

    setEditingProductId(null)
    setProductForm(createEmptyProductForm())
    setImageForm(createEmptyImageForm())
    setPendingProductImageFile(null)
    setIsProductEditorOpen(true)
    resetFileInput(productImageInputRef)
  }

  const handleCloseProductEditor = () => {
    if (!confirmDiscardUnsavedDraft('products')) {
      return
    }

    restoreProductDraftFromSaved()
    setIsProductEditorOpen(false)
  }

  const handleEditProduct = (product) => {
    if (product.id === editingProductId && isProductEditorOpen) {
      return
    }

    if (!confirmDiscardUnsavedDraft('products')) {
      return
    }

    setEditingProductId(product.id)
    setProductForm(mapProductToForm(product))
    setImageForm(createEmptyImageForm())
    setPendingProductImageFile(null)
    setIsProductEditorOpen(true)
    resetFileInput(productImageInputRef)
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    const validationError = validateProductForm(productForm)

    if (validationError) {
      showFlash(validationError, 'warning')
      return
    }

    setIsSaving(true)

    try {
      const payload = normalizeProductForm(productForm)
      const savedProduct = editingProductId
        ? await updateAdminProduct(token, editingProductId, payload)
        : await createAdminProduct(token, payload)

      replaceProduct(savedProduct)
      setEditingProductId(savedProduct.id)
      setProductForm(mapProductToForm(savedProduct))
      setIsProductEditorOpen(false)
      showFlash(editingProductId ? 'Товар обновлён.' : 'Товар создан.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Удалить товар?')) {
      return
    }

    setIsSaving(true)

    try {
      await deleteAdminProduct(token, productId)
      setDashboard((current) => ({
        ...current,
        products: current.products.filter((item) => item.id !== productId),
      }))

      if (editingProductId === productId) {
        setEditingProductId(null)
        setProductForm(createEmptyProductForm())
        setImageForm(createEmptyImageForm())
        setPendingProductImageFile(null)
        setIsProductEditorOpen(false)
        resetFileInput(productImageInputRef)
      }

      showFlash('Товар удалён.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteImage = async (productId, imageId) => {
    if (!window.confirm('Удалить фото товара?')) {
      return
    }

    setIsSaving(true)

    try {
      await deleteAdminProductImage(token, productId, imageId)
      setDashboard((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === productId
            ? {
                ...item,
                gallery: item.gallery.filter((image) => image.id !== imageId),
              }
            : item
        ),
      }))
      showFlash('Фото удалено.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorderProductImages = async (
    productId,
    sourceImageId,
    targetImageId
  ) => {
    if (isSaving || sourceImageId === targetImageId) {
      return
    }

    const product = dashboard.products.find((item) => item.id === productId)

    if (!product) {
      return
    }

    const sourceIndex = product.gallery.findIndex(
      (image) => image.id === sourceImageId
    )
    const targetIndex = product.gallery.findIndex(
      (image) => image.id === targetImageId
    )

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return
    }

    const reorderedGallery = moveArrayItem(
      product.gallery,
      sourceIndex,
      targetIndex
    )

    setIsSaving(true)

    try {
      const updatedProduct = await reorderAdminProductImages(
        token,
        productId,
        reorderedGallery.map((image) => image.id)
      )

      replaceProduct(updatedProduct)
      showFlash('Порядок фотографий обновлён.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectShowcaseImageFile = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setPendingShowcaseImageFile(nextFile)
  }

  const handleResetShowcaseForm = () => {
    if (!confirmDiscardUnsavedDraft('showcase')) {
      return
    }

    setEditingShowcaseId(null)
    setShowcaseForm(createEmptyShowcaseForm())
    setPendingShowcaseImageFile(null)
    setIsShowcaseEditorOpen(true)
    resetFileInput(showcaseImageInputRef)
  }

  const handleCloseShowcaseEditor = () => {
    if (!confirmDiscardUnsavedDraft('showcase')) {
      return
    }

    restoreShowcaseDraftFromSaved()
    setIsShowcaseEditorOpen(false)
  }

  const handleEditShowcase = (item) => {
    if (item.id === editingShowcaseId && isShowcaseEditorOpen) {
      return
    }

    if (!confirmDiscardUnsavedDraft('showcase')) {
      return
    }

    setEditingShowcaseId(item.id)
    setShowcaseForm(mapShowcaseToForm(item))
    setPendingShowcaseImageFile(null)
    setIsShowcaseEditorOpen(true)
    resetFileInput(showcaseImageInputRef)
  }

  const handleSaveShowcase = async (event) => {
    event.preventDefault()

    if (
      !pendingShowcaseImageFile &&
      !normalizeOptionalText(showcaseForm.coverImagePath)
    ) {
      showFlash('Выберите фото объекта.', 'warning')
      return
    }

    setIsSaving(true)

    try {
      let coverImagePath = normalizeOptionalText(showcaseForm.coverImagePath)

      if (pendingShowcaseImageFile) {
        const uploadedImage = await uploadAdminImage(
          token,
          'showcase-images',
          pendingShowcaseImageFile
        )
        coverImagePath = uploadedImage.imagePath
      }

      const payload = {
        ...buildShowcaseObjectDraft({
          coverImagePath,
          fallbackIndex: dashboard.showcaseObjects.length,
          showcaseForm,
        }),
      }

      const savedObject = editingShowcaseId
        ? await updateAdminShowcaseObject(token, editingShowcaseId, payload)
        : await createAdminShowcaseObject(token, payload)

      replaceShowcaseObject(savedObject)
      setEditingShowcaseId(savedObject.id)
      setShowcaseForm(mapShowcaseToForm(savedObject))
      setPendingShowcaseImageFile(null)
      setIsShowcaseEditorOpen(false)
      resetFileInput(showcaseImageInputRef)
      showFlash(editingShowcaseId ? 'Объект обновлён.' : 'Объект создан.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorderShowcaseObjects = async (
    sourceShowcaseId,
    targetShowcaseId
  ) => {
    if (isSaving || sourceShowcaseId === targetShowcaseId) {
      return
    }

    const sourceIndex = dashboard.showcaseObjects.findIndex(
      (item) => item.id === sourceShowcaseId
    )
    const targetIndex = dashboard.showcaseObjects.findIndex(
      (item) => item.id === targetShowcaseId
    )

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return
    }

    const reorderedObjects = moveArrayItem(
      dashboard.showcaseObjects,
      sourceIndex,
      targetIndex
    )

    setIsSaving(true)

    try {
      const result = await reorderAdminShowcaseObjects(
        token,
        reorderedObjects.map((item) => item.id)
      )

      setDashboard((current) => ({
        ...current,
        showcaseObjects: sortShowcaseObjectsByDisplayOrder(result.items),
      }))
      showFlash('Порядок фото объектов обновлён.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteShowcase = async (showcaseId) => {
    if (!window.confirm('Удалить объект?')) {
      return
    }

    setIsSaving(true)

    try {
      await deleteAdminShowcaseObject(token, showcaseId)
      setDashboard((current) => ({
        ...current,
        showcaseObjects: current.showcaseObjects.filter((item) => item.id !== showcaseId),
      }))

      if (editingShowcaseId === showcaseId) {
        setEditingShowcaseId(null)
        setShowcaseForm(createEmptyShowcaseForm())
        setPendingShowcaseImageFile(null)
        setIsShowcaseEditorOpen(false)
        resetFileInput(showcaseImageInputRef)
      }

      showFlash('Объект удалён.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectBlock = (block) => {
    if (block.blockKey === selectedBlockKey && isContentEditorOpen) {
      return
    }

    if (!confirmDiscardUnsavedDraft('content')) {
      return
    }

    setSelectedBlockKey(block.blockKey)
    setBlockDraft(mapBlockToDraft(block))
    setPendingContentImageFile(null)
    setIsContentEditorOpen(true)
    resetFileInput(contentImageInputRef)
  }

  const handleCloseContentEditor = () => {
    if (!confirmDiscardUnsavedDraft('content')) {
      return
    }

    restoreContentDraftFromSaved()
    setIsContentEditorOpen(false)
  }

  const handleBlockDraftChange = (event) => {
    const { name, value } = event.target
    setBlockDraft((current) => ({ ...current, [name]: value }))
  }

  const handleSelectContentImageFile = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setPendingContentImageFile(nextFile)
  }

  const handleBlockExtraDataChange = (nextValueOrUpdater) => {
    setBlockDraft((current) => {
      const currentExtraData = ensureObject(current.extraData)
      const nextExtraData =
        typeof nextValueOrUpdater === 'function'
          ? nextValueOrUpdater(currentExtraData)
          : nextValueOrUpdater

      return {
        ...current,
        extraData: ensureObject(nextExtraData),
        extraDataError: '',
        extraDataText: stringifyContentExtraData(nextExtraData),
      }
    })
  }

  const handleBlockJsonChange = (event) => {
    const { value } = event.target

    setBlockDraft((current) => {
      try {
        const nextExtraData = parseContentExtraDataText(value)
        return {
          ...current,
          extraData: ensureObject(nextExtraData),
          extraDataError: '',
          extraDataText: value,
        }
      } catch {
        return {
          ...current,
          extraDataError:
            'JSON содержит ошибку. Исправьте его или вернитесь к структурированному редактору.',
          extraDataText: value,
        }
      }
    })
  }

  const handleToggleBlockAdvanced = () => {
    setBlockDraft((current) => {
      if (current.isAdvancedMode) {
        try {
          const parsedExtraData = parseContentExtraDataText(current.extraDataText)
          return {
            ...current,
            extraData: ensureObject(parsedExtraData),
            extraDataError: '',
            extraDataText: stringifyContentExtraData(parsedExtraData),
            isAdvancedMode: false,
          }
        } catch {
          showFlash('Сначала исправьте JSON, чтобы вернуться к удобной форме.', 'warning')
          return current
        }
      }

      return {
        ...current,
        extraDataError: '',
        extraDataText: stringifyContentExtraData(current.extraData),
        isAdvancedMode: true,
      }
    })
  }

  const handleResetContentDraft = () => {
    const block = dashboard.siteContentBlocks.find((item) => item.blockKey === selectedBlockKey)
    if (block) {
      setBlockDraft(mapBlockToDraft(block))
      setPendingContentImageFile(null)
      resetFileInput(contentImageInputRef)
    }
  }

  const handleSaveBlock = async (event) => {
    event.preventDefault()
    const ctaLinkValidationError = validateOptionalContentHrefField(
      blockDraft.ctaLink,
      'Ссылка CTA'
    )

    if (ctaLinkValidationError) {
      showFlash(ctaLinkValidationError, 'warning')
      return
    }

    setIsSaving(true)

    try {
      const extraData = blockDraft.isAdvancedMode
        ? parseContentExtraDataText(blockDraft.extraDataText)
        : ensureObject(blockDraft.extraData)
      const extraDataValidationError = validateContentBlockExtraData(
        blockDraft.blockKey,
        extraData
      )

      if (extraDataValidationError) {
        setBlockDraft((current) => ({
          ...current,
          extraDataError: extraDataValidationError,
        }))
        showFlash(extraDataValidationError, 'warning')
        return
      }

      const contentImageFieldName = getContentImageFieldName(blockDraft.blockKey)

      if (pendingContentImageFile && contentImageFieldName) {
        const uploadedImage = await uploadAdminImage(
          token,
          'content-images',
          pendingContentImageFile
        )
        extraData[contentImageFieldName] = uploadedImage.imagePath
      }

      const payload = {
        title: blockDraft.title,
        subtitle: blockDraft.subtitle,
        body: blockDraft.body,
        ctaLabel: blockDraft.ctaLabel,
        ctaLink: blockDraft.ctaLink,
        extraData,
      }

      const savedBlock = await updateAdminSiteContentBlock(token, blockDraft.blockKey, payload)

      setDashboard((current) => ({
        ...current,
        siteContentBlocks: current.siteContentBlocks.map((item) =>
          item.blockKey === savedBlock.blockKey ? savedBlock : item
        ),
      }))
      setBlockDraft(mapBlockToDraft(savedBlock))
      setPendingContentImageFile(null)
      setIsContentEditorOpen(false)
      resetFileInput(contentImageInputRef)
      showFlash(`Блок ${savedBlock.blockKey} обновлён.`)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setBlockDraft((current) => ({
          ...current,
          extraDataError:
            'JSON содержит ошибку. Проверьте запятые, кавычки и фигурные скобки.',
        }))
        showFlash('extraData должно быть валидным JSON.', 'warning')
      } else if (error.status === 400 && blockDraft.isAdvancedMode) {
        setBlockDraft((current) => ({
          ...current,
          extraDataError: error.message,
        }))
        showFlash(error.message, 'warning')
      } else if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleContactsFieldChange = (event) => {
    const { name, value } = event.target
    setContactsForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveContacts = async (event) => {
    event.preventDefault()
    const validationError = validateContactsForm(contactsForm)

    if (validationError) {
      showFlash(validationError, 'warning')
      return
    }

    setIsSaving(true)

    try {
      const savedContacts = await updateAdminContacts(token, contactsForm)
      setDashboard((current) => ({ ...current, contacts: savedContacts }))
      setContactsForm(mapContactsToForm(savedContacts))
      showFlash('Контакты обновлены.')
    } catch (error) {
      if (error.status === 401) {
        handleLogout('Сессия истекла, войдите снова.')
      } else {
        showFlash(error.message, 'warning')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!token) {
    return (
      <div className="admin-shell admin-shell--centered">
        <div className="admin-login-card">
          <div className="admin-login-card__intro">
            <p className="admin-login-card__eyebrow">Thermal Panels</p>
            <h1 className="admin-login-card__title">Админ-панель</h1>
            <p className="admin-login-card__text">
              Вход для управления товарами, объектами, контентом и контактами.
            </p>
          </div>

          <form className="admin-form" onSubmit={handleLoginSubmit}>
            <AdminField label="Логин">
              <input className="admin-input" name="login" onChange={handleLoginFieldChange} value={loginForm.login} />
            </AdminField>
            <AdminField label="Пароль">
              <input className="admin-input" name="password" onChange={handleLoginFieldChange} type="password" value={loginForm.password} />
            </AdminField>
            {flash ? (
              <div className={`admin-alert${flash.tone === 'warning' ? ' admin-alert--warning' : ''}`}>
                {flash.text}
              </div>
            ) : null}
            {dashboardError ? <div className="admin-alert admin-alert--warning">{dashboardError}</div> : null}
            <button className="admin-button" disabled={isAuthenticating} type="submit">
              {isAuthenticating ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <h1 className="admin-topbar__title">Управление сайтом Thermal Panels</h1>
        </div>
        <div className="admin-topbar__actions">
          <button
            className="admin-button admin-button--ghost"
            disabled={isSaving}
            onClick={handleOpenPublicSite}
            type="button"
          >
            На сайт
          </button>
          <button
            className="admin-button admin-button--danger"
            disabled={isSaving}
            onClick={handleManualLogout}
            type="button"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__stats">
            <div className="admin-stat"><strong>{stats.products}</strong><span>товаров</span></div>
            <div className="admin-stat"><strong>{stats.showcase}</strong><span>объектов</span></div>
          </div>

          <nav className="admin-nav" aria-label="Разделы админки">
            {tabItems
              .filter((item) => item.id !== 'content')
              .map((item) => (
              <button
                className={`admin-nav__item${activeTab === item.id ? ' admin-nav__item--active' : ''}`}
                disabled={isSaving}
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="admin-stage">
          {flash ? (
            <div className={`admin-alert${flash.tone === 'warning' ? ' admin-alert--warning' : ''}`}>
              {flash.text}
            </div>
          ) : null}
          {dashboardError ? <div className="admin-alert admin-alert--warning">{dashboardError}</div> : null}
          {isBootstrapping ? (
            <div className="admin-panel admin-panel--single">
              <p className="admin-inline-note">Загружаем данные админ-панели...</p>
            </div>
          ) : null}

          {activeTab === 'products' ? (
            <ProductsPanel
              editingProductId={editingProductId}
              isEditorOpen={isProductEditorOpen}
              isSaving={isSaving}
              onChangeProductForm={handleProductFieldChange}
              onCloseEditor={handleCloseProductEditor}
              onDeleteImage={handleDeleteImage}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              onReorderImages={handleReorderProductImages}
              onSelectImageFile={handleSelectImageFile}
              onResetProductForm={handleResetProductForm}
              onSaveProduct={handleSaveProduct}
              productForm={productForm}
              productImageInputRef={productImageInputRef}
              products={dashboard.products}
            />
          ) : null}

          {activeTab === 'showcase' ? (
            <ShowcasePanel
              editingShowcaseId={editingShowcaseId}
              isEditorOpen={isShowcaseEditorOpen}
              isSaving={isSaving}
              onCloseEditor={handleCloseShowcaseEditor}
              onDeleteShowcase={handleDeleteShowcase}
              onEditShowcase={handleEditShowcase}
              onReorderShowcase={handleReorderShowcaseObjects}
              onSelectShowcaseImageFile={handleSelectShowcaseImageFile}
              onResetShowcaseForm={handleResetShowcaseForm}
              onSaveShowcase={handleSaveShowcase}
              showcaseImageInputRef={showcaseImageInputRef}
              showcasePreviewUrl={pendingShowcaseImagePreviewUrl}
              showcaseUploadName={pendingShowcaseImageFile?.name ?? ''}
              showcaseForm={showcaseForm}
              showcaseObjects={dashboard.showcaseObjects}
            />
          ) : null}

          {activeTab === 'content' ? (
            <ContentPanel
              blockDraft={blockDraft}
              blocks={dashboard.siteContentBlocks}
              contentImageInputRef={contentImageInputRef}
              contentImagePreviewUrl={pendingContentImagePreviewUrl}
              contentImageUploadName={pendingContentImageFile?.name ?? ''}
              isEditorOpen={isContentEditorOpen}
              isSaving={isSaving}
              onChangeBlockDraft={handleBlockDraftChange}
              onChangeBlockExtraData={handleBlockExtraDataChange}
              onChangeBlockJson={handleBlockJsonChange}
              onCloseEditor={handleCloseContentEditor}
              onResetContentDraft={handleResetContentDraft}
              onSaveBlock={handleSaveBlock}
              onSelectBlock={handleSelectBlock}
              onSelectContentImageFile={handleSelectContentImageFile}
              onToggleBlockAdvanced={handleToggleBlockAdvanced}
              selectedBlockKey={selectedBlockKey}
            />
          ) : null}

          {activeTab === 'contacts' ? (
            <ContactsPanel
              contactsForm={contactsForm}
              isSaving={isSaving}
              onChangeContactsForm={handleContactsFieldChange}
              onSaveContacts={handleSaveContacts}
            />
          ) : null}
        </section>
      </main>
    </div>
  )
}
