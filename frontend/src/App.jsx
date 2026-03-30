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
import { PartnersSection } from './components/PartnersSection.jsx'
import { ProductOverviewSection } from './components/ProductOverviewSection.jsx'
import { SelfInstallSection } from './components/SelfInstallSection.jsx'
import { SiteSeo } from './components/SiteSeo.jsx'
import { WhyUsSection } from './components/WhyUsSection.jsx'
import { fetchProducts, fetchSiteContent } from './lib/publicApi.js'
import { hasConfiguredExternalUrl } from './lib/materialReadiness.js'
import {
  comparisonColumns,
  contactChannels,
  headerContacts,
  heroActions,
  materialFeature,
  materialOverview,
  menuActions,
  menuItems,
  partnerDescription,
  partnerOptions,
  placeholderImage,
  productDescriptionBlocks,
  projectExamples,
  selfInstallContent,
  showcaseCards,
} from './content/landingContent.js'

function findBlock(blocks, blockKey) {
  return blocks.find((block) => block.blockKey === blockKey) ?? null
}

function readText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
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

function normalizeGalleryCard(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const title = readText(item.title, '')
  const meta = readText(item.meta, '')
  const image = readText(item.image, '')

  if (!title || !meta || !image) {
    return null
  }

  return { image, meta, title }
}

