import './loadEnv.js'

function parseNumber(value, fallback) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function parseString(value, fallback) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function parseOptionalString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export const config = {
  port: parseNumber(process.env.PORT, 5000),
  reserveRate: parseNumber(process.env.CALCULATOR_RESERVE_RATE, 0.07),
  uploads: {
    directory: parseString(process.env.UPLOADS_DIR, 'uploads'),
    maxFileSizeMb: parseNumber(process.env.UPLOAD_MAX_FILE_SIZE_MB, 8),
  },
  db: {
    host: parseString(process.env.DB_HOST, '127.0.0.1'),
    port: parseNumber(process.env.DB_PORT, 5432),
    database: parseString(process.env.DB_NAME, 'thermal_panels'),
    user: parseString(process.env.DB_USER, 'postgres'),
    password: parseOptionalString(process.env.DB_PASSWORD),
    adminDatabase: parseString(process.env.DB_ADMIN_DATABASE, 'postgres'),
  },
  admin: {
    tokenSecret: parseString(
      process.env.ADMIN_TOKEN_SECRET,
      'thermal-panels-dev-secret'
    ),
    seedLogin: process.env.ADMIN_SEED_LOGIN ?? '',
    seedPassword: process.env.ADMIN_SEED_PASSWORD ?? '',
  },
}

config.uploads.maxFileSizeBytes = Math.max(
  1,
  Math.round(config.uploads.maxFileSizeMb * 1024 * 1024)
)
