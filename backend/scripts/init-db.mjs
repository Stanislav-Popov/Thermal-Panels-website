import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { config } from '../src/config.js'
import { pool } from '../src/db/pool.js'
import { syncConfiguredAdminUser } from '../src/services/admin/adminCredentialsSyncService.js'

const { Client } = pg

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(currentDirectory, '../db/schema.sql')
const seedPath = resolve(currentDirectory, '../db/seed.sql')

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`)
  }

  return `"${identifier}"`
}

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: config.db.host,
    port: config.db.port,
    database: config.db.adminDatabase,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl
      ? { rejectUnauthorized: config.db.sslRejectUnauthorized }
      : undefined,
  })

  await adminClient.connect()

  try {
    const databaseResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [config.db.database]
    )

    if (databaseResult.rowCount === 0) {
      await adminClient.query(
        `CREATE DATABASE ${quoteIdentifier(config.db.database)}`
      )
      console.log(`Created database ${config.db.database}.`)
    }
  } finally {
    await adminClient.end()
  }
}

async function runSqlFile(filePath) {
  const client = new Client({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl
      ? { rejectUnauthorized: config.db.sslRejectUnauthorized }
      : undefined,
  })

  await client.connect()

  try {
    const sql = readFileSync(filePath, 'utf8')
    await client.query(sql)
  } finally {
    await client.end()
  }
}

async function main() {
  await ensureDatabaseExists()
  await runSqlFile(schemaPath)
  console.log(`Applied schema from ${join('db', 'schema.sql')}.`)
  await runSqlFile(seedPath)
  console.log(`Applied seed from ${join('db', 'seed.sql')}.`)
  const adminSyncResult = await syncConfiguredAdminUser()

  if (adminSyncResult.skipped) {
    console.log(`Skipped admin seed: ${adminSyncResult.reason}`)
  } else {
    console.log(
      `Seeded admin user ${adminSyncResult.login}. Deactivated ${adminSyncResult.deactivatedUsersCount} other admin account(s).`
    )
  }

  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
