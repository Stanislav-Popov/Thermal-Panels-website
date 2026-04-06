import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
} from '../src/lib/seo.js'
import {
  distDirectory,
  normalizeSiteUrl,
  resolveBuildEnv,
  resolveSeoProducts,
} from './seo-helpers.mjs'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function upsertTitle(html, title) {
  const titleTag = `<title>${escapeHtml(title)}</title>`
  return /<title>.*?<\/title>/i.test(html)
    ? html.replace(/<title>.*?<\/title>/i, titleTag)
    : html.replace('</head>', `  ${titleTag}\n</head>`)
}

function upsertMetaTag(html, attrName, attrValue, content) {
  const metaTag = `<meta ${attrName}="${escapeHtml(attrValue)}" content="${escapeHtml(content)}" />`
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}=["']${escapeRegex(attrValue)}["'][^>]*>`,
    'i'
  )

  return pattern.test(html)
    ? html.replace(pattern, metaTag)
    : html.replace('</head>', `  ${metaTag}\n</head>`)
}

function upsertLinkTag(html, rel, href) {
  const linkTag = `<link rel="${escapeHtml(rel)}" href="${escapeHtml(href)}" />`
  const pattern = new RegExp(`<link\\s+[^>]*rel=["']${escapeRegex(rel)}["'][^>]*>`, 'i')

  return pattern.test(html)
    ? html.replace(pattern, linkTag)
    : html.replace('</head>', `  ${linkTag}\n</head>`)
}

function upsertJsonLd(html, key, value) {
  const scriptTag = `<script type="application/ld+json" data-static-seo="${escapeHtml(key)}">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`
  const pattern = new RegExp(
    `<script\\s+type=["']application/ld\\+json["']\\s+data-static-seo=["']${escapeRegex(key)}["'][^>]*>.*?<\\/script>`,
    'is'
  )

  return pattern.test(html)
    ? html.replace(pattern, scriptTag)
    : html.replace('</head>', `  ${scriptTag}\n</head>`)
}

function applySeo(html, { canonicalUrl, description, imageUrl, jsonLd, title, type }) {
  let nextHtml = html

  nextHtml = upsertTitle(nextHtml, title)
  nextHtml = upsertLinkTag(nextHtml, 'canonical', canonicalUrl)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'description', description)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'robots', 'index,follow')
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:card', 'summary_large_image')
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:title', title)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:description', description)
  nextHtml = upsertMetaTag(nextHtml, 'name', 'twitter:image', imageUrl)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:title', title)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:description', description)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:type', type)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:locale', 'ru_RU')
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:url', canonicalUrl)
  nextHtml = upsertMetaTag(nextHtml, 'property', 'og:image', imageUrl)
  nextHtml = upsertJsonLd(nextHtml, 'primary', jsonLd)

  return nextHtml
}

function createHomeStructuredData(siteUrl, products) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${siteUrl}#website`,
        '@type': 'WebSite',
        description: defaultSeoDescription,
        inLanguage: 'ru-RU',
        name: brandName,
        url: siteUrl,
      },
      {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          item: {
            '@type': 'Product',
            description: product.shortDescription,
            image: buildAbsoluteUrl(siteUrl, getProductPrimaryImage(product)),
            name: product.name,
            offers: {
              '@type': 'Offer',
              availability:
                product.availabilityStatus === 'В наличии'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/PreOrder',
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
      },
    ],
  }
}

function createProductStructuredData(siteUrl, product) {
  const productUrl = buildAbsoluteUrl(siteUrl, getProductPagePath(product.slug))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${siteUrl}#website`,
        '@type': 'WebSite',
        name: brandName,
        url: siteUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            item: siteUrl,
            name: 'Главная',
            position: 1,
          },
          {
            '@type': 'ListItem',
            item: productUrl,
            name: product.name,
            position: 2,
          },
        ],
      },
      {
        '@type': 'Product',
        brand: {
          '@type': 'Brand',
          name: brandName,
        },
        category: product.texture,
        description: getProductSeoDescription(product),
        image: (product.gallery ?? []).map((item) =>
          buildAbsoluteUrl(siteUrl, item.image)
        ),
        name: product.name,
        offers: {
          '@type': 'Offer',
          availability:
            product.availabilityStatus === 'В наличии'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/PreOrder',
          price: product.priceCurrent,
          priceCurrency: 'RUB',
          url: productUrl,
        },
        sku: product.slug,
      },
    ],
  }
}

const resolvedEnv = resolveBuildEnv()
const siteUrl = normalizeSiteUrl(resolvedEnv.VITE_SITE_URL)
const products = await resolveSeoProducts(resolvedEnv)
const indexHtmlPath = resolve(distDirectory, 'index.html')

if (!existsSync(indexHtmlPath)) {
  throw new Error(`Build output not found: ${indexHtmlPath}`)
}

const templateHtml = readFileSync(indexHtmlPath, 'utf8')

const homepageHtml = applySeo(templateHtml, {
  canonicalUrl: buildAbsoluteUrl(siteUrl, '/'),
  description: defaultSeoDescription,
  imageUrl: buildAbsoluteUrl(siteUrl, defaultSeoImagePath),
  jsonLd: createHomeStructuredData(siteUrl, products),
  title: defaultSeoTitle,
  type: 'website',
})

writeFileSync(indexHtmlPath, homepageHtml, 'utf8')

for (const product of products) {
  const productPath = getProductPagePath(product.slug)
  const productDirectory = resolve(distDirectory, productPath.slice(1))
  const productHtmlPath = resolve(productDirectory, 'index.html')

  mkdirSync(productDirectory, { recursive: true })

  const productHtml = applySeo(templateHtml, {
    canonicalUrl: buildAbsoluteUrl(siteUrl, productPath),
    description: getProductSeoDescription(product),
    imageUrl: buildAbsoluteUrl(siteUrl, getProductPrimaryImage(product)),
    jsonLd: createProductStructuredData(siteUrl, product),
    title: getProductSeoTitle(product),
    type: 'product',
  })

  writeFileSync(productHtmlPath, productHtml, 'utf8')
}

console.log(`Generated static SEO pages for ${products.length} catalog items.`)
