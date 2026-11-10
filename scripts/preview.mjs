import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { configure, serviceDouble } from '../tests/support.mjs';

// Isolated local demo: no production credentials, external storage or real email.
configure();
globalThis.fetch = serviceDouble().fetch;
const routes = Object.fromEntries(await Promise.all(['start', 'questions', 'save', 'submit', 'status'].map(async name => [name, (await import(`../api/${name}.js`)).default])));
const files = ['index.html', 'app.css', 'app.js', 'assets/sira-logo.png', 'assets/5mimu-logo.png'];
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    res.status = code => { res.statusCode = code; return res; };
    res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
    if (path.startsWith('/api/')) {
      const handler = routes[path.slice(5)];
      if (!handler) { res.statusCode = 404; res.end(); return; }
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 16384) { res.statusCode = 413; res.end(); return; } }
      req.body = body ? JSON.parse(body) : undefined;
      await handler(req, res); return;
    }
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!files.includes(file)) { res.statusCode = 404; res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    let content = await readFile(`dist/${file}`);
    if (file === 'index.html') {
      content = content.toString().replace('<body>', '<body><div class="info" role="status">Local demonstration · Sample data only · Email delivery is simulated.</div>')
        .replace('id="learnerCode"', 'id="learnerCode" value="DEMO"')
        .replace('id="accessCode"', 'id="accessCode" value="test-private-code"');
    }
    res.end(content);
  } catch { res.statusCode = 500; res.end('Local preview error'); }
});
server.listen(3000, '127.0.0.1', () => console.log('Local demo: http://127.0.0.1:3000 — no real emails are sent.'));
