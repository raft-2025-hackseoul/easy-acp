# Easy ACP - TypeScript Monorepo

A production-ready TypeScript monorepo powered by TurboRepo, featuring React + Vite frontend and Express backend.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

This single command installs all dependencies for the entire monorepo.

## Development Commands

You don't need to know the monorepo structure! Just use these simple commands:

### Start Development

```bash
npm run dev
```

Starts both frontend and backend in development mode with hot reload:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Build for Production

```bash
npm run build
```

Builds all applications optimized for production.

### Run Linting

```bash
npm run lint
```

Checks code quality across all applications.

### Format Code

```bash
npm run format
```

Automatically formats all code files.

### Clean Everything

```bash
npm run clean
```

Removes all build artifacts and node_modules.

## What's Inside?

This monorepo includes:

### Applications

- **Frontend** (`apps/web`): React application with Vite
  - Fast development with HMR (Hot Module Replacement)
  - Optimized production builds
  - TypeScript support
  - Pre-configured API proxy to backend

- **Backend** (`apps/api`): Express.js REST API
  - TypeScript support
  - Auto-reload on file changes
  - CORS enabled
  - Ready for database integration

### Packages

- **@repo/tsconfig**: Shared TypeScript configurations
  - Base config for common settings
  - React-specific config
  - Node.js-specific config

## Monorepo Architecture

This project uses TurboRepo for:
- **Parallel execution**: Tasks run simultaneously when possible
- **Smart caching**: Builds are cached and reused
- **Dependency graph**: Tasks run in the correct order
- **Incremental builds**: Only changed packages are rebuilt

You don't need to understand these details - just run the commands above!

## Adding New Features

### Frontend Development

Edit files in `apps/web/src/`:
- `App.tsx`: Main application component
- `main.tsx`: Application entry point
- Add new components, pages, or styles as needed

The dev server will automatically reload on save.

### Backend Development

Edit files in `apps/api/src/`:
- `index.ts`: Main server file with routes
- Add new routes, middleware, or services as needed

The server will automatically restart on save.

### API Integration

The frontend is pre-configured to proxy `/api/*` requests to the backend.

Example:
```typescript
// In your React component
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Project Structure

```
easy-acp-monorepo/
├── apps/
│   ├── web/              # React + Vite frontend
│   │   ├── src/          # Source files
│   │   ├── public/       # Static assets
│   │   └── package.json
│   └── api/              # Express backend
│       ├── src/          # Source files
│       └── package.json
├── packages/
│   └── tsconfig/         # Shared TypeScript configs
├── package.json          # Root package.json
├── turbo.json           # TurboRepo configuration
└── README.md            # This file
```

## Running Individual Apps

If you need to work on just one app:

### Frontend Only
```bash
cd apps/web
npm run dev
```

### Backend Only
```bash
cd apps/api
npm run dev
```

However, using `npm run dev` from the root is recommended as it runs both together.

## Environment Variables

### Frontend (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`apps/api/.env`)
```env
PORT=3001
NODE_ENV=development
```

## Deployment

### Build for Production
```bash
npm run build
```

### Run Production Build

**Frontend:**
```bash
cd apps/web
npm run preview
```

**Backend:**
```bash
cd apps/api
npm run start
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are in use:
1. Stop the process using that port
2. Or change the port in `apps/web/vite.config.ts` (frontend) or `apps/api/src/index.ts` (backend)

### Build Errors

Try cleaning and reinstalling:
```bash
npm run clean
npm install
npm run build
```

### TypeScript Errors

Make sure all dependencies are installed:
```bash
npm install
```

## Learn More

- [TurboRepo Documentation](https://turbo.build/repo/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

## Support

For issues or questions, please check the documentation or contact the development team.
