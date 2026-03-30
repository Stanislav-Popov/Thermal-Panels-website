import { config } from '../config.js'
import { verifyAdminToken } from '../utils/adminTokens.js'

export function requireAdminAuth(request, response, next) {
  const authorization = request.headers.authorization ?? ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : ''

  const payload = verifyAdminToken(token, config.admin.tokenSecret)

  if (!payload) {
    response.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Нужна авторизация администратора.',
      },
    })
    return
  }

  request.admin = payload
  next()
}
