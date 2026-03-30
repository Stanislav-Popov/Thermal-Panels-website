import { config } from './config.js'
import { query } from './db/pool.js'
import { loadedEnvFilePath } from './loadEnv.js'
import { createServer } from './server.js'

function ensureRuntimeConfig() {
  if (!config.db.password) {
    throw new Error(
      'DB_PASSWORD is empty. Create backend/.env from backend/.env.example or set DB_PASSWORD in the environment.'
    )
  }
}

async function start() {
  ensureRuntimeConfig()
  await query('select 1')

  if (loadedEnvFilePath) {
    console.log(`Loaded environment from ${loadedEnvFilePath}`)
  }

  const app = createServer()

  app.listen(config.port, () => {
    console.log(
      `Thermal Panels backend listening on http://127.0.0.1:${config.port}`
    )
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
