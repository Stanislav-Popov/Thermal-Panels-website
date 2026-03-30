import crypto from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import { config } from '../../config.js'
import { createHttpError } from '../../utils/httpErrors.js'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const backendDirectory = resolve(currentDirectory, '../../..')

const uploadScopes = {
  'product-images': 'product-images',
  'showcase-images': 'showcase-images',
}

const mimeExtensions = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export const uploadsRootDirectory = resolve(
  backendDirectory,
  config.uploads.directory
)

function ensureDirectoryExists(directoryPath) {
  mkdirSync(directoryPath, { recursive: true })
}

function resolveUploadScope(scope) {
  const normalizedScope = uploadScopes[scope]

  if (!normalizedScope) {
    throw createHttpError(400, 'INVALID_UPLOAD_SCOPE', 'Неизвестный раздел загрузки.')
  }

  return normalizedScope
}

function sanitizeFileName(fileName) {
  const baseName = basename(fileName, extname(fileName))
  const normalizedName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalizedName || 'image'
}

function resolveFileExtension(file) {
  const normalizedOriginalExtension = extname(file.originalname).toLowerCase()

  if (
    normalizedOriginalExtension &&
    Object.values(mimeExtensions).includes(normalizedOriginalExtension)
  ) {
    return normalizedOriginalExtension
  }

  return mimeExtensions[file.mimetype] ?? '.jpg'
}

function createStoredFileName(file) {
  return [
    Date.now(),
    crypto.randomBytes(4).toString('hex'),
    sanitizeFileName(file.originalname),
  ].join('-') + resolveFileExtension(file)
}

ensureDirectoryExists(uploadsRootDirectory)

const storage = multer.diskStorage({
  destination(request, _file, callback) {
    try {
      const scope = resolveUploadScope(request.params.scope)
      const scopeDirectory = resolve(uploadsRootDirectory, scope)
      ensureDirectoryExists(scopeDirectory)
      callback(null, scopeDirectory)
    } catch (error) {
      callback(error)
    }
  },
  filename(_request, file, callback) {
    try {
      callback(null, createStoredFileName(file))
    } catch (error) {
      callback(error)
    }
  },
})

const uploader = multer({
  storage,
  limits: {
    fileSize: config.uploads.maxFileSizeBytes,
  },
  fileFilter(_request, file, callback) {
    if (!mimeExtensions[file.mimetype]) {
      callback(
        createHttpError(
          400,
          'INVALID_UPLOAD_TYPE',
          'Можно загружать только изображения JPG, PNG, WEBP или GIF.'
        )
      )
      return
    }

    callback(null, true)
  },
})

export function adminImageUploadMiddleware(request, response, next) {
  uploader.single('file')(request, response, (error) => {
    if (!error) {
      next()
      return
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      next(
        createHttpError(
          400,
          'FILE_TOO_LARGE',
          `Размер изображения не должен превышать ${config.uploads.maxFileSizeMb} МБ.`
        )
      )
      return
    }

    next(error)
  })
}

export function getUploadedImagePayload(file, scope) {
  if (!file) {
    throw createHttpError(
      400,
      'UPLOAD_REQUIRED',
      'Нужно выбрать изображение для загрузки.'
    )
  }

  const normalizedScope = resolveUploadScope(scope)

  return {
    imagePath: `/uploads/${normalizedScope}/${file.filename}`,
    mimeType: file.mimetype,
    originalName: file.originalname,
    size: file.size,
  }
}
