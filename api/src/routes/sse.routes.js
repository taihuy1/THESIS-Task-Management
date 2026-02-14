/*
  sse.routes.js
  Server-Sent Events endpoint.
  The browser opens GET /events/stream?token=<JWT> and receives
  real-time push events (task updates, notifications).

  Authentication uses a query-string token because the native
  EventSource API does not support custom request headers.
*/

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');
const { addClient, removeClient } = require('../lib/sseClients');
const logger = require('../utils/logger');

router.get('/stream', (req, res) => {
  // Authenticate via query param
  const token = req.query.token;
  if (!token) return res.status(401).json({ message: 'Token required' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.warn('SSE auth failed', { error: err.message });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const userId = decoded.id;

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // prevents Nginx from buffering the stream
  });

  // Flush proxy buffers with an initial comment
  res.write(':connected\n\n');

  // Keep-alive heartbeat every 30s so proxies don't kill idle connections
  const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 30_000);

  addClient(userId, res);

  // Clean up when the browser closes the tab
  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});

module.exports = router;
