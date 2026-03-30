import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootsToCheck = [resolve('src'), resolve('scripts')]

function collectJavaScriptFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      return collectJavaScriptFiles(fullPath)
    }

    return fullPath.endsWith('.js') ? [fullPath] : []
  })
}

const filesToCheck = rootsToCheck.flatMap((directory) =>
  collectJavaScriptFiles(directory)
)

for (const filePath of filesToCheck) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log(`Checked ${filesToCheck.length} backend files.`)
