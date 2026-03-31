import express from 'express'
import { config } from './config.js'
import { adminApiRouter } from './routes/adminApi.js'
import { publicApiRouter } from './routes/publicApi.js'
import { uploadsRootDirectory } from './services/uploads/uploadService.js'

const corsAllowedMethods = 'GET,POST,PUT,DELETE,OPTIONS'
const corsAllowedHeaders = 'Authorization,Content-Type'

function applyCorsHeaders(request, response) {
  const origin = request.headers.origin

  if (!origin) {
    return true
  }

  if (!config.cors.allowedOrigins.includes(origin)) {
    return false
  }

  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Methods', corsAllowedMethods)
  response.setHeader('Access-Control-Allow-Headers', corsAllowedHeaders)

  return true
}

export function createServer() {
  const app = express()

  app.use((request, response, next) => {
    const isAllowedOrigin = applyCorsHeaders(request, response)

    if (request.method === 'OPTIONS') {
      response.status(isAllowedOrigin ? 204 : 403).send()
      return
    }

    next()
  })

  app.use(express.json())
  app.use('/uploads', express.static(uploadsRootDirectory))

  app.use('/api', publicApiRouter)
  app.use('/api/admin', adminApiRouter)

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Маршрут не найден.',
      },
    })
  })

  app.use((error, _request, response, _next) => {
    console.error(error)

    response.status(error.status ?? 500).json({
      error: {
        code: error.code ?? 'INTERNAL_SERVER_ERROR',
        message: error.message ?? 'Внутренняя ошибка сервера.',
      },
    })
  })

  return app
}
