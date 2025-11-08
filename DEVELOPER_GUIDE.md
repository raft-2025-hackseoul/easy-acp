# Developer Guide - Monorepo Internals

This guide explains the internal workings of the monorepo for developers who want to understand the architecture.

## TurboRepo Pipeline

The `turbo.json` file defines how tasks are executed across the monorepo.

### Pipeline Configuration

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key Concepts:**

- `"^build"`: Run this package's dependencies' build tasks first
- `"outputs"`: Files to cache for faster subsequent builds
- `"cache": false`: Don't cache dev mode (always run fresh)
- `"persistent": true`: Keep the task running (for dev servers)

## Workspace Management

The monorepo uses npm workspaces defined in the root `package.json`:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

This allows:

- Shared node_modules at the root
- Cross-package dependencies using `"@repo/*"`
- Single `npm install` for everything

## TypeScript Configuration

### Shared Configs

Located in `packages/tsconfig/`:

1. **base.json**: Common settings for all TS projects
2. **react.json**: React-specific settings (JSX, DOM libs)
3. **node.json**: Node.js-specific settings (CommonJS, Node libs)

### Extending Configs

Each app extends the appropriate shared config:

```json
{
  "extends": "@repo/tsconfig/react.json"
}
```

Benefits:

- Consistent settings across all apps
- Single source of truth for TS configs
- Easy updates (change once, apply everywhere)

## Application Architecture

### Frontend (apps/web)

**Tech Stack:**

- React 18 with TypeScript
- Vite for build tooling and dev server
- ESLint for code quality

**Key Files:**

- `vite.config.ts`: Vite configuration with dev server and proxy
- `tsconfig.json`: TypeScript configuration
- `src/main.tsx`: Application entry point
- `src/App.tsx`: Root component

**Dev Server Features:**

- Hot Module Replacement (HMR)
- API proxy to backend (`/api` → `http://localhost:3001`)
- Fast refresh for React components

### Backend (apps/api)

**Tech Stack:**

- Express.js with TypeScript
- tsx for development (TypeScript execution)
- CORS enabled for cross-origin requests

**Key Files:**

- `src/index.ts`: Express server setup and routes
- `tsconfig.json`: TypeScript configuration
- Builds to CommonJS for Node.js compatibility

**Dev Features:**

- Auto-restart on file changes (tsx watch)
- TypeScript type checking
- Source maps for debugging

## Task Execution Flow

When you run `npm run dev`:

1. TurboRepo reads `turbo.json`
2. Identifies all packages with a `dev` script
3. Executes them in parallel (both apps start simultaneously)
4. Maintains persistent connections (keeps servers running)
5. Streams output from all tasks to your terminal

## Caching Strategy

TurboRepo caches task outputs based on:

- Input files (source code)
- Dependencies
- Environment variables
- Task configuration

**Cache Location:** `.turbo/cache/`

**Cache Behavior:**

- `build`: Cached (reused if inputs unchanged)
- `lint`: Cached
- `dev`: Not cached (always fresh)
- `test`: Cached

## Adding New Packages

### Create a New Shared Package

1. Create directory in `packages/`:

```bash
mkdir packages/my-package
```

2. Add `package.json`:

```json
{
  "name": "@repo/my-package",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

3. Add to consuming app:

```json
{
  "dependencies": {
    "@repo/my-package": "*"
  }
}
```

### Create a New App

1. Create directory in `apps/`:

```bash
mkdir apps/my-app
```

2. Add `package.json` with required scripts:

```json
{
  "name": "@repo/my-app",
  "scripts": {
    "dev": "...",
    "build": "...",
    "lint": "..."
  }
}
```

3. It will automatically be included in workspace tasks

## Debugging

### TypeScript Errors

Check which config is being used:

```bash
cd apps/web
npx tsc --showConfig
```

### Build Issues

See what TurboRepo is doing:

```bash
npm run build -- --verbose
```

### Cache Issues

Clear the cache:

```bash
rm -rf .turbo
npm run build
```

## Performance Tips

1. **Use TurboRepo filters** to run tasks for specific packages:

```bash
npx turbo run build --filter=@repo/web
```

2. **Parallel execution** is automatic, but you can control it:

```bash
npx turbo run build --concurrency=2
```

3. **Remote caching** can be enabled for teams:

```json
{
  "remoteCache": {
    "enabled": true
  }
}
```

## Best Practices

### Dependency Management

- Install workspace dependencies from root: `npm install -w @repo/web <package>`
- Keep versions consistent across apps
- Use `@repo/*` for internal dependencies

### Code Organization

- Shared code → `packages/`
- Applications → `apps/`
- Keep packages small and focused
- Use barrel exports (`index.ts`) for clean imports

### Scripts Naming

Follow these conventions for TurboRepo:

- `dev`: Development mode with watch
- `build`: Production build
- `lint`: Code quality checks
- `test`: Run tests
- `clean`: Remove build artifacts

### TypeScript

- Extend shared configs (don't duplicate)
- Enable strict mode
- Use path aliases for clean imports

## Monorepo Benefits

1. **Code Sharing**: Share utilities, types, and components
2. **Atomic Changes**: Change API and UI in single PR
3. **Consistent Tooling**: Same configs across all projects
4. **Faster CI**: Parallel execution and caching
5. **Better Refactoring**: Find all usages across projects

## Common Patterns

### Shared Types

Create `packages/types/` for API types:

```typescript
// packages/types/src/api.ts
export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}
```

Use in both frontend and backend:

```typescript
import { HealthResponse } from '@repo/types';
```

### Shared UI Components

Create `packages/ui/` for React components:

```typescript
// packages/ui/src/Button.tsx
export const Button = ({ children }: Props) => (
  <button>{children}</button>
);
```

### Shared Utilities

Create `packages/utils/` for helper functions:

```typescript
// packages/utils/src/format.ts
export const formatDate = (date: Date) => {
  // ...
};
```

## Further Reading

- [TurboRepo Handbook](https://turbo.build/repo/docs/handbook)
- [Monorepo Tools](https://monorepo.tools/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
