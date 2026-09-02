const crypto = require('crypto');

const COOKIE_NAME = 'staff_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function sign(value) {
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(value)
    .digest('base64url');
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.SESSION_SECRET || !process.env.STAFF_USERNAME || !process.env.STAFF_PASSWORD) {
    return res.status(500).json({ error: 'Authentication is not configured' });
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username !== process.env.STAFF_USERNAME ||
      password !== process.env.STAFF_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = `${username}:${Date.now() + SESSION_TTL_SECONDS * 1000}`;
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`);
  return res.status(200).json({ authenticated: true });
};
