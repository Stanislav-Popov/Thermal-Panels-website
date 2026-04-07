import { useEffect, useState } from 'react'
import { AnalyticsBootstrap } from './components/AnalyticsBootstrap.jsx'
import { CatalogSection } from './components/CatalogSection.jsx'
import { CalculatorSection } from './components/CalculatorSection.jsx'
import { ContactsSection } from './components/ContactsSection.jsx'
import { FacadeGallerySection } from './components/FacadeGallerySection.jsx'
import './facade-theme.css'
import { Footer } from './components/Footer.jsx'
import { Header } from './components/Header.jsx'
import { HeroSection } from './components/HeroSection.jsx'
import { LocationSection } from './components/LocationSection.jsx'
import { PartnersSection } from './components/PartnersSection.jsx'
import { ProductOverviewSection } from './components/ProductOverviewSection.jsx'
import { SelfInstallSection } from './components/SelfInstallSection.jsx'
import { SiteSeo } from './components/SiteSeo.jsx'
import { WhyUsSection } from './components/WhyUsSection.jsx'
import { fetchProducts, fetchSiteContent } from './lib/publicApi.js'
import { hasConfiguredExternalUrl } from './lib/materialReadiness.js'
import {
  getProductPagePath,
  readProductSlugFromPathname,
} from './lib/seo.js'
import {
  comparisonColumns,
  contactChannels,
  headerContacts,
  materialFeature,
  materialOverview,
  menuActions,
  menuItems,
  partnerOptions,
  placeholderImage,
  productDescriptionBlocks,
  projectExamples,
  selfInstallContent,
} from './content/landingContent.js'
import {
  defaultContactChannelConfigs,
  sectionTextDefaults,
} from './content/siteTextDefaults.js'

function findBlock(blocks, blockKey) {
  return blocks.find((block) => block.blockKey === blockKey) ?? null
}

function readText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function readBrandTitle(value) {
  const title = readText(value, sectionTextDefaults.header.brandTitle)

  if (title.toLowerCase() === 'thermal panels') {
    return sectionTextDefaults.header.brandTitle
  }

  return title
}

function readStringArray(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback
  }

  const normalizedItems = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  return normalizedItems.length > 0 ? normalizedItems : fallback
}

function readObjectArray(value, normalizeItem, fallback) {
  if (!Array.isArray(value)) {
    return fallback
  }

  const normalizedItems = value.map(normalizeItem).filter(Boolean)
  return normalizedItems.length > 0 ? normalizedItems : fallback
}

function normalizeMenuItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const label = readText(item.label, '')
  const href = readText(item.href, '')

  if (!label || !href) {
    return null
  }

  return { href, label }
}

function normalizeAction(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const label = readText(item.label, '')
  const href = readText(item.href, '')

  if (!label || !href) {
    return null
  }

  return {
    external: item.external === true,
    href,
    label,
    variant: readText(item.variant, 'secondary'),
  }
}

function isWhatsappHeaderAction(action) {
  if (!action || typeof action !== 'object') {
    return false
  }

  const label = readText(action.label, '').toLowerCase()
  const href = readText(action.href, '').toLowerCase()

  return label.includes('whatsapp') || href.includes('wa.me/')
}

function filterHeaderMenuActions(actions) {
  return Array.isArray(actions)
    ? actions.filter((action) => !isWhatsappHeaderAction(action))
    : []
}

function normalizeTitleTextItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const title = readText(item.title, '')
  const text = readText(item.text, '')

  if (!title || !text) {
    return null
  }

  return { text, title }
}

function normalizeComparisonColumn(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const title = readText(item.title, '')
  const points = readStringArray(item.points, [])

  if (!title || points.length === 0) {
    return null
  }

  return {
    points,
    title,
    variant: readText(item.variant, 'muted'),
  }
}

function normalizeChannelConfig(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const key = readText(item.key, '')
  const label = readText(item.label, '')
  const description = readText(item.description, '')
  const actionLabel = readText(item.actionLabel, '')

  if (!key || !label || !description || !actionLabel) {
    return null
  }

  return {
    actionLabel,
    description,
    external: item.external === true,
    href: readText(item.href, ''),
    key,
    label,
    value: readText(item.value, ''),
  }
}

