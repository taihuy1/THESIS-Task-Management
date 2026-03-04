const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');
const { addClient, removeClient } = require('../lib/sseClients');
const logger = require('../utils/logger');

router.get('/stream', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'no token' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    logger.warn('sse auth fail', { err: e.message });
    return res.status(401).json({ message: 'bad token' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(':connected\n\n');

  // 30s heartbeat to keep proxies happy
  const hb = setInterval(() => res.write(':ping\n\n'), 30_000);
  addClient(decoded.id, res);

  req.on('close', () => {
    clearInterval(hb);
    removeClient(decoded.id, res);
  });
});

module.exports = router;
