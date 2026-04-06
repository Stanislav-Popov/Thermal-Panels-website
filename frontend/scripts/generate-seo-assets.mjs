import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getProductPagePath } from '../src/lib/seo.js'
import {
  normalizeMetrikaId,
  normalizeSiteUrl,
  publicDirectory,
  resolveBuildEnv,
  resolveSeoProducts,
} from './seo-helpers.mjs'

const resolvedEnv = resolveBuildEnv()
const siteUrl = normalizeSiteUrl(resolvedEnv.VITE_SITE_URL)
const metrikaId = normalizeMetrikaId(resolvedEnv.VITE_YANDEX_METRIKA_ID)
const products = await resolveSeoProducts(resolvedEnv)

if (!metrikaId) {
  console.warn(
    'VITE_YANDEX_METRIKA_ID is empty. The site will build, but Yandex Metrika will stay disabled until you set the real counter ID.'
  )
}

const routes = [
  {
    changeFrequency: 'weekly',
    path: '/',
    priority: '1.0',
  },
  ...products.map((product) => ({
    changeFrequency: 'weekly',
    path: getProductPagePath(product.slug),
    priority: '0.8',
  })),
]

mkdirSync(publicDirectory, { recursive: true })

const robotsContent = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n')

const sitemapEntries = routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`

writeFileSync(resolve(publicDirectory, 'robots.txt'), robotsContent, 'utf8')
writeFileSync(resolve(publicDirectory, 'sitemap.xml'), sitemapContent, 'utf8')

console.log(`Generated robots.txt and sitemap.xml for ${siteUrl}`)
