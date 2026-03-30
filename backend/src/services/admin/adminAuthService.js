import { config } from '../../config.js'
import { findAdminUserByLogin } from '../../repositories/adminUserRepository.js'
import { createAdminToken } from '../../utils/adminTokens.js'
import { verifyPassword } from '../../utils/passwords.js'

export async function authenticateAdmin(credentials) {
  const login = credentials?.login?.trim()
  const password = credentials?.password ?? ''

  if (!login || !password) {
    return {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Нужно передать логин и пароль.',
      },
    }
  }

  const adminUser = await findAdminUserByLogin(login)

  if (!adminUser || !adminUser.isActive) {
    return {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный логин или пароль.',
      },
    }
  }

  const isPasswordValid = verifyPassword(password, adminUser.passwordHash)

  if (!isPasswordValid) {
    return {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный логин или пароль.',
      },
    }
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8
  const token = createAdminToken(
    {
      sub: adminUser.id,
      login: adminUser.login,
      exp: expiresAt,
    },
    config.admin.tokenSecret
  )

  return {
    value: {
      token,
      user: {
        id: adminUser.id,
        login: adminUser.login,
      },
      expiresAt,
    },
  }
}
