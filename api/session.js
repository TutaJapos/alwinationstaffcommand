const crypto = require('crypto');

function sign(value) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');
}

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const token = (req.headers.cookie || '').match(/(?:^|;\s*)staff_session=([^;]+)/)?.[1];
  if (!token || !process.env.SESSION_SECRET) return res.status(401).json({ authenticated: false });
  const separator = token.lastIndexOf('.');
  const payload = separator > 0 ? token.slice(0, separator) : '';
  const signature = separator > 0 ? token.slice(separator + 1) : '';
  const expected = sign(payload);
  const validSignature = signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  const expiry = Number(payload.split(':').pop());
  if (!validSignature || !Number.isFinite(expiry) || expiry <= Date.now()) {
    return res.status(401).json({ authenticated: false });
  }
  return res.status(200).json({ authenticated: true });
};
