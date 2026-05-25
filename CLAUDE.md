use pnpm in this project.

use playwright or `curl` to check all ui changes before finishing a task.

avoid using `any` and `unknown` in TypeScript code. Wherever possible use Infer on the convex database schema to dynamically generate types that stay up to date with the database.

always use `tsc --noEmit` to check your code for type errors before committing.

When committing changes, ensure that you run `pnpm run format` to format your code. Also ensure that you only commit changes you are responsible for, not changes made by other developers or agents unless they are directly related to your task.

Use `env` from `@/env` instead of `process.env` directly for type-safe environment variable access.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
