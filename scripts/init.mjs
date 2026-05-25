#!/usr/bin/env node
/**
 * Interactive initializer for the template.
 *
 * It personalizes the starter by updating the package name and visible
 * project branding, then optionally launches `pnpm dev` so the first Convex
 * setup can happen immediately.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJsonPath = path.join(rootDir, 'package.json')
const readmePath = path.join(rootDir, 'README.md')
const layoutPath = path.join(rootDir, 'app', 'layout.tsx')
const homePagePath = path.join(rootDir, 'app', 'page.tsx')

function toPackageName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitleCase(value) {
  return value
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function escapeSingleQuotes(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function replaceOrThrow(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`Could not find ${label} in file to update`)
  }
  return source.replace(pattern, replacement)
}

async function main() {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  const currentName = packageJson.name || path.basename(rootDir)

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  let shouldRunDev = false

  try {
    const projectNameInput = await rl.question(`Project name [${currentName}]: `)
    const enteredName = projectNameInput.trim() || currentName
    const packageName = toPackageName(enteredName) || currentName
    const projectTitle = toTitleCase(enteredName) || toTitleCase(currentName)
    const description = `A ${projectTitle} app built with Next.js and Convex`

    packageJson.name = packageName
    await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

    const layoutSource = await fs.readFile(layoutPath, 'utf8')
    const updatedLayout = replaceOrThrow(
      replaceOrThrow(
        layoutSource,
        /title:\s*'[^']*'/,
        `title: '${escapeSingleQuotes(projectTitle)}'`,
        'metadata title',
      ),
      /description:\s*'[^']*'/,
      `description: '${escapeSingleQuotes(description)}'`,
      'metadata description',
    )
    await fs.writeFile(layoutPath, updatedLayout)

    const homePageSource = await fs.readFile(homePagePath, 'utf8')
    const updatedHomePage = replaceOrThrow(
      homePageSource,
      /<h1 className="text-xl font-semibold">[^<]*<\/h1>/,
      `<h1 className="text-xl font-semibold">${projectTitle}</h1>`,
      'homepage title',
    )
    await fs.writeFile(homePagePath, updatedHomePage)

    const readmeSource = await fs.readFile(readmePath, 'utf8')
    const updatedReadme = replaceOrThrow(
      replaceOrThrow(readmeSource, /^# .+$/m, `# ${projectTitle}`, 'README heading'),
      /cd nextjs-convex-template/m,
      `cd ${packageName}`,
      'README quick-start directory name',
    )
    await fs.writeFile(readmePath, updatedReadme)

    const runDevAnswer = await rl.question('Run pnpm dev now to initialize Convex? [Y/n]: ')
    const normalizedAnswer = runDevAnswer.trim().toLowerCase()
    shouldRunDev = normalizedAnswer === '' || normalizedAnswer === 'y' || normalizedAnswer === 'yes'

    console.log(`\nUpdated project name to ${projectTitle}.`)
    console.log('Updated package.json, app/layout.tsx, app/page.tsx, and README.md.')
  } finally {
    rl.close()
  }

  if (shouldRunDev) {
    console.log('\nStarting pnpm dev...\n')
    const result = spawnSync('pnpm', ['dev'], {
      cwd: rootDir,
      stdio: 'inherit',
    })
    process.exit(result.status ?? 0)
  }

  console.log('\nNext step: run pnpm dev to finish Convex setup.')
}

main().catch((error) => {
  console.error(
    `\nInitialization failed: ${error instanceof Error ? error.message : String(error)}\n`,
  )
  process.exit(1)
})
