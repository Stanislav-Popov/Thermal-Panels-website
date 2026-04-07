import { query } from '../db/pool.js'

function mapAdminUser(row) {
  return {
    id: row.id,
    login: row.login,
    passwordHash: row.password_hash,
    isActive: row.is_active,
  }
}

export async function findAdminUserByLogin(login) {
  const result = await query(
    `
      SELECT id, login, password_hash, is_active
      FROM admin_users
      WHERE lower(login) = lower($1)
      LIMIT 1
    `,
    [login]
  )

  return result.rows[0] ? mapAdminUser(result.rows[0]) : null
}

export async function upsertAdminUser({ login, passwordHash, isActive = true }) {
  const result = await query(
    `
      INSERT INTO admin_users (login, password_hash, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT (login)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active = EXCLUDED.is_active
      RETURNING id, login, password_hash, is_active
    `,
    [login, passwordHash, isActive]
  )

  return mapAdminUser(result.rows[0])
}

export async function deactivateOtherAdminUsers(login) {
  const result = await query(
    `
      UPDATE admin_users
      SET is_active = FALSE
      WHERE lower(login) <> lower($1) AND is_active = TRUE
    `,
    [login]
  )

  return result.rowCount
}
