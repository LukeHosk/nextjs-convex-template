/**
 * This script runs `npx @convex-dev/auth` to help with setting up
 * environment variables for Convex Auth.
 *
 * You can safely delete it and remove it from package.json scripts.
 */

import fs from 'fs'
import { config as loadEnvFile } from 'dotenv'
import { spawnSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..', '..')
const envPath = resolve(rootDir, '.env.local')

if (!fs.existsSync(envPath)) {
  // Something is off, skip the script.
  process.exit(0)
}

const config = {}
loadEnvFile({ path: envPath, processEnv: config, quiet: true })

const runOnceWorkflow = process.argv.includes('--once')

if (runOnceWorkflow && config.SETUP_SCRIPT_RAN !== undefined) {
  // The script has already ran once, skip.
  process.exit(0)
}

const result = spawnSync('npx', ['@convex-dev/auth', '--skip-git-check'], {
  stdio: 'inherit',
  cwd: rootDir,
})

if (runOnceWorkflow) {
  fs.writeFileSync(envPath, `\nSETUP_SCRIPT_RAN=1\n`, { flag: 'a' })
}

process.exit(result.status)
