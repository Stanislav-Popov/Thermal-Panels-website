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
  isFallbackAssetPath,
} from '../lib/materialReadiness.js'
import { setNamedMeta } from '../lib/documentMeta.js'

const ADMIN_TOKEN_KEY = 'thermal-panels-admin-token'

const tabItems = [
  { id: 'products', label: 'Товары' },
  { id: 'showcase', label: 'Объекты' },
  { id: 'content', label: 'Контент' },
  { id: 'contacts', label: 'Контакты' },
]

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

function mapProductToForm(product) {
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
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    isHidden: product.isHidden,
  }
}

function normalizeProductForm(form) {
  return {
    ...form,
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

function validateProductForm(form) {
  return (
    validateRequiredNumberField(form.panelArea, 'Площадь панели', { min: 0.01 }) ||
    validateRequiredNumberField(form.priceCurrent, 'Текущая цена', { min: 0 }) ||
    validateOptionalNumberField(form.priceOld, 'Старая цена', { min: 0 })
  )
}

function validateContentBlockExtraData() {
  return ''
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

function HeroContentEditor({ extraData, onChangeExtraData }) {
  return (
    <ContentEditorCard
      description="Основное изображение первого экрана. Текст кнопки и ссылка для hero редактируются в основных полях блока выше."
      title="Изображение первого экрана"
    >
      <AdminField label="Путь к изображению">
        <input
          className="admin-input"
          onChange={(event) =>
            onChangeExtraData((current) => ({
              ...current,
              image: event.target.value,
            }))
          }
          value={extraData.image ?? ''}
        />
      </AdminField>
      <ContentImagePreview
        alt="Предпросмотр hero-изображения"
        src={extraData.image}
      />
    </ContentEditorCard>
  )
}

function ProductOverviewContentEditor({ extraData, onChangeExtraData }) {
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
          <AdminField label="Путь к изображению">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  featureImage: event.target.value,
                }))
              }
              value={extraData.featureImage ?? ''}
            />
          </AdminField>
        </div>
        <ContentImagePreview
          alt={extraData.featureTitle || 'Главное изображение блока описания'}
          src={extraData.featureImage}
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

