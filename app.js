const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Jenkins CI/CD Demo</title></head>
      <body style="font-family:Arial; text-align:center; margin-top:100px; background:#1a1a2e; color:white;">
        <h1>🚀 Jenkins CI/CD Pipeline</h1>
        <p>Auto-deployed via Jenkins + Docker</p>
        <p>Version: <strong>1.0.0</strong></p>
        <p>Build Time: <strong>${new Date().toISOString()}</strong></p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});