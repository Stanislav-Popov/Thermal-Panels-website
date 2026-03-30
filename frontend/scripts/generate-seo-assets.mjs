import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const frontendDirectory = resolve(currentDirectory, '..')
const publicDirectory = resolve(frontendDirectory, 'public')

const defaultSiteUrl = 'https://example.com'
const configuredSiteUrl = process.env.VITE_SITE_URL?.trim() || defaultSiteUrl
const siteUrl = configuredSiteUrl.replace(/\/+$/, '')

const routes = [
  {
    changeFrequency: 'weekly',
    path: '/',
    priority: '1.0',
  },
]

mkdirSync(publicDirectory, { recursive: true })

const robotsContent = [
  'User-agent: *',
  'Allow: /',
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