function normalizeInstallationOption(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const value = readText(item.value, '')
  const title = readText(item.title, '')
  const text = readText(item.text, '')

  if (!value || !title || !text) {
    return null
  }

  return { text, title, value }
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

function createHeaderContacts(contacts) {
  return {
    phoneLabel: contacts.phone,
    phoneHref: normalizePhoneHref(contacts.phone),
    telegramHref: sanitizeExternalHref(contacts.telegramUrl),
    vkHref: sanitizeExternalHref(contacts.vkUrl),
    whatsappHref: sanitizeExternalHref(contacts.whatsappUrl),
  }
}

function createContactChannels(contacts, configs = null) {
  const fallbackChannels = [
    {
      actionLabel: 'Позвонить',
      description: 'Быстрый звонок для расчёта и обсуждения фасада.',
      href: normalizePhoneHref(contacts.phone),
      label: 'Телефон',
      value: contacts.phone,
    },
    {
      actionLabel: 'Написать в WhatsApp',
      description: 'Можно отправить фото дома и быстро уточнить детали.',
      external: true,
      href: contacts.whatsappUrl,
      label: 'WhatsApp',
      value: 'Написать в WhatsApp',
    },
    {
      actionLabel: 'Написать в Telegram',
      description: 'Удобно для переписки и уточнения деталей.',
      external: true,
      href: contacts.telegramUrl,
      label: 'Telegram',
      value: 'Написать в Telegram',
    },
    {
      actionLabel: 'Открыть VK',
      description: 'Можно посмотреть обновления и связаться удобным способом.',
      external: true,
      href: contacts.vkUrl,
      label: 'VK',
      value: 'Перейти во VK',
    },
  ]

  if (!configs || configs.length === 0) {
    return fallbackChannels
  }

  const contactValues = {
    phone: {
      external: false,
      href: normalizePhoneHref(contacts.phone),
      value: contacts.phone,
    },
    telegram: {
      external: true,
      href: sanitizeExternalHref(contacts.telegramUrl),
      value: 'Написать в Telegram',
    },
    vk: {
      external: true,
      href: sanitizeExternalHref(contacts.vkUrl),
      value: 'Перейти во VK',
    },
    whatsapp: {
      external: true,
      href: sanitizeExternalHref(contacts.whatsappUrl),
      value: 'Написать в WhatsApp',
    },
  }

  const resolvedChannels = configs
    .map((config) => {
      const source = contactValues[config.key]
      const resolvedHref = config.href || source?.href || ''

      if ((!source && !config.href) || !resolvedHref) {
        return null
      }

      return {
        actionLabel: config.actionLabel,
        description: config.description,
        external: source ? source.external : config.external,
        href: resolvedHref,
        label: config.label,
        value: config.value || source.value,
      }
    })
    .filter(Boolean)

  return resolvedChannels.length > 0 ? resolvedChannels : fallbackChannels
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

function App() {
  const [products, setProducts] = useState([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [siteContent, setSiteContent] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      setIsProductsLoading(true)
      setProductsError('')

      const [productsResult, siteContentResult] = await Promise.allSettled([
        fetchProducts(controller.signal),
        fetchSiteContent(controller.signal),
      ])

      if (controller.signal.aborted) {
        return
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value)
      } else if (productsResult.reason?.name !== 'AbortError') {
        setProductsError(
          productsResult.reason?.message ?? 'Не удалось загрузить каталог.'
        )
      }

      if (siteContentResult.status === 'fulfilled') {
        setSiteContent(siteContentResult.value)
      } else if (siteContentResult.reason?.name !== 'AbortError') {
        setSiteContent(null)
      }

      if (!controller.signal.aborted) {
        setIsProductsLoading(false)
      }
    }

    loadData().catch((error) => {
      if (error.name !== 'AbortError' && !controller.signal.aborted) {
        setProductsError(error.message)
        setIsProductsLoading(false)
      }
    })

    return () => {
      controller.abort()
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

  const resolvedHeaderContent = {
    brand: {
      badge: readText(headerBlock?.extraData?.brandBadge, 'TP'),
      subtitle: readText(
        headerBlock?.subtitle,
        'Утепление и облицовка фасада'
      ),
      title: readText(headerBlock?.title, 'Thermal Panels'),
    },
    cta: {
      href: readText(headerBlock?.ctaLink, '#calculator'),
      label: readText(headerBlock?.ctaLabel, 'Рассчитать стоимость'),
      shortLabel: readText(headerBlock?.extraData?.ctaShortLabel, 'Расчёт'),
    },
    menuActions: readObjectArray(
      headerBlock?.extraData?.menuActions,
      normalizeAction,
      menuActions
    ),
    menuItems: readObjectArray(
      headerBlock?.extraData?.menuItems,
      normalizeMenuItem,
      menuItems
    ),
    messengerLabels: {
      telegram: readText(headerBlock?.extraData?.messengerLabels?.telegram, 'TG'),
      vk: readText(headerBlock?.extraData?.messengerLabels?.vk, 'VK'),
      whatsapp: readText(headerBlock?.extraData?.messengerLabels?.whatsapp, 'WA'),
    },
    phoneShortLabel: readText(
      headerBlock?.extraData?.phoneShortLabel,
      'Позвонить'
    ),
  }

  const contactChannelConfigs = readObjectArray(
    contactsBlock?.extraData?.channels,
    normalizeChannelConfig,
    null
  )

  const resolvedContactChannels = siteContent?.contacts
    ? createContactChannels(siteContent.contacts, contactChannelConfigs)
    : contactChannels

  const resolvedProjectExamples =
    siteContent?.showcaseObjects?.length > 0
      ? createShowcaseExamples(siteContent.showcaseObjects)
      : projectExamples

  const resolvedHeroContent = {
    actions:
      readObjectArray(heroBlock?.extraData?.actions, normalizeAction, null) ??
      heroActions,
    eyebrow: readText(heroBlock?.subtitle, 'Термопанели для фасада'),
    image: readText(heroBlock?.extraData?.image, placeholderImage),
    lead: readText(
      heroBlock?.body,
      'Покажем фактуры, подберём сочетание цвета кирпича и шва и быстро дадим предварительный расчёт под ваш фасад.'
    ),
    title: readText(
      heroBlock?.title,
      'Декоративные термопанели для утепления и облицовки фасада'
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
    ctaHref: readText(productOverviewBlock?.ctaLink, '#calculator'),
    ctaLabel: readText(
      productOverviewBlock?.ctaLabel,
      'Рассчитать стоимость'
    ),
    description: readText(productOverviewBlock?.body, ''),
    eyebrow: readText(productOverviewBlock?.subtitle, ''),
    feature: {
      image: readText(
        productOverviewBlock?.extraData?.featureImage,
        materialFeature.image
      ),
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
      'Что важно знать о термопанелях'
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
      'Почему клиенты выбирают такой подход к фасаду'
    ),
  }

  const resolvedGalleryContent = {
    cards: readObjectArray(
      galleryBlock?.extraData?.cards,
      normalizeGalleryCard,
      showcaseCards
    ),
    description: readText(galleryBlock?.body, ''),
    eyebrow: readText(galleryBlock?.subtitle, ''),
    footerActionHref: readText(galleryBlock?.ctaLink, '#catalog'),
    footerActionLabel: readText(galleryBlock?.ctaLabel, 'Получить каталог'),
    hint: readText(galleryBlock?.extraData?.hint, ''),
    title: readText(galleryBlock?.title, 'Варианты панелей и фасадов'),
  }

  const resolvedCatalogContent = {
    description: readText(catalogBlock?.body, ''),
    eyebrow: readText(catalogBlock?.subtitle, ''),
    title: readText(
      catalogBlock?.title,
      'Подберите панель под фасад своего дома'
    ),
  }

  const resolvedCalculatorContent = {
    description: readText(calculatorBlock?.body, ''),
    eyebrow: readText(calculatorBlock?.subtitle, ''),
    installationOptions:
      readObjectArray(
        calculatorBlock?.extraData?.installationOptions,
        normalizeInstallationOption,
        null
      ) ?? undefined,
    title: readText(
      calculatorBlock?.title,
      'Рассчитайте стоимость отделки своего дома'
    ),
  }

  const resolvedSelfInstallContent = {
    ...selfInstallContent,
    body: readText(selfInstallBlock?.body, selfInstallContent.body),
    ctaHref: readText(selfInstallBlock?.ctaLink, '#contacts'),
    ctaLabel: readText(
      selfInstallBlock?.ctaLabel,
      'Получить консультацию'
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
      'Монтаж можно выполнить самостоятельно'
    ),
    videoLabel: readText(
      selfInstallBlock?.extraData?.videoLabel,
      selfInstallContent.videoLabel
    ),
  }

  const resolvedPartnersContent = {
    ctaHref: readText(partnersBlock?.ctaLink, '#contacts'),
    ctaLabel: readText(partnersBlock?.ctaLabel, 'Обсудить условия'),
    description: readText(partnersBlock?.body, partnerDescription),
    eyebrow: readText(partnersBlock?.subtitle, ''),
    options: readObjectArray(
      partnersBlock?.extraData?.options,
      normalizeTitleTextItem,
      partnerOptions
    ),
    title: readText(
      partnersBlock?.title,
      'Сотрудничество для магазинов, бригад и застройщиков'
    ),
  }

  const resolvedContactsContent = {
    description: readText(contactsBlock?.body, ''),
    eyebrow: readText(contactsBlock?.subtitle, ''),
    title: readText(contactsBlock?.title, 'Свяжитесь удобным способом'),
  }

  const resolvedFooterContent = {
    copy: readText(
      footerBlock?.body,
      'Thermal Panels • фасадные термопанели для утепления и облицовки дома'
    ),
    telegramLabel: readText(
      footerBlock?.extraData?.telegramLabel,
      'Telegram'
    ),
    vkLabel: readText(footerBlock?.extraData?.vkLabel, 'VK'),
    whatsappLabel: readText(
      footerBlock?.extraData?.whatsappLabel,
      'WhatsApp'
    ),
  }

  return (
    <div className="page-shell">
      <AnalyticsBootstrap />
      <SiteSeo
        contacts={resolvedHeaderContacts}
        description={resolvedHeroContent.lead}
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
      <main>
        <HeroSection
          actions={resolvedHeroContent.actions}
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
          cards={resolvedGalleryContent.cards}
          description={resolvedGalleryContent.description}
          examples={resolvedProjectExamples}
          eyebrow={resolvedGalleryContent.eyebrow}
          footerActionHref={resolvedGalleryContent.footerActionHref}
          footerActionLabel={resolvedGalleryContent.footerActionLabel}
          hint={resolvedGalleryContent.hint}
          title={resolvedGalleryContent.title}
        />
        <CatalogSection
          description={resolvedCatalogContent.description}
          eyebrow={resolvedCatalogContent.eyebrow}
          error={productsError}
          isLoading={isProductsLoading}
          products={products}
          title={resolvedCatalogContent.title}
        />
        <CalculatorSection
          contacts={resolvedHeaderContacts}
          description={resolvedCalculatorContent.description}
          error={productsError}
          eyebrow={resolvedCalculatorContent.eyebrow}
          installationOptions={resolvedCalculatorContent.installationOptions}
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
          options={resolvedPartnersContent.options}
          title={resolvedPartnersContent.title}
        />
        <ContactsSection
          channels={resolvedContactChannels}
          description={resolvedContactsContent.description}
          eyebrow={resolvedContactsContent.eyebrow}
          title={resolvedContactsContent.title}
        />
      </main>
      <Footer
        contacts={resolvedHeaderContacts}
        copy={resolvedFooterContent.copy}
        telegramLabel={resolvedFooterContent.telegramLabel}
        vkLabel={resolvedFooterContent.vkLabel}
        whatsappLabel={resolvedFooterContent.whatsappLabel}
      />
    </div>
  )
}

export default App
