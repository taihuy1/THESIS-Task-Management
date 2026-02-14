/*
  sseClients.js
  In-memory registry of active Server-Sent Event connections.
  Each authenticated user can have multiple open tabs, so we
  store a Set of response objects per userId.
*/

const logger = require('../utils/logger');

const clients = new Map(); // userId -> Set<http.ServerResponse>

// Register a new SSE response stream for a user.
function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
  logger.info('SSE client connected', { userId, total: clients.get(userId).size });
}

// Unregister a response when the browser disconnects.
function removeClient(userId, res) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(userId);
  logger.info('SSE client disconnected', { userId, remaining: set?.size ?? 0 });
}

// Push a named event to every open connection for a given user.
function sendEvent(userId, event, data = {}) {
  const set = clients.get(userId);
  if (!set || set.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      logger.warn('SSE write failed, removing stale client', { userId });
      set.delete(res);
    }
  }
}

module.exports = { addClient, removeClient, sendEvent };
