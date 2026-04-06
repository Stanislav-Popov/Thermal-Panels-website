import { useEffect, useMemo } from 'react'
import {
  setJsonLdScript,
  setLinkTag,
  setNamedMeta,
  setPropertyMeta,
} from '../lib/documentMeta.js'
import {
  brandName,
  buildAbsoluteUrl,
  defaultSeoDescription,
  defaultSeoImagePath,
  defaultSeoTitle,
  getProductPagePath,
  getProductPrimaryImage,
  getProductSeoDescription,
  getProductSeoTitle,
  normalizeSiteUrl,
} from '../lib/seo.js'

function mapAvailability(status) {
  return status === 'В наличии'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/PreOrder'
}

function createWebsiteNode(description, siteUrl) {
  return {
    '@id': siteUrl ? `${siteUrl}#website` : '#website',
    '@type': 'WebSite',
    description,
    inLanguage: 'ru-RU',
    name: brandName,
    ...(siteUrl ? { url: siteUrl } : {}),
  }
}

function createOrganizationNode(contacts, description, siteUrl) {
  return {
    '@id': siteUrl ? `${siteUrl}#organization` : '#organization',
    '@type': 'Organization',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        availableLanguage: ['Russian'],
        contactType: 'sales',
        telephone: contacts.phoneLabel,
      },
    ],
    description,
    name: brandName,
    ...(contacts.address ? { address: contacts.address } : {}),
    ...(siteUrl ? { url: siteUrl } : {}),
    ...(contacts.telegramHref || contacts.vkHref || contacts.whatsappHref
      ? {
          sameAs: [
            contacts.whatsappHref,
            contacts.telegramHref,
            contacts.vkHref,
          ].filter(Boolean),
        }
      : {}),
    telephone: contacts.phoneLabel,
  }
}

function createWebPageNode({ canonicalUrl, description, imageUrl, siteUrl, title }) {
  return {
    '@type': 'WebPage',
    description,
    inLanguage: 'ru-RU',
    name: title,
    ...(imageUrl ? { primaryImageOfPage: imageUrl } : {}),
    ...(siteUrl ? { isPartOf: { '@id': `${siteUrl}#website` } } : {}),
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
  }
}

function createProductNode(product, canonicalUrl, description, imageUrls, siteUrl) {
  return {
    '@type': 'Product',
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    category: product.texture,
    color: [product.brickColor, product.jointColor].filter(Boolean).join(', '),
    description,
    image: imageUrls,
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability: mapAvailability(product.availabilityStatus),
      price: product.priceCurrent,
      priceCurrency: 'RUB',
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    sku: product.slug,
    ...(siteUrl ? { mainEntityOfPage: canonicalUrl } : {}),
    ...(product.thickness
      ? {
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Толщина',
              value: product.thickness,
            },
            {
              '@type': 'PropertyValue',
              name: 'Площадь панели',
              value: `${product.panelArea} м²`,
            },
          ],
        }
      : {}),
  }
}

function createItemListNode(products, siteUrl) {
  return {
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      item: {
        '@type': 'Product',
        category: product.texture,
        description: product.shortDescription,
        image: buildAbsoluteUrl(siteUrl, getProductPrimaryImage(product)),
        name: product.name,
        offers: {
          '@type': 'Offer',
          availability: mapAvailability(product.availabilityStatus),
          price: product.priceCurrent,
          priceCurrency: 'RUB',
          url: buildAbsoluteUrl(siteUrl, getProductPagePath(product.slug)),
        },
        sku: product.slug,
      },
      position: index + 1,
      url: buildAbsoluteUrl(siteUrl, getProductPagePath(product.slug)),
    })),
    name: 'Каталог термопанелей Thermal Panels',
    numberOfItems: products.length,
  }
}

function createBreadcrumbNode(product, canonicalUrl, siteUrl) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        item: buildAbsoluteUrl(siteUrl, '/'),
        name: 'Главная',
        position: 1,
      },
      {
        '@type': 'ListItem',
        item: buildAbsoluteUrl(siteUrl, canonicalUrl),
        name: product.name,
        position: 2,
      },
    ],
  }
}

function createStructuredData({
  canonicalUrl,
  contacts,
  description,
  imageUrl,
  product,
  products,
  siteUrl,
  title,
}) {
  const graph = [
    createWebsiteNode(description, siteUrl),
    createOrganizationNode(contacts, description, siteUrl),
    createWebPageNode({
      canonicalUrl,
      description,
      imageUrl,
      siteUrl,
      title,
    }),
  ]

  if (product) {
    const imageUrls = (product.gallery ?? [])
      .map((item) => buildAbsoluteUrl(siteUrl, item.image))
      .filter(Boolean)

    graph.push(
      createProductNode(product, canonicalUrl, description, imageUrls, siteUrl),
      createBreadcrumbNode(product, canonicalUrl, siteUrl)
    )
  } else if (products.length > 0) {
    graph.push(createItemListNode(products, siteUrl))
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function SiteSeo({
  contacts,
  description,
  isMissingProduct = false,
  pagePath = '/',
  product = null,
  products,
  title,
}) {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL ?? '')

  const resolvedTitle = product
    ? getProductSeoTitle(product)
    : title?.trim()
      ? `${title.trim()} | ${brandName}`
      : defaultSeoTitle
  const resolvedDescription = product
    ? getProductSeoDescription(product)
    : description?.trim() || defaultSeoDescription
  const resolvedPagePath = product ? getProductPagePath(product.slug) : pagePath || '/'
  const canonicalUrl = buildAbsoluteUrl(siteUrl, resolvedPagePath)
  const imageUrl = buildAbsoluteUrl(
    siteUrl,
    product ? getProductPrimaryImage(product) : defaultSeoImagePath
  )
  const robotsContent = isMissingProduct ? 'noindex,follow' : 'index,follow'

  const structuredData = useMemo(
    () =>
      createStructuredData({
        canonicalUrl,
        contacts,
        description: resolvedDescription,
        imageUrl,
        product,
        products,
        siteUrl,
        title: resolvedTitle,
      }),
    [
      canonicalUrl,
      contacts,
      imageUrl,
      product,
      products,
      resolvedDescription,
      resolvedTitle,
      siteUrl,
    ]
  )

  useEffect(() => {
    document.documentElement.lang = 'ru'
    document.title = resolvedTitle

    setLinkTag('canonical', canonicalUrl)
    setNamedMeta('description', resolvedDescription)
    setNamedMeta('robots', robotsContent)
    setNamedMeta('twitter:card', 'summary_large_image')
    setNamedMeta('twitter:description', resolvedDescription)
    setNamedMeta('twitter:image', imageUrl)
    setNamedMeta('twitter:title', resolvedTitle)
    setPropertyMeta('og:description', resolvedDescription)
    setPropertyMeta('og:image', imageUrl)
    setPropertyMeta('og:locale', 'ru_RU')
    setPropertyMeta('og:title', resolvedTitle)
    setPropertyMeta('og:type', product ? 'product' : 'website')
    setPropertyMeta('og:url', canonicalUrl)
    setJsonLdScript('primary', structuredData)
  }, [
    canonicalUrl,
    imageUrl,
    product,
    resolvedDescription,
    resolvedTitle,
    robotsContent,
    structuredData,
  ])

  return null
}