function normalizePhoneHref(phone) {
  const cleanedValue = phone.trim().replace(/[^\d+]/g, '')
  return cleanedValue ? `tel:${cleanedValue}` : '#contacts'
}

function sanitizeExternalHref(value) {
  return hasConfiguredExternalUrl(value) ? value.trim() : ''
}

function readCurrentProductSlug() {
  if (typeof window === 'undefined') {
    return ''
  }

  return readProductSlugFromPathname(window.location.pathname)
}

const systemContactChannelKeys = new Set([
  'phone',
  'whatsapp',
  'telegram',
  'max',
  'vk',
])

const defaultContactChannelConfigByKey = new Map(
  defaultContactChannelConfigs.map((item) => [item.key, item])
)
const locationMenuItem = {
  href: '#location',
  label: 'Как добраться',
}

let publicBootstrapRequest = null

function createHeaderContacts(contacts) {
  return {
    address: readText(contacts.address, headerContacts.address),
    phoneLabel: contacts.phone,
    phoneHref: normalizePhoneHref(contacts.phone),
    maxHref: sanitizeExternalHref(contacts.maxUrl),
    telegramHref: sanitizeExternalHref(contacts.telegramUrl),
    vkHref: sanitizeExternalHref(contacts.vkUrl),
    whatsappHref: sanitizeExternalHref(contacts.whatsappUrl),
    workingHours: readText(contacts.workingHours, headerContacts.workingHours),
  }
}

function createYandexMapHref(address) {
  const normalizedAddress = readText(address, '')

  if (!normalizedAddress) {
    return ''
  }

  const params = new URLSearchParams({
    text: normalizedAddress,
    z: '16',
  })

  return `https://yandex.ru/maps/?${params.toString()}`
}

function createYandexMapEmbedSrc(address) {
  const normalizedAddress = readText(address, '')

  if (!normalizedAddress) {
    return ''
  }

  const params = new URLSearchParams({
    mode: 'search',
    text: normalizedAddress,
    z: '16',
  })

  return `https://yandex.ru/map-widget/v1/?${params.toString()}`
}

function createLocationDetails(contacts) {
  const address = readText(contacts?.address, headerContacts.address)

  return {
    address,
    mapEmbedSrc: createYandexMapEmbedSrc(address),
    mapHref: createYandexMapHref(address),
    workingHours: readText(
      contacts?.workingHours,
      headerContacts.workingHours
    ),
  }
}

function withLocationMenuItem(items) {
  const normalizedItems = Array.isArray(items) ? items : []

  if (
    normalizedItems.some(
      (item) => readText(item?.href, '') === locationMenuItem.href
    )
  ) {
    return normalizedItems
  }

  const contactsItemIndex = normalizedItems.findIndex(
    (item) => readText(item?.href, '') === '#contacts'
  )

  if (contactsItemIndex === -1) {
    return [...normalizedItems, locationMenuItem]
  }

  return [
    ...normalizedItems.slice(0, contactsItemIndex + 1),
    locationMenuItem,
    ...normalizedItems.slice(contactsItemIndex + 1),
  ]
}

function withLocationChannel(channels, location) {
  const normalizedChannels = Array.isArray(channels) ? channels : []

  if (!location.address || !location.mapHref) {
    return normalizedChannels
  }

  if (
    normalizedChannels.some(
      (channel) =>
        readText(channel?.key, '') === 'address' ||
        readText(channel?.label, '').toLowerCase() === 'адрес' ||
        readText(channel?.value, '') === location.address
    )
  ) {
    return normalizedChannels
  }

  const addressChannel = {
    actionLabel: 'Открыть карту',
    description: 'Откройте точку в Яндекс Картах, чтобы построить маршрут.',
    external: true,
    href: location.mapHref,
    key: 'address',
    label: 'Адрес',
    value: location.address,
  }

  if (normalizedChannels.length === 0) {
    return [addressChannel]
  }

  return [
    normalizedChannels[0],
    addressChannel,
    ...normalizedChannels.slice(1),
  ]
}

