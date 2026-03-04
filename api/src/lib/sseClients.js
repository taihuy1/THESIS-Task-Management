const logger = require('../utils/logger');

const clients = new Map();

function addClient(uid, res) {
  if (!clients.has(uid)) clients.set(uid, new Set());
  clients.get(uid).add(res);
  logger.info('sse:connect', { uid, n: clients.get(uid).size });
}

function removeClient(uid, res) {
  const s = clients.get(uid);
  if (!s) return;
  s.delete(res);
  if (s.size === 0) clients.delete(uid);
  logger.info('sse:disconnect', { uid });
}

function sendEvent(uid, event, data = {}) {
  const s = clients.get(uid);
  if (!s || !s.size) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const r of s) {
    try { r.write(payload); }
    catch { s.delete(r); }
  }
}

module.exports = { addClient, removeClient, sendEvent };
