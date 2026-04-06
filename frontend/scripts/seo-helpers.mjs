import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const placeholderHosts = new Set(['example.com', 'www.example.com'])
const placeholderSiteUrlPattern = /your-(production-)?domain/i

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export const frontendDirectory = resolve(currentDirectory, '..')
export const publicDirectory = resolve(frontendDirectory, 'public')
export const distDirectory = resolve(frontendDirectory, 'dist')

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {}
  }

  const entries = {}
  const fileContents = readFileSync(filePath, 'utf8')

  for (const line of fileContents.split(/\r?\n/)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    let value = trimmedLine.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  }

  return entries
}

function loadFrontendEnv(mode = 'production') {
  const envFileNames = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`,
  ]

  return envFileNames.reduce((resolvedEnv, fileName) => {
    const filePath = resolve(frontendDirectory, fileName)

    return {
      ...resolvedEnv,
      ...parseEnvFile(filePath),
    }
  }, {})
}

export function normalizeSiteUrl(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!normalizedValue) {
    throw new Error(
      'VITE_SITE_URL is required for frontend build. Set it in frontend/.env, frontend/.env.production, or the shell environment.'
    )
  }

  let parsedUrl = null

  try {
    parsedUrl = new URL(normalizedValue)
  } catch {
    throw new Error(
      `VITE_SITE_URL must be a valid absolute http/https URL. Received: ${normalizedValue}`
    )
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(
      `VITE_SITE_URL must use http:// or https://. Received: ${normalizedValue}`
    )
  }

  if (
    placeholderHosts.has(parsedUrl.hostname.toLowerCase()) ||
    placeholderSiteUrlPattern.test(parsedUrl.hostname)
  ) {
    throw new Error(
      `VITE_SITE_URL must point to the real public domain, not a placeholder. Received: ${normalizedValue}`
    )
  }

  return normalizedValue.replace(/\/+$/, '')
}

export function normalizeMetrikaId(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!normalizedValue) {
    return ''
  }

  if (!/^\d+$/.test(normalizedValue)) {
    throw new Error(
      `VITE_YANDEX_METRIKA_ID must contain digits only. Received: ${normalizedValue}`
    )
  }

  return normalizedValue
}

export function resolveBuildEnv(mode = process.env.NODE_ENV?.trim() || 'production') {
  const envFromFiles = loadFrontendEnv(mode)
  return {
    ...envFromFiles,
    ...process.env,
  }
}

async function loadSeedProducts() {
  const modulePath = resolve(frontendDirectory, '..', 'backend', 'src', 'data', 'products.js')
  const moduleUrl = pathToFileURL(modulePath).href
  const module = await import(moduleUrl)
  return Array.isArray(module.products) ? module.products : []
}

async function loadProductsFromApi(apiBaseUrl) {
  if (!/^https?:\/\//i.test(apiBaseUrl)) {
    return []
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/api/products`)

  if (!response.ok) {
    throw new Error(`SEO products API responded with ${response.status}`)
  }

  const payload = await response.json()
  return Array.isArray(payload?.items) ? payload.items : []
}

export async function resolveSeoProducts(env) {
  const configuredApiBaseUrl =
    typeof env.VITE_API_BASE_URL === 'string' ? env.VITE_API_BASE_URL.trim() : ''

  if (/^https?:\/\//i.test(configuredApiBaseUrl)) {
    try {
      const apiProducts = await loadProductsFromApi(configuredApiBaseUrl)

      if (apiProducts.length > 0) {
        return apiProducts
      }
    } catch (error) {
      console.warn(
        `Could not load live products for SEO generation, using seed data instead. ${error.message}`
      )
    }
  }

  return loadSeedProducts()
}
