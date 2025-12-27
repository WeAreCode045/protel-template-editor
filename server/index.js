/* Minimal OnlyOffice backend: serves files, signs JWT, handles callbacks */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5174; // separate from Vite
const ONLYOFFICE_JWT_SECRET = process.env.ONLYOFFICE_JWT_SECRET || 'insecure_dev_secret_change_me';
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, 'storage');

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
// In production behind a proxy/load balancer, honor X-Forwarded-* headers
app.set('trust proxy', 1);
// Serve built frontend if present
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}
app.use(express.json({ limit: '50mb' }));

function getBaseUrl(req) {
  // Allow overriding with PUBLIC_BASE_URL env for production
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

function extFromMime(mime) {
  const map = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/msword': 'doc',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  };
  return map[mime] || 'docx';
}

function documentTypeFromExt(ext) {
  if (['xls', 'xlsx', 'ods'].includes(ext)) return 'cell';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'slide';
  return 'word';
}

// POST /api/documents -> { id, name, type, base64 }
app.post('/api/documents', async (req, res) => {
  try {
    const { id, name, type, base64 } = req.body || {};
    if (!id || !name || !type || !base64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : extFromMime(type);
    const filePath = path.join(STORAGE_DIR, `${id}.${ext}`);
    const metaPath = path.join(STORAGE_DIR, `${id}.json`);

    const dataPart = base64.split(',')[1] || base64;
    const buffer = Buffer.from(dataPart, 'base64');
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(metaPath, JSON.stringify({ id, name, type, ext, updatedAt: Date.now() }, null, 2));

    const downloadUrl = `${getBaseUrl(req)}/api/documents/${id}/download`;
    res.json({ ok: true, id, downloadUrl });
  } catch (e) {
    console.error('Upload error', e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/documents/:id/download -> file binary
app.get('/api/documents/:id/download', (req, res) => {
  const id = req.params.id;
  const metaPath = path.join(STORAGE_DIR, `${id}.json`);
  if (!fs.existsSync(metaPath)) return res.status(404).end();
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const filePath = path.join(STORAGE_DIR, `${id}.${meta.ext}`);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.setHeader('Content-Disposition', `inline; filename="${meta.name}"`);
  res.sendFile(filePath);
});

// GET /api/documents/:id/onlyoffice-config -> { config, token }
app.get('/api/documents/:id/onlyoffice-config', (req, res) => {
  const id = req.params.id;
  const metaPath = path.join(STORAGE_DIR, `${id}.json`);
  if (!fs.existsSync(metaPath)) return res.status(404).json({ error: 'Not found' });
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const documentType = documentTypeFromExt(meta.ext);
  const config = {
    document: {
      fileType: meta.ext,
      key: `${id}_${meta.updatedAt}`,
      title: meta.name,
      url: `${getBaseUrl(req)}/api/documents/${id}/download`,
      permissions: { edit: true, download: true, print: true, review: true, comment: true }
    },
    documentType,
    editorConfig: {
      mode: 'edit',
      lang: 'en',
      callbackUrl: `${getBaseUrl(req)}/api/documents/${id}/callback`,
      user: { id: 'user1', name: 'User' },
      customization: { autosave: true, forcesave: true }
    },
    height: '100%',
    width: '100%'
  };
  const token = jwt.sign(config, ONLYOFFICE_JWT_SECRET, { expiresIn: '10m' });
  res.json({ config, token });
});

// POST /api/documents/:id/callback
app.post('/api/documents/:id/callback', async (req, res) => {
  try {
    const id = req.params.id;
    // Validate JWT if present
    const auth = req.headers.authorization;
    const token = (auth && auth.startsWith('Bearer ')) ? auth.slice(7) : (req.body && req.body.token);
    if (token) {
      try { jwt.verify(token, ONLYOFFICE_JWT_SECRET); } catch (e) { return res.status(403).json({ error: 1 }); }
    }
    const { status, url } = req.body || {};
    if ((status === 2 || status === 6) && url) {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const metaPath = path.join(STORAGE_DIR, `${id}.json`);
      if (!fs.existsSync(metaPath)) return res.json({ error: 1 });
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const filePath = path.join(STORAGE_DIR, `${id}.${meta.ext}`);
      fs.writeFileSync(filePath, buffer);
      meta.updatedAt = Date.now();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      return res.json({ error: 0 });
    }
    return res.json({ error: 0 });
  } catch (e) {
    console.error('Callback error', e);
    res.json({ error: 1 });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// SPA fallback to index.html
if (fs.existsSync(DIST_DIR)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`OnlyOffice backend running on http://localhost:${PORT}`);
});