function getDefaultContactChannelHref(channelKey, contacts) {
  switch (channelKey) {
    case 'phone':
      return normalizePhoneHref(contacts.phone)
    case 'whatsapp':
      return sanitizeExternalHref(contacts.whatsappUrl)
    case 'telegram':
      return sanitizeExternalHref(contacts.telegramUrl)
    case 'max':
      return sanitizeExternalHref(contacts.maxUrl)
    case 'vk':
      return sanitizeExternalHref(contacts.vkUrl)
    default:
      return ''
  }
}

function getDefaultContactChannelValue(channelKey, contacts) {
  switch (channelKey) {
    case 'phone':
      return contacts.phone
    case 'whatsapp':
      return 'Написать в WhatsApp'
    case 'telegram':
      return 'Написать в Telegram'
    case 'max':
      return 'Написать в Max'
    case 'vk':
      return 'Перейти во VK'
    default:
      return ''
  }
}

function buildContactChannel(channelConfig, contacts) {
  const fallbackConfig = defaultContactChannelConfigByKey.get(channelConfig.key)
  const isSystemChannel = systemContactChannelKeys.has(channelConfig.key)
  const href = isSystemChannel
    ? getDefaultContactChannelHref(channelConfig.key, contacts)
    : readText(
        channelConfig.href,
        getDefaultContactChannelHref(channelConfig.key, contacts)
      )

  if (!href) {
    return null
  }

  return {
    actionLabel: readText(
      channelConfig.actionLabel,
      fallbackConfig?.actionLabel ?? ''
    ),
    description: readText(
      channelConfig.description,
      fallbackConfig?.description ?? ''
    ),
    external: isSystemChannel
      ? fallbackConfig?.external === true
      : typeof channelConfig.external === 'boolean'
        ? channelConfig.external
        : fallbackConfig?.external === true,
    href,
    key: channelConfig.key,
    label: readText(channelConfig.label, fallbackConfig?.label ?? ''),
    value: readText(
      channelConfig.value,
      getDefaultContactChannelValue(channelConfig.key, contacts) ||
        fallbackConfig?.value ||
        ''
    ),
  }
}

function mergeContactChannelConfigs(configs = null) {
  if (!Array.isArray(configs) || configs.length === 0) {
    return defaultContactChannelConfigs
  }

  const existingKeys = new Set(
    configs.map((item) => readText(item?.key, '')).filter(Boolean)
  )

  return [
    ...configs,
    ...defaultContactChannelConfigs.filter((item) => !existingKeys.has(item.key)),
  ]
}

function isVisiblePublicContactChannel(channel) {
  return !['max', 'vk'].includes(readText(channel?.key, ''))
}

function createContactChannels(contacts, configs = null) {
  const sourceConfigs = mergeContactChannelConfigs(configs)

  const resolvedChannels = sourceConfigs
    .map((config) => buildContactChannel(config, contacts))
    .filter(Boolean)
    .filter(isVisiblePublicContactChannel)

  if (resolvedChannels.length > 0) {
    return resolvedChannels
  }

  return defaultContactChannelConfigs
    .filter(isVisiblePublicContactChannel)
    .map((config) => buildContactChannel(config, contacts))
    .filter(Boolean)
}

function createShowcaseExamples(showcaseObjects) {
  return showcaseObjects.map((item) => ({
    color: item.color,
    image: item.coverImagePath,
    note: item.description,
    texture: item.texture,
    title: item.title,
  }))
}

function loadInitialPublicData() {
  if (!publicBootstrapRequest) {
    publicBootstrapRequest = Promise.allSettled([
      fetchProducts(),
      fetchSiteContent(),
    ]).finally(() => {
      publicBootstrapRequest = null
    })
  }

  return publicBootstrapRequest
}

