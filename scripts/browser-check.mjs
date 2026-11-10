import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { configure, serviceDouble } from '../tests/support.mjs';
import { key } from '../lib/store.js';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!existsSync(chromePath)) throw Error('Set CHROME_PATH to a Chromium or Chrome executable');
configure();
const double = serviceDouble(), originalFetch = globalThis.fetch;
globalThis.fetch = (url, options) => String(url).startsWith('http://127.0.0.1:') ? originalFetch(url, options) : double.fetch(url, options);
const routes = Object.fromEntries(await Promise.all(['start', 'questions', 'save', 'submit', 'status', 'retry'].map(async name => [name, (await import(`../api/${name}.js`)).default])));
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const server = createServer(async (req, res) => {
  for (const { key, value } of config.headers[0].headers) res.setHeader(key, value);
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
  if (req.url.startsWith('/api/')) {
    const handler = routes[req.url.slice(5)]; if (!handler) { res.statusCode = 404; res.end(); return; }
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined; } catch { res.statusCode = 400; res.end(); return; }
    return handler(req, res);
  }
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  if (!['index.html', 'app.js', 'app.css', 'assets/sira-logo.png', 'assets/5mimu-logo.png'].includes(file)) { res.statusCode = 404; res.end(); return; }
  res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css' : 'text/javascript');
  res.end(await readFile(`dist/${file}`));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir('test-results', { recursive: true });
const profile = resolve(`test-results/chrome-${Date.now()}`);
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
try {
  let port;
  for (let i = 0; i < 100; i++) { try { port = Number((await readFile(`${profile}/DevToolsActivePort`, 'utf8')).split('\n')[0]); break; } catch { await delay(100); } }
  if (!port) throw Error('Chrome did not start');
  const tabs = await originalFetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
  console.log('Chrome started; connecting debugger');
  ws = new WebSocket(tabs.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, reject) => { ws.onopen = r; ws.onerror = reject; });
  let seq = 0; const pending = new Map(), errors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task.reject(Error(JSON.stringify(message.error))); else task.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && message.params.entry.source === 'security') errors.push(message.params.entry.text);
  };
  function cdp(method, params = {}) { return new Promise((resolve, reject) => { const id = ++seq; const timeout = setTimeout(() => reject(Error(`Debugger timeout: ${method}`)), 15000); pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } }); ws.send(JSON.stringify({ id, method, params })); }); }
  async function evaluate(expression) { const out = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (out.exceptionDetails) throw Error(out.exceptionDetails.text); return out.result.value; }
  async function until(expression) { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(100); } throw Error(`Browser condition failed: ${expression}`); }
  async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); }
  async function reload() { await evaluate('window.__oldDocument=true'); await cdp('Page.reload'); await until("!window.__oldDocument && typeof start === 'function'"); }
  console.log('Debugger connected');
  await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: origin }); await until("!!document.querySelector('#start') && typeof start === 'function'");
  await until("[...document.images].every(image => image.complete && image.naturalWidth > 0)");
  const { writeFile } = await import('node:fs/promises');
  const introDesktop = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('test-results/intro-desktop.png', Buffer.from(introDesktop.data, 'base64'));
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Intro mobile horizontal overflow');
  const introMobile = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('test-results/intro-mobile.png', Buffer.from(introMobile.data, 'base64'));
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate("document.querySelector('#learnerCode').value='TUTOR_TEST'; document.querySelector('#accessCode').value='incorrect'");
  await click('#start'); await until("document.querySelector('#message').textContent.includes('Incorrect')");
  await evaluate("document.querySelector('#accessCode').value='test-private-code'"); await click('#start'); await until("!document.querySelector('#exam').hidden");
  await click('#options button:nth-child(2)'); await click('[data-c="sure"]');
  await until("document.querySelector('#syncStatus').textContent.includes('synced')");
  await reload(); await until("!document.querySelector('#exam').hidden && document.querySelector('#options button:nth-child(2)').getAttribute('aria-pressed')==='true'");
  assert.equal(await evaluate("document.querySelector('[data-c=sure]').getAttribute('aria-pressed')"), 'true');
  let screenshot = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile('test-results/desktop.png', Buffer.from(screenshot.data, 'base64'));
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile horizontal overflow');
  screenshot = await cdp('Page.captureScreenshot', { format: 'png' }); await writeFile('test-results/mobile.png', Buffer.from(screenshot.data, 'base64'));
  await cdp('Network.enable'); await cdp('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await click('#next'); await click('#options button:nth-child(4)');
  await until("JSON.parse(localStorage.getItem('sira-assessment-v2')).answers[1]===3");
  await delay(500);
  await cdp('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await evaluate("window.dispatchEvent(new Event('online'))"); await until("!JSON.parse(localStorage.getItem('sira-assessment-v2')).dirty");
  await evaluate('window.confirm=()=>false'); await click('#finish'); assert.ok(await evaluate("!document.querySelector('#exam').hidden"));
  double.setEmail(500, null); await evaluate('window.confirm=()=>true'); await click('#finish');
  await until("!document.querySelector('#retry').hidden && document.querySelector('#sendError').textContent.includes('queued')");
  double.setEmail(200); await click('#retry'); await until("!document.querySelector('#finishSummary').hidden");
  assert.equal(await evaluate("document.querySelector('#resultScore').textContent"), '2 / 60');
  const count = double.sends.length;
  await reload(); await until("!document.querySelector('#finishSummary').hidden"); assert.equal(double.sends.length, count);
  assert.equal((await originalFetch(`${origin}/lib/questions.js`)).status, 404);
  assert.equal((await originalFetch(`${origin}/api/questions`)).status, 401);
  // Expiry on refresh grades only the server snapshot, even if the device has extra answers.
  await evaluate('localStorage.clear()'); await reload(); await until("typeof start === 'function' && !document.querySelector('#intro').hidden");
  await evaluate("document.querySelector('#learnerCode').value='EXPIRY_TEST'; document.querySelector('#accessCode').value='test-private-code'");
  await click('#start'); await until("!document.querySelector('#exam').hidden");
  const recordKey = [...double.values.keys()].filter(x => x.startsWith('sira:attempt:') && !x.endsWith(':lock')).at(-1);
  const record = JSON.parse(double.values.get(recordKey)); record.deadline = Date.now() - 1; record.startedAt = record.deadline - 3600000; double.values.set(recordKey, JSON.stringify(record));
  await evaluate("let saved=JSON.parse(localStorage.getItem('sira-assessment-v2')); saved.answers[0]=1; saved.dirty=true; localStorage.setItem('sira-assessment-v2',JSON.stringify(saved))"); await reload();
  await until("!document.querySelector('#finishSummary').hidden");
  assert.equal(await evaluate("document.querySelector('#resultScore').textContent"), '0 / 60');
  assert.ok(await evaluate("document.querySelector('#sendNotice').textContent.includes('Time expired')"));
  assert.deepEqual(errors, []);
  console.log('PASS: real Chrome desktop/mobile, invalid code, autosave, confidence, refresh, offline recovery, confirmation cancel, email failure/retry, duplicate refresh, expiry and static-source denial. External storage/email are test doubles.');
} finally {
  if (ws) ws.close(); chrome.kill(); server.closeAllConnections(); await new Promise(r => server.close(r));
}
