# Quick Start Guide

Get up and running in 3 simple steps!

## Step 1: Install Dependencies

```bash
npm install
```

**What this does:** Installs all required packages for both frontend and backend.

**Time:** ~30 seconds

## Step 2: Start Development

```bash
npm run dev
```

**What this does:**
- Starts the React frontend at http://localhost:3000
- Starts the Express backend at http://localhost:3001
- Both apps auto-reload when you save files

**You should see:**
```
@repo/web:dev: VITE ready in XXX ms
@repo/web:dev: ➜ Local: http://localhost:3000
@repo/api:dev: 🚀 API server running on http://localhost:3001
```

## Step 3: Open Your Browser

Navigate to http://localhost:3000

You should see the Easy ACP homepage with a message from the backend!

## That's It! 🎉

You're now running a full-stack TypeScript application.

## Next Steps

### Edit the Frontend
Open `apps/web/src/App.tsx` and make changes. The page will automatically reload.

### Edit the Backend
Open `apps/api/src/index.ts` and add a new endpoint. The server will automatically restart.

### Example: Add a New API Endpoint

1. Edit `apps/api/src/index.ts`:
```typescript
app.get('/api/greeting', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from your new endpoint!' });
});
```

2. The server restarts automatically

3. Test it in your browser: http://localhost:3001/api/greeting

### Example: Call the New Endpoint from Frontend

1. Edit `apps/web/src/App.tsx`:
```typescript
const [greeting, setGreeting] = useState('');

useEffect(() => {
  fetch('/api/greeting')
    .then(res => res.json())
    .then(data => setGreeting(data.message));
}, []);

// In your JSX:
<p>{greeting}</p>
```

2. Save and see the changes automatically in your browser!

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development (frontend + backend) |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm run format` | Auto-format code |

## Troubleshooting

**Port 3000 or 3001 already in use?**
- Kill the process using that port, or
- Change the port in the config files (see README.md)

**Dependencies not installing?**
- Make sure you have Node.js >= 18.0.0
- Try `npm cache clean --force` then `npm install` again

**Need more help?**
- Check the main [README.md](./README.md)
- Read the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for advanced topics

## Project Structure (Simple View)

```
easy-acp-monorepo/
├── apps/
│   ├── web/         ← Your React frontend
│   └── api/         ← Your Express backend
└── package.json     ← Run commands from here
```

**Remember:** You don't need to `cd` into individual apps. Just run commands from the root!

Happy coding! 🚀
