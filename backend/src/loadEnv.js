import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const backendDirectory = resolve(currentDirectory, '..')

function normalizeValue(rawValue) {
  const trimmedValue = rawValue.trim()

  if (!trimmedValue) {
    return ''
  }

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1)
  }

  return trimmedValue
}

function applyEnvFile(filePath) {
  const fileContent = readFileSync(filePath, 'utf8')
  const lines = fileContent.split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = normalizeValue(trimmedLine.slice(separatorIndex + 1))
    const existingValue = process.env[key]

    if (!key) {
      continue
    }

    if (typeof existingValue === 'string' && existingValue.trim()) {
      continue
    }

    process.env[key] = value
  }
}

function resolveEnvFile() {
  const candidatePaths = [resolve(backendDirectory, '.env')]

  if (process.env.NODE_ENV !== 'production') {
    candidatePaths.push(resolve(backendDirectory, '.env.example'))
  }

  return candidatePaths.find((candidatePath) => existsSync(candidatePath)) ?? null
}

export const loadedEnvFilePath = resolveEnvFile()

if (loadedEnvFilePath) {
  applyEnvFile(loadedEnvFilePath)
}