function App() {
  const [products, setProducts] = useState([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [selectedProductSlug, setSelectedProductSlug] = useState(
    readCurrentProductSlug
  )
  const [siteContent, setSiteContent] = useState(null)
  const [siteContentError, setSiteContentError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsProductsLoading(true)
      setProductsError('')
      setSiteContentError('')

      const [productsResult, siteContentResult] = await loadInitialPublicData()

      if (!isMounted) {
        return
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value)
      } else {
        setProducts([])
        setProductsError(
          productsResult.reason?.message ?? 'Не удалось загрузить каталог.'
        )
      }

      if (siteContentResult.status === 'fulfilled') {
        setSiteContent(siteContentResult.value)
      } else {
        setSiteContent(null)
        setSiteContentError(
          siteContentResult.reason?.message ??
            'Не удалось загрузить часть редактируемого контента.'
        )
      }

      if (isMounted) {
        setIsProductsLoading(false)
      }
    }

    loadData().catch((error) => {
      if (isMounted) {
        setProductsError(error.message)
        setIsProductsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setSelectedProductSlug(readCurrentProductSlug())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const blocks = siteContent?.blocks ?? []
  const headerBlock = findBlock(blocks, 'header')
  const heroBlock = findBlock(blocks, 'hero')
  const productOverviewBlock = findBlock(blocks, 'product-overview')
  const whyUsBlock = findBlock(blocks, 'why-us')
  const galleryBlock = findBlock(blocks, 'gallery')
  const catalogBlock = findBlock(blocks, 'catalog')
  const calculatorBlock = findBlock(blocks, 'calculator')
  const partnersBlock = findBlock(blocks, 'partners')
  const selfInstallBlock = findBlock(blocks, 'self-install')
  const contactsBlock = findBlock(blocks, 'contacts')
  const footerBlock = findBlock(blocks, 'footer')

  const resolvedHeaderContacts = siteContent?.contacts
    ? createHeaderContacts(siteContent.contacts)
    : headerContacts
  const resolvedLocation = createLocationDetails(
    siteContent?.contacts ?? resolvedHeaderContacts
  )

  const resolvedHeaderContent = {
    brand: {
      badge: readText(
        headerBlock?.extraData?.brandBadge,
        sectionTextDefaults.header.brandBadge
      ),
      subtitle: readText(
        headerBlock?.subtitle,
        sectionTextDefaults.header.brandSubtitle
      ),
      title: readBrandTitle(headerBlock?.title),
    },
    cta: {
      href: readText(headerBlock?.ctaLink, sectionTextDefaults.header.ctaHref),
      label: readText(
        headerBlock?.ctaLabel,
        sectionTextDefaults.header.ctaLabel
      ),
      shortLabel: readText(
        headerBlock?.extraData?.ctaShortLabel,
        sectionTextDefaults.header.ctaShortLabel
      ),
    },
    menuActions: filterHeaderMenuActions(
      readObjectArray(
        headerBlock?.extraData?.menuActions,
        normalizeAction,
        menuActions
      )
    ),
    menuItems: withLocationMenuItem(
      readObjectArray(headerBlock?.extraData?.menuItems, normalizeMenuItem, menuItems)
    ),
    messengerLabels: {
      telegram: readText(
        headerBlock?.extraData?.messengerLabels?.telegram,
        sectionTextDefaults.header.messengerLabels.telegram
      ),
      vk: readText(
        headerBlock?.extraData?.messengerLabels?.vk,
        sectionTextDefaults.header.messengerLabels.vk
      ),
      whatsapp: readText(
        headerBlock?.extraData?.messengerLabels?.whatsapp,
        sectionTextDefaults.header.messengerLabels.whatsapp
      ),
    },
    phoneShortLabel: readText(
      headerBlock?.extraData?.phoneShortLabel,
      sectionTextDefaults.header.phoneShortLabel
    ),
  }

  const contactChannelConfigs = readObjectArray(
    contactsBlock?.extraData?.channels,
    normalizeChannelConfig,
    null
  )

  const resolvedContactChannelsBase = siteContent?.contacts
    ? createContactChannels(siteContent.contacts, contactChannelConfigs)
    : contactChannels.filter(isVisiblePublicContactChannel)
  const resolvedContactChannels = withLocationChannel(
    resolvedContactChannelsBase,
    resolvedLocation
  )

  const resolvedProjectExamples =
    siteContent?.showcaseObjects?.length > 0
      ? createShowcaseExamples(siteContent.showcaseObjects)
      : projectExamples

  const resolvedHeroContent = {
    action: {
      href: readText(heroBlock?.ctaLink, sectionTextDefaults.hero.ctaHref),
      label: readText(heroBlock?.ctaLabel, sectionTextDefaults.hero.ctaLabel),
      variant: 'primary',
    },
    eyebrow: readText(heroBlock?.subtitle, sectionTextDefaults.hero.subtitle),
    image: readText(heroBlock?.extraData?.image, placeholderImage),
    lead: readText(
      heroBlock?.body,
      sectionTextDefaults.hero.body
    ),
    title: readText(
      heroBlock?.title,
      sectionTextDefaults.hero.title
    ),
  }

  const resolvedProductOverviewContent = {
    badges: readStringArray(productOverviewBlock?.extraData?.badges, []),
    blocks: readObjectArray(
      productOverviewBlock?.extraData?.blocks,
      normalizeTitleTextItem,
      productDescriptionBlocks
    ),
    composition: readStringArray(productOverviewBlock?.extraData?.composition, []),
    ctaHref: readText(
      productOverviewBlock?.ctaLink,
      sectionTextDefaults.productOverview.ctaHref
    ),
    ctaLabel: readText(
      productOverviewBlock?.ctaLabel,
      sectionTextDefaults.productOverview.ctaLabel
    ),
    description: readText(productOverviewBlock?.body, ''),
    eyebrow: readText(productOverviewBlock?.subtitle, ''),
    feature: {
      image: readText(
        productOverviewBlock?.extraData?.featureImage,
        materialFeature.image
      ),
      locationNote: resolvedLocation.address
        ? 'г. Пятигорск, Бештаугорское шоссе, 56'
        : '',
      text: readText(
        productOverviewBlock?.extraData?.featureText,
        materialFeature.text
      ),
      title: readText(
        productOverviewBlock?.extraData?.featureTitle,
        materialFeature.title
      ),
    },
    overview: readStringArray(
      productOverviewBlock?.extraData?.overview,
      materialOverview
    ),
    title: readText(
      productOverviewBlock?.title,
      sectionTextDefaults.productOverview.title
    ),
  }

  const resolvedWhyUsContent = {
    columns: readObjectArray(
      whyUsBlock?.extraData?.columns,
      normalizeComparisonColumn,
      comparisonColumns
    ),
    description: readText(whyUsBlock?.body, ''),
    eyebrow: readText(whyUsBlock?.subtitle, ''),
    title: readText(
      whyUsBlock?.title,
      sectionTextDefaults.whyUs.title
    ),
  }

  const resolvedGalleryContent = {
    description: readText(galleryBlock?.body, ''),
    eyebrow: readText(galleryBlock?.subtitle, ''),
    footerActionHref: readText(
      galleryBlock?.ctaLink,
      sectionTextDefaults.gallery.ctaHref
    ),
    footerActionLabel: readText(
      galleryBlock?.ctaLabel,
      sectionTextDefaults.gallery.ctaLabel
    ),
    hint: readText(galleryBlock?.extraData?.hint, ''),
    title: readText(galleryBlock?.title, sectionTextDefaults.gallery.title),
  }

  const resolvedCatalogContent = {
    ctaHref: readText(catalogBlock?.ctaLink, sectionTextDefaults.catalog.ctaHref),
    ctaLabel: readText(
      catalogBlock?.ctaLabel,
      sectionTextDefaults.catalog.ctaLabel
    ),
    description: readText(catalogBlock?.body, ''),
    eyebrow: readText(catalogBlock?.subtitle, ''),
    title: readText(
      catalogBlock?.title,
      sectionTextDefaults.catalog.title
    ),
  }

  const resolvedCalculatorContent = {
    title: readText(
      calculatorBlock?.title,
      sectionTextDefaults.calculator.title
    ),
  }

  const resolvedSelfInstallContent = {
    ...selfInstallContent,
    body: readText(selfInstallBlock?.body, selfInstallContent.body),
    ctaHref: readText(
      selfInstallBlock?.ctaLink,
      sectionTextDefaults.selfInstall.ctaHref
    ),
    ctaLabel: readText(
      selfInstallBlock?.ctaLabel,
      sectionTextDefaults.selfInstall.ctaLabel
    ),
    description: '',
    eyebrow: readText(selfInstallBlock?.subtitle, ''),
    image: readText(
      selfInstallBlock?.extraData?.image,
      selfInstallContent.image
    ),
    mediaText: readText(
      selfInstallBlock?.extraData?.mediaText,
      selfInstallContent.mediaText
    ),
    points:
      Array.isArray(selfInstallBlock?.extraData?.points) &&
      selfInstallBlock.extraData.points.length > 0
        ? selfInstallBlock.extraData.points
        : selfInstallContent.points,
    title: readText(
      selfInstallBlock?.title,
      sectionTextDefaults.selfInstall.title
    ),
    videoLabel: readText(
      selfInstallBlock?.extraData?.videoLabel,
      selfInstallContent.videoLabel
    ),
    videoUrl: sanitizeExternalHref(
      selfInstallBlock?.extraData?.videoUrl ?? selfInstallContent.videoUrl
    ),
  }

  const resolvedPartnersContent = {
    ctaHref: readText(
      partnersBlock?.ctaLink,
      sectionTextDefaults.partners.ctaHref
    ),
    ctaLabel: readText(
      partnersBlock?.ctaLabel,
      sectionTextDefaults.partners.ctaLabel
    ),
    description: readText(
      partnersBlock?.body,
      sectionTextDefaults.partners.description
    ),
    eyebrow: readText(partnersBlock?.subtitle, ''),
    leadBadge: readText(
      partnersBlock?.extraData?.leadBadge,
      sectionTextDefaults.partners.leadBadge
    ),
    leadTitle: readText(
      partnersBlock?.extraData?.leadTitle,
      sectionTextDefaults.partners.leadTitle
    ),
    options: readObjectArray(
      partnersBlock?.extraData?.options,
      normalizeTitleTextItem,
      partnerOptions
    ),
    title: readText(
      partnersBlock?.title,
      sectionTextDefaults.partners.title
    ),
  }

  const resolvedContactsContent = {
    description: readText(contactsBlock?.body, ''),
    eyebrow: readText(contactsBlock?.subtitle, ''),
    introEyebrow: readText(
      contactsBlock?.extraData?.introEyebrow,
      sectionTextDefaults.contacts.introEyebrow
    ),
    introText: readText(
      contactsBlock?.extraData?.introText,
      sectionTextDefaults.contacts.introText
    ),
    title: readText(contactsBlock?.title, sectionTextDefaults.contacts.title),
  }

  const resolvedFooterContent = {
    copy: readText(
      footerBlock?.body,
      sectionTextDefaults.footer.copy
    ),
    telegramLabel: readText(
      footerBlock?.extraData?.telegramLabel,
      sectionTextDefaults.footer.telegramLabel
    ),
    whatsappLabel: readText(
      footerBlock?.extraData?.whatsappLabel,
      sectionTextDefaults.footer.whatsappLabel
    ),
  }

  const selectedProduct = selectedProductSlug
    ? products.find((product) => product.slug === selectedProductSlug) ?? null
    : null
  const isMissingProduct =
    Boolean(selectedProductSlug) &&
    !isProductsLoading &&
    !productsError &&
    !selectedProduct

  const handleOpenProduct = (slug) => {
    const nextPath = getProductPagePath(slug)

    if (window.location.pathname !== nextPath) {
      window.history.pushState({ productSlug: slug }, '', nextPath)
    }

    setSelectedProductSlug(slug)
  }

  const handleCloseProduct = () => {
    const nextUrl = '/#catalog'

    if (
      window.location.pathname !== '/' ||
      window.location.hash !== '#catalog'
    ) {
      window.history.pushState({}, '', nextUrl)
    }

    setSelectedProductSlug('')
  }

  return (
    <div className="page-shell">
      <AnalyticsBootstrap />
      <SiteSeo
        contacts={resolvedHeaderContacts}
        description={resolvedHeroContent.lead}
        isMissingProduct={isMissingProduct}
        pagePath={window.location.pathname || '/'}
        product={selectedProduct}
        products={products}
        title={resolvedHeroContent.title}
      />
      <Header
        brand={resolvedHeaderContent.brand}
        contacts={resolvedHeaderContacts}
        headerCta={resolvedHeaderContent.cta}
        menuActions={resolvedHeaderContent.menuActions}
        menuItems={resolvedHeaderContent.menuItems}
        messengerLabels={resolvedHeaderContent.messengerLabels}
        phoneShortLabel={resolvedHeaderContent.phoneShortLabel}
      />
      {siteContentError ? (
        <div aria-live="polite" className="page-shell__notice">
          Часть контента временно загружена из резервных данных. {siteContentError}
        </div>
      ) : null}
      <main>
        <HeroSection
          action={resolvedHeroContent.action}
          eyebrow={resolvedHeroContent.eyebrow}
          image={resolvedHeroContent.image}
          lead={resolvedHeroContent.lead}
          title={resolvedHeroContent.title}
        />
        <ProductOverviewSection
          badges={resolvedProductOverviewContent.badges}
          blocks={resolvedProductOverviewContent.blocks}
          composition={resolvedProductOverviewContent.composition}
          ctaHref={resolvedProductOverviewContent.ctaHref}
          ctaLabel={resolvedProductOverviewContent.ctaLabel}
          description={resolvedProductOverviewContent.description}
          eyebrow={resolvedProductOverviewContent.eyebrow}
          feature={resolvedProductOverviewContent.feature}
          overview={resolvedProductOverviewContent.overview}
          title={resolvedProductOverviewContent.title}
        />
        <WhyUsSection
          columns={resolvedWhyUsContent.columns}
          description={resolvedWhyUsContent.description}
          eyebrow={resolvedWhyUsContent.eyebrow}
          title={resolvedWhyUsContent.title}
        />
        <FacadeGallerySection
          description={resolvedGalleryContent.description}
          examples={resolvedProjectExamples}
          eyebrow={resolvedGalleryContent.eyebrow}
          footerActionHref={resolvedGalleryContent.footerActionHref}
          footerActionLabel={resolvedGalleryContent.footerActionLabel}
          hint={resolvedGalleryContent.hint}
          title={resolvedGalleryContent.title}
        />
        <CatalogSection
          activeProductSlug={selectedProductSlug}
          contacts={resolvedHeaderContacts}
          ctaHref={resolvedCatalogContent.ctaHref}
          ctaLabel={resolvedCatalogContent.ctaLabel}
          description={resolvedCatalogContent.description}
          eyebrow={resolvedCatalogContent.eyebrow}
          error={productsError}
          isLoading={isProductsLoading}
          onCloseProduct={handleCloseProduct}
          onOpenProduct={handleOpenProduct}
          products={products}
          title={resolvedCatalogContent.title}
        />
        <CalculatorSection
          error={productsError}
          isLoading={isProductsLoading}
          products={products}
          title={resolvedCalculatorContent.title}
        />
        <SelfInstallSection content={resolvedSelfInstallContent} />
        <PartnersSection
          ctaHref={resolvedPartnersContent.ctaHref}
          ctaLabel={resolvedPartnersContent.ctaLabel}
          description={resolvedPartnersContent.description}
          eyebrow={resolvedPartnersContent.eyebrow}
          leadBadge={resolvedPartnersContent.leadBadge}
          leadTitle={resolvedPartnersContent.leadTitle}
          options={resolvedPartnersContent.options}
          title={resolvedPartnersContent.title}
        />
        <ContactsSection
          channels={resolvedContactChannels}
          description={resolvedContactsContent.description}
          eyebrow={resolvedContactsContent.eyebrow}
          introEyebrow={resolvedContactsContent.introEyebrow}
          introText={resolvedContactsContent.introText}
          title={resolvedContactsContent.title}
        />
        <LocationSection
          address={resolvedLocation.address}
          mapEmbedSrc={resolvedLocation.mapEmbedSrc}
          mapHref={resolvedLocation.mapHref}
          workingHours={resolvedLocation.workingHours}
        />
      </main>
      <Footer
        contacts={resolvedHeaderContacts}
        copy={resolvedFooterContent.copy}
        telegramLabel={resolvedFooterContent.telegramLabel}
        whatsappLabel={resolvedFooterContent.whatsappLabel}
      />
    </div>
  )
}

export default App
