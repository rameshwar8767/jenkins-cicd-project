const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || '1.0.0';
const ENV = process.env.NODE_ENV || 'production';
const START_TIME = Date.now();

// ─── Middleware ────────────────────────────────────────────
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// ─── Helper ────────────────────────────────────────────────
const formatUptime = (ms) => {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0)  return `${hrs}h ${min % 60}m`;
  return `${min}m ${sec % 60}s`;
};

// ─── Routes ────────────────────────────────────────────────
app.get('/', (req, res) => {
  const uptimeMs = Date.now() - START_TIME;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jenkins CI/CD Pipeline V2</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0f0e17;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Top bar ── */
    .topbar {
      background: rgba(255,255,255,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 12px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo { font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #a5b4fc; }
    .status-pill {
      display: flex; align-items: center; gap: 6px;
      background: rgba(34,197,94,0.12);
      border: 1px solid rgba(34,197,94,0.3);
      color: #4ade80; font-size: 12px; padding: 4px 12px;
      border-radius: 20px;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #4ade80;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

    /* ── Hero ── */
    .hero {
      text-align: center;
      padding: 56px 24px 32px;
    }
    .badge {
      display: inline-block;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.3);
      color: #a5b4fc; font-size: 11px;
      padding: 4px 14px; border-radius: 20px;
      letter-spacing: .8px; margin-bottom: 20px;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(24px, 5vw, 36px);
      font-weight: 700; margin-bottom: 10px;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle { color: rgba(255,255,255,0.45); font-size: 15px; }

    /* ── Stats grid ── */
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 14px;
      max-width: 720px;
      margin: 32px auto;
      padding: 0 24px;
    }
    .stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 18px 16px;
      text-align: center;
      transition: border-color .2s;
    }
    .stat-card:hover { border-color: rgba(165,180,252,0.3); }
    .stat-label {
      font-size: 11px; color: rgba(255,255,255,0.4);
      text-transform: uppercase; letter-spacing: .6px;
      margin-bottom: 8px;
    }
    .stat-value { font-size: 20px; font-weight: 600; }
    .purple { color: #a5b4fc; }
    .green  { color: #4ade80; }
    .orange { color: #fb923c; }
    .cyan   { color: #22d3ee; }

    /* ── Pipeline stages ── */
    .pipeline-wrap {
      max-width: 720px;
      margin: 0 auto 40px;
      padding: 0 24px;
    }
    .section-title {
      font-size: 11px; color: rgba(255,255,255,0.35);
      text-transform: uppercase; letter-spacing: .8px;
      margin-bottom: 14px;
    }
    .stages {
      display: flex; align-items: center;
      gap: 4px; flex-wrap: wrap;
    }
    .stage {
      flex: 1; min-width: 70px;
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.2);
      color: #4ade80; font-size: 12px; font-weight: 600;
      padding: 10px 6px; border-radius: 6px;
      text-align: center; letter-spacing: .3px;
    }
    .arrow { color: rgba(255,255,255,0.2); font-size: 16px; flex-shrink: 0; }

    /* ── Footer ── */
    footer {
      margin-top: auto;
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 16px 32px;
      display: flex; align-items: center;
      justify-content: space-between; flex-wrap: gap;
      font-size: 12px; color: rgba(255,255,255,0.3);
    }
    .tags { display: flex; gap: 6px; }
    .tag {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 3px 9px; border-radius: 4px; font-size: 11px;
    }
  </style>
</head>
<body>

  <nav class="topbar">
    <div class="logo">⚙ JENKINS CI/CD</div>
    <div class="status-pill">
      <div class="dot"></div> Live · ${ENV}
    </div>
  </nav>

  <main>
    <div class="hero">
      <div class="badge">Auto-deployed via Jenkins + Docker</div>
      <h1>CI/CD Pipeline Dashboard</h1>
      <p class="subtitle">Node.js + Express · ${os.hostname()}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Version</div>
        <div class="stat-value purple">${VERSION}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Environment</div>
        <div class="stat-value green">${ENV}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Uptime</div>
        <div class="stat-value orange">${formatUptime(uptimeMs)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Node.js</div>
        <div class="stat-value cyan">${process.version}</div>
      </div>
    </div>

    <div class="pipeline-wrap">
      <div class="section-title">Pipeline stages</div>
      <div class="stages">
        <div class="stage">✓ Clone</div>
        <div class="arrow">›</div>
        <div class="stage">✓ Install</div>
        <div class="arrow">›</div>
        <div class="stage">✓ Test</div>
        <div class="arrow">›</div>
        <div class="stage">✓ Build</div>
        <div class="arrow">›</div>
        <div class="stage">✓ Push</div>
        <div class="arrow">›</div>
        <div class="stage">✓ Deploy</div>
      </div>
    </div>
  </main>

  <footer>
    <span>Built: ${new Date().toUTCString()}</span>
    <div class="tags">
      <span class="tag">Node 18</span>
      <span class="tag">Docker</span>
      <span class="tag">Jenkins</span>
      <span class="tag">GitHub</span>
    </div>
  </footer>

</body>
</html>`);
});

// ─── Health Check (for Docker HEALTHCHECK & load balancers) ──
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: VERSION,
    environment: ENV,
    uptime: formatUptime(Date.now() - START_TIME),
    timestamp: new Date().toISOString(),
    node: process.version,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  });
});

// ─── Info endpoint ──────────────────────────────────────────
app.get('/info', (req, res) => {
  res.status(200).json({
    app: 'Jenkins CI/CD Demo',
    version: VERSION,
    environment: ENV,
    host: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    buildTime: new Date().toISOString()
  });
});

// ─── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ─── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────┐
  │   Jenkins CI/CD App Running         │
  │   Port     : ${PORT}                    │
  │   Version  : ${VERSION}                  │
  │   Env      : ${ENV}               │
  │   URL      : http://localhost:${PORT}   │
  └─────────────────────────────────────┘
  `);
});