function SelfInstallContentEditor({ extraData, onChangeExtraData }) {
  return (
    <div className="admin-editor-stack">
      <ContentEditorCard
        description="Изображение и подписи в блоке самостоятельного монтажа."
        title="Медиа-блок"
      >
        <div className="admin-grid admin-grid--two">
          <AdminField label="Путь к изображению">
            <input
              className="admin-input"
              onChange={(event) =>
                onChangeExtraData((current) => ({
                  ...current,
                  image: event.target.value,
                }))
              }
              value={extraData.image ?? ''}
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
        <ContentImagePreview
          alt={extraData.videoLabel || 'Блок самостоятельного монтажа'}
          src={extraData.image}
        />
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

function StructuredContentEditor({ blockKey, extraData, onChangeExtraData }) {
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
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
        />
      )
    case 'product-overview':
      return (
        <ProductOverviewContentEditor
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
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
          extraData={extraData}
          onChangeExtraData={onChangeExtraData}
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
  imageForm,
  imageUploadName,
  isSaving,
  onChangeImageForm,
  onChangeProductForm,
  onDeleteImage,
  onDeleteProduct,
  onEditProduct,
  onSelectImageFile,
  onResetProductForm,
  onSaveImage,
  onSaveProduct,
  productForm,
  productImageInputRef,
  products,
}) {
  const currentProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [editingProductId, products]
  )
  const currentProductPendingMediaCount = currentProduct
    ? getProductMaterialGapCount(currentProduct)
    : 0

  return (
    <div className="admin-section">
      <div className="admin-section__split">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Товары каталога</h2>
              <p className="admin-panel__lead">
                Редактирование карточек, цен, скрытия из каталога и набора фото.
              </p>
            </div>
            <button
              className="admin-button admin-button--ghost"
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
                  <p className="admin-card__text">{product.shortDescription}</p>
                  <div className="admin-card__stats">
                    <span>{formatPrice(product.priceCurrent)}</span>
                    <span>{product.gallery.length} фото</span>
                  </div>
                </div>
                <div className="admin-card__actions">
                  <button
                    className="admin-button admin-button--ghost"
                    onClick={() => onEditProduct(product)}
                    type="button"
                  >
                    Редактировать
                  </button>
                  <button
                    className="admin-button admin-button--danger"
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

        <div className="admin-panel admin-panel--sticky">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">
                {editingProductId ? 'Редактор товара' : 'Новый товар'}
              </h2>
              <p className="admin-panel__lead">
                Все поля соответствуют backend CRUD и текущей схеме PostgreSQL.
              </p>
            </div>
          </div>

          <form className="admin-form" onSubmit={onSaveProduct}>
            <div className="admin-grid admin-grid--two">
              <AdminField label="Slug">
                <input className="admin-input" name="slug" onChange={onChangeProductForm} value={productForm.slug} />
              </AdminField>
              <AdminField label="Название">
                <input className="admin-input" name="name" onChange={onChangeProductForm} value={productForm.name} />
              </AdminField>
              <AdminField label="Фактура">
                <input className="admin-input" name="texture" onChange={onChangeProductForm} value={productForm.texture} />
              </AdminField>
              <AdminField label="Статус">
                <input
                  className="admin-input"
                  name="availabilityStatus"
                  onChange={onChangeProductForm}
                  value={productForm.availabilityStatus}
                />
              </AdminField>
              <AdminField label="Цвет кирпича">
                <input
                  className="admin-input"
                  name="brickColor"
                  onChange={onChangeProductForm}
                  value={productForm.brickColor}
                />
              </AdminField>
              <AdminField label="Цвет шва">
                <input
                  className="admin-input"
                  name="jointColor"
                  onChange={onChangeProductForm}
                  value={productForm.jointColor}
                />
              </AdminField>
              <AdminField label="Толщина">
                <input className="admin-input" name="thickness" onChange={onChangeProductForm} value={productForm.thickness} />
              </AdminField>
              <AdminField label="Площадь панели">
                <input
                  className="admin-input"
                  min="0.01"
                  name="panelArea"
                  onChange={onChangeProductForm}
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

            <AdminField label="Краткое описание">
              <textarea
                className="admin-textarea admin-textarea--compact"
                name="shortDescription"
                onChange={onChangeProductForm}
                value={productForm.shortDescription}
              />
            </AdminField>

            <AdminField label="Полное описание">
              <textarea
                className="admin-textarea"
                name="fullDescription"
                onChange={onChangeProductForm}
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

            <div className="admin-form__actions">
              <button className="admin-button" disabled={isSaving} type="submit">
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
          </form>

          <div className="admin-divider" />
          <div className="admin-inline-note">
            Можно загрузить файл на сервер или вручную указать готовый путь к изображению.
          </div>

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
                <div className="admin-mini-list">
                  {currentProduct.gallery.map((image) => (
                    <div className="admin-mini-card" key={image.id}>
                      <img
                        alt={image.alt}
                        className="admin-mini-card__image"
                        src={image.image}
                      />
                      <div className="admin-mini-card__content">
                        <strong>{image.kind}</strong>
                        <p>{image.alt}</p>
                        {isFallbackAssetPath(image.image) ? (
                          <span className="admin-chip admin-chip--warning">
                            Временный media-fallback
                          </span>
                        ) : null}
                      </div>
                      <button
                        className="admin-button admin-button--danger"
                        onClick={() => onDeleteImage(currentProduct.id, image.id)}
                        type="button"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <form className="admin-form admin-form--compact" onSubmit={onSaveImage}>
                <div className="admin-grid admin-grid--two">
                  <AdminField label="Файл изображения">
                    <input
                      accept="image/*"
                      className="admin-input"
                      onChange={onSelectImageFile}
                      ref={productImageInputRef}
                      type="file"
                    />
                  </AdminField>
                  <AdminField label="Путь к изображению">
                    <input className="admin-input" name="image" onChange={onChangeImageForm} value={imageForm.image} />
                  </AdminField>
                  <AdminField label="Тип изображения">
                    <input className="admin-input" name="kind" onChange={onChangeImageForm} value={imageForm.kind} />
                  </AdminField>
                  <AdminField label="Alt">
                    <input className="admin-input" name="alt" onChange={onChangeImageForm} value={imageForm.alt} />
                  </AdminField>
                  <AdminField label="Порядок">
                    <input className="admin-input" name="sortOrder" onChange={onChangeImageForm} type="number" value={imageForm.sortOrder} />
                  </AdminField>
                </div>
                {imageUploadName ? (
                  <div className="admin-upload-note">Выбран файл: {imageUploadName}</div>
                ) : null}
                {imageForm.image ? (
                  <img
                    alt="Предпросмотр загружаемого изображения"
                    className="admin-form__preview"
                    src={imageForm.image}
                  />
                ) : null}
                <AdminField label="Подпись">
                  <input className="admin-input" name="note" onChange={onChangeImageForm} value={imageForm.note} />
                </AdminField>
                <div className="admin-form__actions">
                  <button className="admin-button" disabled={isSaving} type="submit">
                    Добавить фото
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="admin-inline-note">
              Сначала создайте товар или откройте существующий, затем можно управлять его
              галереей.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShowcasePanel({
  editingShowcaseId,
  isSaving,
  onChangeShowcaseForm,
  onDeleteShowcase,
  onEditShowcase,
  onSelectShowcaseImageFile,
  onResetShowcaseForm,
  onSaveShowcase,
  showcaseImageInputRef,
  showcaseUploadName,
  showcaseForm,
  showcaseObjects,
}) {
  return (
    <div className="admin-section">
      <div className="admin-section__split">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Объекты</h2>
              <p className="admin-panel__lead">
                Публикация примеров домов и управление видимостью в публичной части.
              </p>
            </div>
            <button className="admin-button admin-button--ghost" onClick={onResetShowcaseForm} type="button">
              Новый объект
            </button>
          </div>

          <div className="admin-card-list">
            {showcaseObjects.map((item) => (
              <article className="admin-card" key={item.id}>
                <div className="admin-card__body">
                  {getShowcaseMaterialGapCount(item) > 0 ? (
                    <div className="admin-inline-note admin-inline-note--compact admin-inline-note--warning">
                      Нужна реальная обложка объекта
                    </div>
                  ) : null}
                  {item.coverImagePath ? (
                    <img
                      alt={item.title}
                      className="admin-card__preview"
                      src={item.coverImagePath}
                    />
                  ) : null}
                  <div className="admin-card__meta-row">
                    <span className="admin-chip">{item.texture}</span>
                    {getShowcaseMaterialGapCount(item) > 0 ? (
                      <span className="admin-chip admin-chip--warning">
                        Media-gap
                      </span>
                    ) : null}
                    <span className={`admin-chip${item.isPublished ? '' : ' admin-chip--warning'}`}>
                      {item.isPublished ? 'Опубликован' : 'Скрыт'}
                    </span>
                  </div>
                  <h3 className="admin-card__title">{item.title}</h3>
                  <p className="admin-card__text">{item.description}</p>
                </div>
                <div className="admin-card__actions">
                  <button className="admin-button admin-button--ghost" onClick={() => onEditShowcase(item)} type="button">
                    Редактировать
                  </button>
                  <button className="admin-button admin-button--danger" onClick={() => onDeleteShowcase(item.id)} type="button">
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-panel admin-panel--sticky">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">
                {editingShowcaseId ? 'Редактор объекта' : 'Новый объект'}
              </h2>
            </div>
          </div>

          <form className="admin-form" onSubmit={onSaveShowcase}>
            <AdminField label="Название объекта">
              <input className="admin-input" name="title" onChange={onChangeShowcaseForm} value={showcaseForm.title} />
            </AdminField>
            <div className="admin-grid admin-grid--two">
              <AdminField label="Фактура">
                <input className="admin-input" name="texture" onChange={onChangeShowcaseForm} value={showcaseForm.texture} />
              </AdminField>
              <AdminField label="Цвет">
                <input className="admin-input" name="color" onChange={onChangeShowcaseForm} value={showcaseForm.color} />
              </AdminField>
              <AdminField label="Файл обложки">
                <input
                  accept="image/*"
                  className="admin-input"
                  onChange={onSelectShowcaseImageFile}
                  ref={showcaseImageInputRef}
                  type="file"
                />
              </AdminField>
              <AdminField label="Путь к обложке">
                <input className="admin-input" name="coverImagePath" onChange={onChangeShowcaseForm} value={showcaseForm.coverImagePath} />
              </AdminField>
            </div>
            {showcaseUploadName ? (
              <div className="admin-upload-note">Выбран файл: {showcaseUploadName}</div>
            ) : null}
            {showcaseForm.coverImagePath ? (
              <img
                alt="Предпросмотр обложки объекта"
                className="admin-form__preview"
                src={showcaseForm.coverImagePath}
              />
            ) : null}
            <AdminField label="Описание">
              <textarea className="admin-textarea" name="description" onChange={onChangeShowcaseForm} value={showcaseForm.description} />
            </AdminField>
            <label className="admin-checkbox">
              <input checked={showcaseForm.isPublished} name="isPublished" onChange={onChangeShowcaseForm} type="checkbox" />
              <span>Показывать объект в публичной части</span>
            </label>
            <div className="admin-form__actions">
              <button className="admin-button" disabled={isSaving} type="submit">
                {editingShowcaseId ? 'Сохранить объект' : 'Создать объект'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ContentPanel({
  blockDraft,
  blocks,
  isSaving,
  onChangeBlockDraft,
  onChangeBlockExtraData,
  onChangeBlockJson,
  onResetContentDraft,
  onSaveBlock,
  onSelectBlock,
  onToggleBlockAdvanced,
  selectedBlockKey,
}) {
  const selectedBlock = blocks.find((block) => block.blockKey === selectedBlockKey) ?? null
  const blockMeta = getContentBlockEditorMeta(selectedBlockKey)
  const supportsStructuredEditor = supportsStructuredContentEditor(selectedBlockKey)
  const extraData = ensureObject(blockDraft.extraData)

  return (
    <div className="admin-section">
      <div className="admin-section__split">
        <div className="admin-panel admin-panel--narrow">
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

        <div className="admin-panel admin-panel--sticky">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">
                {selectedBlockKey ? blockMeta.label : 'Выберите блок'}
              </h2>
              {selectedBlock ? (
                <p className="admin-panel__lead">{blockMeta.description}</p>
              ) : null}
            </div>
          </div>

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
                    extraData={extraData}
                    onChangeExtraData={onChangeBlockExtraData}
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
        </div>
      </div>
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
            <AdminField label="VK">
              <input className="admin-input" name="vkUrl" onChange={onChangeContactsForm} value={contactsForm.vkUrl} />
            </AdminField>
            <AdminField label="Адрес">
              <input className="admin-input" name="address" onChange={onChangeContactsForm} value={contactsForm.address} />
            </AdminField>
            <AdminField label="График работы">
              <input className="admin-input" name="workingHours" onChange={onChangeContactsForm} value={contactsForm.workingHours} />
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
  const productImageInputRef = useRef(null)
  const showcaseImageInputRef = useRef(null)

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
    resetFileInput(productImageInputRef)
    resetFileInput(showcaseImageInputRef)

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
      content: dashboard.siteContentBlocks.length,
      hiddenProducts: dashboard.products.filter((item) => item.isHidden).length,
      materialGaps:
        dashboard.products.reduce(
          (total, product) => total + (getProductMaterialGapCount(product) > 0 ? 1 : 0),
          0
        ) +
        dashboard.showcaseObjects.reduce(
          (total, item) => total + (getShowcaseMaterialGapCount(item) > 0 ? 1 : 0),
          0
        ) +
        dashboard.siteContentBlocks.reduce(
          (total, block) => total + (getBlockMaterialGapCount(block) > 0 ? 1 : 0),
          0
        ) +
        (getContactsMaterialGapCount(dashboard.contacts) > 0 ? 1 : 0),
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
        showcaseObjects: exists
          ? current.showcaseObjects.map((item) => (item.id === object.id ? object : item))
          : [...current.showcaseObjects, object].sort((left, right) => left.id - right.id),
      }
    })
  }

  const handleProductFieldChange = (event) => {
    const { checked, name, type, value } = event.target
    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageFieldChange = (event) => {
    const { name, value } = event.target
    setImageForm((current) => ({ ...current, [name]: value }))
  }

  const handleSelectImageFile = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setPendingProductImageFile(nextFile)
  }

  const handleResetProductForm = () => {
    setEditingProductId(null)
    setProductForm(createEmptyProductForm())
    setImageForm(createEmptyImageForm())
    setPendingProductImageFile(null)
    resetFileInput(productImageInputRef)
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm(mapProductToForm(product))
    setImageForm(createEmptyImageForm())
    setPendingProductImageFile(null)
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
        handleResetProductForm()
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

  const handleSaveImage = async (event) => {
    event.preventDefault()

    if (!editingProductId) {
      showFlash('Сначала сохраните товар.', 'warning')
      return
    }

    if (!pendingProductImageFile && !normalizeOptionalText(imageForm.image)) {
      showFlash('Выберите файл изображения или укажите путь вручную.', 'warning')
      return
    }

    setIsSaving(true)

    try {
      let imagePath = normalizeOptionalText(imageForm.image)

      if (pendingProductImageFile) {
        const uploadedImage = await uploadAdminImage(
          token,
          'product-images',
          pendingProductImageFile
        )
        imagePath = uploadedImage.imagePath
      }

      const savedImage = await createAdminProductImage(token, editingProductId, {
        ...imageForm,
        image: imagePath,
        sortOrder: Number(imageForm.sortOrder),
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
      setImageForm(createEmptyImageForm())
      setPendingProductImageFile(null)
      resetFileInput(productImageInputRef)
      showFlash('Фото добавлено.')
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

  const handleShowcaseFieldChange = (event) => {
    const { checked, name, type, value } = event.target
    setShowcaseForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSelectShowcaseImageFile = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setPendingShowcaseImageFile(nextFile)
  }

  const handleResetShowcaseForm = () => {
    setEditingShowcaseId(null)
    setShowcaseForm(createEmptyShowcaseForm())
    setPendingShowcaseImageFile(null)
    resetFileInput(showcaseImageInputRef)
  }

  const handleEditShowcase = (item) => {
    setEditingShowcaseId(item.id)
    setShowcaseForm(mapShowcaseToForm(item))
    setPendingShowcaseImageFile(null)
    resetFileInput(showcaseImageInputRef)
  }

  const handleSaveShowcase = async (event) => {
    event.preventDefault()

    if (
      !pendingShowcaseImageFile &&
      !normalizeOptionalText(showcaseForm.coverImagePath)
    ) {
      showFlash('Выберите файл обложки или укажите путь вручную.', 'warning')
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
        ...showcaseForm,
        coverImagePath,
      }

      const savedObject = editingShowcaseId
        ? await updateAdminShowcaseObject(token, editingShowcaseId, payload)
        : await createAdminShowcaseObject(token, payload)

      replaceShowcaseObject(savedObject)
      setEditingShowcaseId(savedObject.id)
      setShowcaseForm(mapShowcaseToForm(savedObject))
      setPendingShowcaseImageFile(null)
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
        handleResetShowcaseForm()
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
    setSelectedBlockKey(block.blockKey)
    setBlockDraft(mapBlockToDraft(block))
  }

  const handleBlockDraftChange = (event) => {
    const { name, value } = event.target
    setBlockDraft((current) => ({ ...current, [name]: value }))
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
    }
  }

  const handleSaveBlock = async (event) => {
    event.preventDefault()
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
      showFlash(`Блок ${savedBlock.blockKey} обновлён.`)
    } catch (error) {
      if (error instanceof SyntaxError) {
        setBlockDraft((current) => ({
          ...current,
          extraDataError:
            'JSON содержит ошибку. Проверьте запятые, кавычки и фигурные скобки.',
        }))
        showFlash('extraData должно быть валидным JSON.', 'warning')
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
          <p className="admin-topbar__eyebrow">Backend + PostgreSQL</p>
          <h1 className="admin-topbar__title">Управление сайтом Thermal Panels</h1>
        </div>
        <div className="admin-topbar__actions">
          <button className="admin-button admin-button--ghost" onClick={() => window.location.assign('/')} type="button">
            На сайт
          </button>
          <button className="admin-button admin-button--danger" onClick={() => handleLogout()} type="button">
            Выйти
          </button>
        </div>
      </header>

      <main className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__stats">
            <div className="admin-stat"><strong>{stats.products}</strong><span>товаров</span></div>
            <div className="admin-stat"><strong>{stats.showcase}</strong><span>объектов</span></div>
            <div className="admin-stat"><strong>{stats.content}</strong><span>блоков</span></div>
            <div className="admin-stat"><strong>{stats.hiddenProducts}</strong><span>скрыто</span></div>
            <div className="admin-stat"><strong>{stats.materialGaps}</strong><span>media-gap</span></div>
          </div>

          <nav className="admin-nav" aria-label="Разделы админки">
            {tabItems.map((item) => (
              <button
                className={`admin-nav__item${activeTab === item.id ? ' admin-nav__item--active' : ''}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin-inline-note">
            Панель работает поверх готовых `/api/admin/*` endpoints и уже умеет
            загружать изображения в локальное серверное хранилище.
          </div>
          {stats.materialGaps > 0 ? (
            <div className="admin-inline-note admin-inline-note--warning">
              В проекте ещё есть секции и карточки с service-fallback материалами. Их можно
              быстро найти по warning-меткам внутри товаров, объектов, контента и контактов.
            </div>
          ) : null}
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
              imageForm={imageForm}
              imageUploadName={pendingProductImageFile?.name ?? ''}
              isSaving={isSaving}
              onChangeImageForm={handleImageFieldChange}
              onChangeProductForm={handleProductFieldChange}
              onDeleteImage={handleDeleteImage}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              onSelectImageFile={handleSelectImageFile}
              onResetProductForm={handleResetProductForm}
              onSaveImage={handleSaveImage}
              onSaveProduct={handleSaveProduct}
              productForm={productForm}
              productImageInputRef={productImageInputRef}
              products={dashboard.products}
            />
          ) : null}

          {activeTab === 'showcase' ? (
            <ShowcasePanel
              editingShowcaseId={editingShowcaseId}
              isSaving={isSaving}
              onChangeShowcaseForm={handleShowcaseFieldChange}
              onDeleteShowcase={handleDeleteShowcase}
              onEditShowcase={handleEditShowcase}
              onSelectShowcaseImageFile={handleSelectShowcaseImageFile}
              onResetShowcaseForm={handleResetShowcaseForm}
              onSaveShowcase={handleSaveShowcase}
              showcaseImageInputRef={showcaseImageInputRef}
              showcaseUploadName={pendingShowcaseImageFile?.name ?? ''}
              showcaseForm={showcaseForm}
              showcaseObjects={dashboard.showcaseObjects}
            />
          ) : null}

          {activeTab === 'content' ? (
            <ContentPanel
              blockDraft={blockDraft}
              blocks={dashboard.siteContentBlocks}
              isSaving={isSaving}
              onChangeBlockDraft={handleBlockDraftChange}
              onChangeBlockExtraData={handleBlockExtraDataChange}
              onChangeBlockJson={handleBlockJsonChange}
              onResetContentDraft={handleResetContentDraft}
              onSaveBlock={handleSaveBlock}
              onSelectBlock={handleSelectBlock}
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
