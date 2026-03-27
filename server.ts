import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Middleware to extract user_id from Netlify Identity JWT
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.sub) throw new Error('Invalid token');
    req.user = { id: decoded.sub };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// DB setup
const getDb = () => {
  if (!process.env.NETLIFY_DATABASE_URL) {
    throw new Error('NETLIFY_DATABASE_URL is not set. Please configure it in your environment variables.');
  }
  return neon(process.env.NETLIFY_DATABASE_URL);
};

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Init DB schema function
const initDb = async () => {
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        theme_color TEXT,
        photo_url TEXT,
        favorite_pokemon JSONB,
        join_date TEXT
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT,
        collection_name TEXT,
        data JSONB,
        PRIMARY KEY (user_id, collection_name)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        game_id TEXT,
        name TEXT,
        pokemon JSONB,
        created_at TEXT
      );
    `;
    console.log('Database initialized successfully');
  } catch (err: any) {
    console.error('Error initializing database:', err.message);
  }
};

// Call initDb on startup
if (process.env.NETLIFY_DATABASE_URL) {
  initDb();
}

// Init DB schema route (manual trigger)
app.post('/api/init-db', async (req, res) => {
  try {
    await initDb();
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Profile Routes
app.get('/api/profile', requireAuth, async (req: any, res: any) => {
  try {
    const sql = getDb();
    const [profile] = await sql`SELECT * FROM profiles WHERE user_id = ${req.user.id}`;
    if (!profile) return res.json(null);
    
    res.json({
      id: profile.user_id,
      displayName: profile.display_name,
      themeColor: profile.theme_color,
      photoURL: profile.photo_url,
      favoritePokemon: profile.favorite_pokemon,
      joinDate: profile.join_date
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', requireAuth, async (req: any, res: any) => {
  try {
    const sql = getDb();
    const p = req.body;
    await sql`
      INSERT INTO profiles (user_id, display_name, theme_color, photo_url, favorite_pokemon, join_date)
      VALUES (${req.user.id}, ${p.displayName}, ${p.themeColor}, ${p.photoURL}, ${p.favoritePokemon ? JSON.stringify(p.favoritePokemon) : null}, ${p.joinDate})
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        theme_color = EXCLUDED.theme_color,
        photo_url = EXCLUDED.photo_url,
        favorite_pokemon = EXCLUDED.favorite_pokemon
    `;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generic User Data Routes (for usePokemonData hook)
app.get('/api/data/:collection', requireAuth, async (req: any, res: any) => {
  try {
    const sql = getDb();
    const [record] = await sql`SELECT data FROM user_data WHERE user_id = ${req.user.id} AND collection_name = ${req.params.collection}`;
    res.json(record ? record.data : []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:collection', requireAuth, async (req: any, res: any) => {
  try {
    const sql = getDb();
    const data = req.body;
    await sql`
      INSERT INTO user_data (user_id, collection_name, data)
      VALUES (${req.user.id}, ${req.params.collection}, ${JSON.stringify(data)})
      ON CONFLICT (user_id, collection_name) DO UPDATE SET
        data = EXCLUDED.data
    `;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Account Route
app.delete('/api/account', requireAuth, async (req: any, res: any) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM profiles WHERE user_id = ${req.user.id}`;
    await sql`DELETE FROM user_data WHERE user_id = ${req.user.id}`;
    await sql`DELETE FROM teams WHERE user_id = ${req.user.id}`; // keep just in case
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Only start the server if we are not running in a serverless environment
if (process.env.NETLIFY !== 'true' && process.env.NODE_ENV !== 'production') {
  async function startServer() {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicitly handle SPA fallback in dev mode if vite.middlewares doesn't
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  // Check if this file is run directly
  if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
  }
} else if (process.env.NETLIFY !== 'true') {
  // Serve static files in production (non-Netlify)
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  // Handle SPA fallback - serve index.html for all unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}
