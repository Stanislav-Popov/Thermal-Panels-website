import { config } from '../../config.js'
import {
  deactivateOtherAdminUsers,
  upsertAdminUser,
} from '../../repositories/adminUserRepository.js'
import { createPasswordHash } from '../../utils/passwords.js'

export async function syncConfiguredAdminUser() {
  const login = config.admin.seedLogin.trim()
  const password = config.admin.seedPassword

  if (!login || !password) {
    return {
      skipped: true,
      reason: 'ADMIN_SEED_LOGIN / ADMIN_SEED_PASSWORD not set.',
    }
  }

  const passwordHash = createPasswordHash(password)
  const adminUser = await upsertAdminUser({
    login,
    passwordHash,
    isActive: true,
  })
  const deactivatedUsersCount = await deactivateOtherAdminUsers(login)

  return {
    skipped: false,
    login: adminUser.login,
    deactivatedUsersCount,
  }
}
