import { useEffect, useMemo } from 'react'
import { setNamedMeta, setPropertyMeta } from '../lib/documentMeta.js'

const defaultDescription =
  'Thermal Panels: декоративные термопанели для утепления и облицовки фасада, каталог фактур, предварительный калькулятор стоимости и быстрые контакты.'

function getAbsoluteUrl(pathname, siteUrl) {
  if (!siteUrl || !pathname) {
    return undefined
  }

  if (/^https?:\/\//.test(pathname)) {
    return pathname
  }

  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

function createStructuredData({ contacts, description, products, siteUrl, title }) {
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      description,
      inLanguage: 'ru-RU',
      name: 'Thermal Panels',
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          availableLanguage: ['ru-RU'],
          contactType: 'customer support',
          telephone: contacts.phoneLabel,
        },
      ],
      description,
      name: 'Thermal Panels',
      ...(siteUrl ? { url: siteUrl } : {}),
      ...(contacts.telegramHref || contacts.vkHref
        ? {
            sameAs: [contacts.telegramHref, contacts.vkHref].filter(Boolean),
          }
        : {}),
      telephone: contacts.phoneLabel,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        item: {
          '@type': 'Product',
          category: product.texture,
          description: product.shortDescription,
          image: getAbsoluteUrl(product.gallery[0]?.image, siteUrl),
          name: product.name,
          offers: {
            '@type': 'Offer',
            availability:
              product.availabilityStatus === 'В наличии'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
            price: product.priceCurrent,
            priceCurrency: 'RUB',
          },
          sku: product.slug,
        },
        position: index + 1,
      })),
      name: title,
      numberOfItems: products.length,
    },
  ]

  return graph
}

export function SiteSeo({ contacts, description, products, title }) {
  const siteUrl = (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')

  const resolvedTitle = title?.trim()
    ? `${title.trim()} | Thermal Panels`
    : 'Термопанели для фасада | Thermal Panels'
  const resolvedDescription = description?.trim() || defaultDescription

  const structuredData = useMemo(
    () =>
      createStructuredData({
        contacts,
        description: resolvedDescription,
        products,
        siteUrl,
        title: 'Каталог термопанелей Thermal Panels',
      }),
    [contacts, products, resolvedDescription, siteUrl]
  )

  useEffect(() => {
    document.documentElement.lang = 'ru'
    document.title = resolvedTitle

    setNamedMeta('description', resolvedDescription)
    setNamedMeta('robots', 'index,follow')
    setNamedMeta('twitter:card', 'summary_large_image')
    setNamedMeta('twitter:description', resolvedDescription)
    setNamedMeta('twitter:title', resolvedTitle)
    setPropertyMeta('og:description', resolvedDescription)
    setPropertyMeta('og:locale', 'ru_RU')
    setPropertyMeta('og:title', resolvedTitle)
    setPropertyMeta('og:type', 'website')
  }, [resolvedDescription, resolvedTitle])

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
      type="application/ld+json"
    />
  )
}
