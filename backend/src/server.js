import express from 'express'
import { adminApiRouter } from './routes/adminApi.js'
import { publicApiRouter } from './routes/publicApi.js'
import { uploadsRootDirectory } from './services/uploads/uploadService.js'

export function createServer() {
  const app = express()

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
