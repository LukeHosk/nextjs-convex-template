#!/usr/bin/env node
/**
 * Verifies that Convex file storage works with the local backend.
 * Run with: node scripts/test-storage.mjs
 *
 * Prerequisites:
 *   1. `convex dev` is running (local backend)
 *   2. .env.local has NEXT_PUBLIC_CONVEX_URL set
 */

import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL
if (!CONVEX_URL) {
  console.error(
    '❌  NEXT_PUBLIC_CONVEX_URL not set — run `convex dev` first to populate .env.local',
  )
  process.exit(1)
}

async function callMutation(path, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} calling ${path}`)
  const data = await res.json()
  if (data.status === 'error') throw new Error(`Convex error in ${path}: ${data.errorMessage}`)
  return data.value
}

async function callQuery(path, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} calling ${path}`)
  const data = await res.json()
  if (data.status === 'error') throw new Error(`Convex error in ${path}: ${data.errorMessage}`)
  return data.value
}

async function main() {
  console.log(`\n🧪  Testing Convex file storage`)
  console.log(`    Backend: ${CONVEX_URL}\n`)

  // 1. Generate an upload URL
  process.stdout.write('1/5  Generating upload URL ... ')
  const uploadUrl = await callMutation('storageTest:generateUploadUrl')
  console.log('✓')

  // 2. Upload a small text file to that URL
  process.stdout.write('2/5  Uploading test file ... ')
  const testContent = `clothes-tool storage test\ntimestamp: ${new Date().toISOString()}`
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: testContent,
  })
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: HTTP ${uploadRes.status} — ${await uploadRes.text()}`)
  }
  const { storageId } = await uploadRes.json()
  console.log(`✓  (storageId: ${storageId})`)

  // 3. Resolve the storage ID to a URL
  process.stdout.write('3/5  Resolving storage URL ... ')
  const fileUrl = await callQuery('storageTest:getUrl', { storageId })
  if (!fileUrl) throw new Error('getUrl returned null — storage may not be supported locally')
  console.log(`✓\n     ${fileUrl}`)

  // 4. Download the file and verify content round-trips correctly
  process.stdout.write('4/5  Downloading and verifying content ... ')
  const downloadRes = await fetch(fileUrl)
  if (!downloadRes.ok) {
    throw new Error(`Download failed: HTTP ${downloadRes.status}`)
  }
  const downloaded = await downloadRes.text()
  if (downloaded !== testContent) {
    throw new Error(`Content mismatch!\n  expected: ${testContent}\n  got:      ${downloaded}`)
  }
  console.log('✓')

  // 5. Clean up
  process.stdout.write('5/5  Deleting test file ... ')
  await callMutation('storageTest:deleteFile', { storageId })
  console.log('✓')

  console.log('\n✅  Convex file storage works — safe to use offline.\n')
}

main().catch((err) => {
  console.error(`\n❌  ${err.message}\n`)
  process.exit(1)
})
