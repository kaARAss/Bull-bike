'use strict';
/*
 * Bull Bike — бэкенд админки для Yandex Cloud Function (Node.js 18+).
 * Одна функция обслуживает три действия (по полю body.action):
 *   - "login"  — проверка логина/пароля, выдаёт JWT-токен на 12 часов.
 *   - "save"   — принимает изменённые файлы (JSON и картинки) и коммитит
 *                их напрямую в репозиторий GitHub через Contents API.
 *   - "ping"   — проверка, что функция жива.
 *
 * Секреты берутся из переменных окружения функции (см. backend/README.md):
 *   ADMIN_LOGIN            — логин администратора
 *   ADMIN_PASSWORD_HASH    — SHA-256 хеш пароля (hex)
 *   JWT_SECRET             — произвольная длинная строка для подписи токена
 *   GITHUB_TOKEN           — Personal Access Token с правом записи в репозиторий
 *   GITHUB_REPO            — "owner/repo", напр. "kaARAss/bullbike"
 *   GITHUB_BRANCH          — ветка (по умолчанию "main")
 *   ALLOW_ORIGIN           — разрешённый источник CORS (по умолчанию "*")
 */

const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlJson(obj) { return b64url(JSON.stringify(obj)); }

function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const data = b64urlJson(header) + '.' + b64urlJson(payload);
  const sig = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  return data + '.' + sig;
}
function verifyJwt(token, secret) {
  if (!token || token.split('.').length !== 3) return null;
  const [h, p, s] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', secret).update(h + '.' + p).digest());
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); }
  catch (e) { return null; }
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;
  return payload;
}

function sha256hex(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };
}
function reply(statusCode, obj, origin) {
  return { statusCode, headers: cors(origin), body: JSON.stringify(obj) };
}

async function gh(path, opts) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch('https://api.github.com' + path, Object.assign({}, opts, {
    headers: Object.assign({
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'bullbike-admin',
      'X-GitHub-Api-Version': '2022-11-28'
    }, (opts && opts.headers) || {})
  }));
  return res;
}

// Кладём один файл в репозиторий (создаёт или обновляет).
async function putFile(repo, branch, filePath, base64Content, message) {
  // 1) узнаём текущий sha (если файл уже есть)
  let sha;
  const getRes = await gh(`/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`, { method: 'GET' });
  if (getRes.status === 200) {
    const j = await getRes.json();
    sha = j.sha;
  }
  // 2) PUT
  const body = {
    message: message || ('admin: update ' + filePath),
    content: base64Content,
    branch: branch
  };
  if (sha) body.sha = sha;
  const putRes = await gh(`/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!putRes.ok) {
    const t = await putRes.text();
    throw new Error('GitHub PUT ' + filePath + ' failed: ' + putRes.status + ' ' + t);
  }
  return putRes.json();
}

module.exports.handler = async function (event, context) {
  const origin = process.env.ALLOW_ORIGIN || '*';
  const method = (event && (event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method))) || 'POST';

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: cors(origin), body: '' };
  }

  let body = {};
  try {
    let raw = event && event.body ? event.body : '{}';
    if (event && event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
    body = JSON.parse(raw || '{}');
  } catch (e) {
    return reply(400, { ok: false, error: 'Некорректный JSON в запросе' }, origin);
  }

  const action = body.action || 'ping';

  try {
    if (action === 'ping') {
      return reply(200, { ok: true, service: 'bullbike-admin', time: Date.now() }, origin);
    }

    if (action === 'login') {
      const login = String(body.login || '');
      const password = String(body.password || '');
      const okLogin = login === process.env.ADMIN_LOGIN;
      const okPass = sha256hex(password) === String(process.env.ADMIN_PASSWORD_HASH || '').toLowerCase();
      if (!okLogin || !okPass) {
        return reply(401, { ok: false, error: 'Неверный логин или пароль' }, origin);
      }
      const now = Math.floor(Date.now() / 1000);
      const token = signJwt({ sub: login, iat: now, exp: now + 12 * 3600 }, process.env.JWT_SECRET);
      return reply(200, { ok: true, token, expiresIn: 12 * 3600 }, origin);
    }

    if (action === 'save') {
      const auth = (event.headers && (event.headers.Authorization || event.headers.authorization)) || '';
      const token = auth.replace(/^Bearer\s+/i, '') || body.token || '';
      const payload = verifyJwt(token, process.env.JWT_SECRET);
      if (!payload) return reply(401, { ok: false, error: 'Сессия истекла — войдите заново' }, origin);

      const repo = process.env.GITHUB_REPO;
      const branch = process.env.GITHUB_BRANCH || 'main';
      if (!repo) return reply(500, { ok: false, error: 'GITHUB_REPO не настроен' }, origin);

      const changes = Array.isArray(body.changes) ? body.changes : [];
      if (!changes.length) return reply(400, { ok: false, error: 'Нет изменений для сохранения' }, origin);

      const message = body.message || ('admin: обновление контента (' + new Date().toISOString() + ')');
      const results = [];
      for (const ch of changes) {
        if (!ch || !ch.path) continue;
        let base64;
        if (ch.encoding === 'base64') {
          base64 = String(ch.content || '');
        } else {
          base64 = Buffer.from(String(ch.content == null ? '' : ch.content), 'utf8').toString('base64');
        }
        const r = await putFile(repo, branch, ch.path, base64, message);
        results.push({ path: ch.path, commit: r.commit && r.commit.sha });
      }
      return reply(200, { ok: true, saved: results.length, results }, origin);
    }

    return reply(400, { ok: false, error: 'Неизвестное действие: ' + action }, origin);
  } catch (e) {
    return reply(500, { ok: false, error: String(e && e.message || e) }, origin);
  }
};
