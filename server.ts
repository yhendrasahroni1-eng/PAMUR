import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialUsers, initialArticles, initialSchedules, initialAppSettings } from './src/data/mockData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Get database content or seed defaults
function getDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: initialUsers,
      articles: initialArticles,
      schedules: initialSchedules,
      settings: initialAppSettings,
      attendance: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning fallback initial data:', err);
    return {
      users: initialUsers,
      articles: initialArticles,
      schedules: initialSchedules,
      settings: initialAppSettings,
      attendance: []
    };
  }
}

function saveDatabase(data: any) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get('/api/db', (req, res) => {
  try {
    const dbData = getDatabase();
    res.json({ success: true, data: dbData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db', (req, res) => {
  try {
    const { users, articles, schedules, settings, attendance } = req.body;
    const currentDb = getDatabase();
    const updatedDb = {
      users: users || currentDb.users,
      articles: articles || currentDb.articles,
      schedules: schedules || currentDb.schedules,
      settings: settings || currentDb.settings,
      attendance: attendance || currentDb.attendance,
    };
    saveDatabase(updatedDb);
    res.json({ success: true, message: 'Database Server berhasil disimpan', data: updatedDb });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/reset', (req, res) => {
  try {
    const resetDb = {
      users: initialUsers,
      articles: initialArticles,
      schedules: initialSchedules,
      settings: initialAppSettings,
      attendance: []
    };
    saveDatabase(resetDb);
    res.json({ success: true, message: 'Database Server berhasil direset', data: resetDb });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAMUR Express Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
