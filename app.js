'use strict';
const $ = id => document.getElementById(id);
const STORAGE = 'sira-assessment-v2';
let questions = [], busy = false, syncing = null, saveTimer, offset = 0, warning = 0;
let s = { token: null, answers: [], confidence: [], flags: [], index: 0, revision: 0, dirty: false, frozen: false, sent: false };
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(s)); }
  catch { $('syncStatus').textContent = 'Device storage unavailable. Keep this page open and stay online.'; }
}
function recover() {
  try {
    const item = JSON.parse(localStorage.getItem(STORAGE));
    if (item?.token && Array.isArray(item.answers) && item.answers.length === 60 && Array.isArray(item.confidence) && item.confidence.length === 60) s = { ...s, ...item, index: Math.max(0, Math.min(59, Number(item.index) || 0)) };
  } catch { /* No usable saved attempt. */ }
}
function page(name) { document.body.dataset.page = name; ['intro', 'exam', 'results'].forEach(id => $(id).hidden = id !== name); $('sidebar').hidden = name !== 'exam'; }
function message(text) { $('message').textContent = text; $('message').className = 'error'; $('message').hidden = !text; }
async function request(path, body) {
  const response = await fetch(path, { cache: 'no-store', signal: AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json', ...(s.token ? { Authorization: `Bearer ${s.token}` } : {}) }, ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => { throw Error('Unexpected server response. Please retry.'); });
  if (!response.ok) throw Object.assign(Error(data.error || 'Request failed'), { status: response.status });
  return data;
}
function remaining() { return s.deadline ? Math.max(0, Math.ceil((s.deadline - Date.now() - offset) / 1000)) : 3600; }
function answered() { return s.answers.filter(x => x !== null).length; }
function clock() {
  const left = remaining();
  $('clock').textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  $('clock').classList.toggle('danger', left <= 300);
  if (!s.token || s.sent) return;
  const threshold = left <= 60 ? 1 : left <= 300 ? 5 : left <= 600 ? 10 : 0;
  if (threshold && threshold !== warning) { warning = threshold; $('syncStatus').textContent = `${threshold} minute${threshold > 1 ? 's' : ''} remaining. Review unanswered questions.`; }
  if (left === 0 && !s.frozen) { s.frozen = true; persist(); submit(); }
}
function change(fn) {
  if (s.frozen || remaining() <= 0) return;
  fn(); s.dirty = true; persist(); render();
  clearTimeout(saveTimer); saveTimer = setTimeout(() => sync().catch(syncError), 350);
}
function syncError(error) {
  $('syncStatus').textContent = error.status === 409 ? error.message : 'Not synced. Responses remain on this device. Reconnect before the deadline.';
  if (error.status === 409) { s.frozen = true; persist(); render(); }
}
async function sync() {
  if (syncing) { await syncing; if (s.dirty && !s.frozen) return sync(); return; }
  if (!s.dirty || s.frozen || !s.token) return;
  const answers = [...s.answers], confidence = [...s.confidence];
  syncing = (async () => {
    const data = await request('/api/save', { token: s.token, revision: s.revision, answers, confidence });
    offset = data.serverNow - Date.now();
    s.revision = data.attempt.revision;
    s.dirty = JSON.stringify([s.answers, s.confidence]) !== JSON.stringify([answers, confidence]);
    s.savedAt = data.attempt.savedAt;
    if (data.attempt.state !== 'active') s.frozen = true;
    persist();
    $('syncStatus').textContent = s.frozen ? 'Time ended. The server will grade its last saved responses.' : s.dirty ? 'Saving latest changes…' : 'Saved on this device and synced to the server.';
  })();
  try { await syncing; } finally { syncing = null; }
}
function render(focus = false) {
  const focusedOption = [...$('options').children].indexOf(document.activeElement);
  const q = questions[s.index]; if (!q) return;
  $('qNum').textContent = `QUESTION ${s.index + 1} OF 60`;
  $('qTopic').textContent = `${q.topic} / ${q.level}`;
  $('qTitle').textContent = q.prompt;
  $('qTitle').tabIndex = -1;
  if (focus) $('qTitle').focus();
  $('qProgress').style.width = `${answered() / 60 * 100}%`;
  $('qProgress').parentElement.setAttribute('aria-label', `${answered()} of 60 answered`);
  $('options').replaceChildren();
  q.options.forEach((option, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `option${s.answers[s.index] === i ? ' selected' : ''}`;
    button.setAttribute('aria-pressed', String(s.answers[s.index] === i)); button.disabled = s.frozen;
    const letter = document.createElement('span'); letter.className = 'letter'; letter.textContent = 'ABCD'[i];
    const text = document.createElement('span'); text.textContent = option; button.append(letter, text);
    button.onclick = () => change(() => s.answers[s.index] = i); $('options').append(button);
  });
  document.querySelectorAll('[data-c]').forEach(button => { const selected = s.confidence[s.index] === button.dataset.c; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); button.disabled = s.frozen; });
  $('flag').textContent = s.flags[s.index] ? '★ Flagged' : '☆ Flag for review';
  $('flag').setAttribute('aria-pressed', String(Boolean(s.flags[s.index])));
  $('prev').disabled = s.index === 0;
  $('next').textContent = s.index === 59 ? 'Finish assessment' : 'Next question →';
  $('nav').replaceChildren();
  questions.forEach((_, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = i + 1;
    button.className = `${s.answers[i] !== null ? 'answered ' : ''}${s.index === i ? 'current ' : ''}${s.flags[i] ? 'flagged' : ''}`;
    button.setAttribute('aria-label', `Question ${i + 1}, ${s.answers[i] !== null ? 'answered' : 'unanswered'}${s.flags[i] ? ', flagged' : ''}`);
    if (s.index === i) button.setAttribute('aria-current', 'step');
    button.onclick = () => { s.index = i; persist(); render(true); }; $('nav').append(button);
  });
  $('sideCount').textContent = `${answered()}/60 answered`;
  $('sideFlag').textContent = `${s.flags.filter(Boolean).length} flagged`;
  if (!focus && focusedOption >= 0) $('options').children[focusedOption]?.focus({ preventScroll: true });
}
async function load() {
  const data = await request('/api/questions'); questions = data.questions;
  offset = data.serverNow - Date.now();
  const record = data.attempt;
  s.deadline = record.deadline;
  if (!s.dirty || record.revision !== s.revision || record.state !== 'active') {
    if (s.dirty && record.revision !== s.revision) message('Recovered the server copy. A different tab may have changed this attempt.');
    s.answers = record.answers; s.confidence = record.confidence; s.dirty = false;
  }
  s.revision = record.revision; s.frozen = record.state !== 'active' || remaining() === 0;
  if (record.result) { s.sent = true; s.result = record.result; }
  persist();
}
async function start() {
  if (busy) return; busy = true; $('start').disabled = true; $('start').textContent = 'Starting…'; message('');
  try {
    const learnerCode = $('learnerCode').value.trim(), accessCode = $('accessCode').value;
    const data = await request('/api/start', { learnerCode, accessCode });
    s = { token: data.token, learnerCode, startedAt: data.startedAt, deadline: data.deadline, answers: Array(60).fill(null), confidence: Array(60).fill(null), flags: Array(60).fill(false), revision: 0, index: 0, dirty: false, frozen: false, sent: false };
    $('accessCode').value = ''; persist(); await load(); page('exam'); render(true); clock();
  } catch (e) { message(e.message); if (s.token) { $('start').textContent = 'Recover saved assessment'; $('start').onclick = init; } }
  finally { busy = false; $('start').disabled = false; if (!s.token) $('start').textContent = 'Start the 60-minute assessment →'; }
}
function confirmSubmit() {
  if (confirm(`Submit now? ${60 - answered()} unanswered; ${s.flags.filter(Boolean).length} flagged. You cannot change answers after submission.`)) submit();
}
async function submit() {
  if (busy || !s.token || s.sent) return;
  busy = true; clearTimeout(saveTimer); page('results'); $('retry').hidden = true; $('sendError').hidden = true;
  $('sendNotice').textContent = 'Saving your submission and requesting email acceptance…';
  try {
    if (syncing) await syncing;
    const result = await request('/api/submit', { token: s.token, revision: s.revision, answers: s.answers, confidence: s.confidence });
    s.frozen = true; persist();
    if (result.pending) throw Error('Submission is processing. Check confirmation shortly.');
    s.sent = true; s.result = result; persist(); success();
  } catch (e) {
    $('sendNotice').textContent = 'Email acceptance has not been confirmed.';
    $('sendError').textContent = `${e.message} Keep this page or save a backup. After the deadline, only responses already synced to the server are graded.`;
    $('sendError').hidden = false; $('retry').hidden = false; $('backup').hidden = false;
  } finally { busy = false; }
}
function success() {
  page('results'); $('sendError').hidden = true; $('retry').hidden = true; $('backup').hidden = true;
  $('sendNotice').textContent = `Submission saved. The email provider accepted your teacher’s report.${s.result.expired ? ' Time expired; the report uses the last responses received before the deadline.' : ''}`;
  $('finishSummary').hidden = false; $('resultScore').textContent = `${s.result.score} / 60`;
  $('resultPercent').textContent = `${s.result.percent}% correct · ${s.result.answered} answered`;
  clearInterval(ticker);
}
function backup() {
  const blob = new Blob([JSON.stringify({ learnerCode: s.learnerCode, attemptId: s.token?.split('.')[0], answers: s.answers, confidence: s.confidence, warning: 'Unverified device copy for instructor review. This file cannot extend the deadline.' }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'sira-responses-private.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
async function init() {
  recover();
  if (!s.token) { page('intro'); return; }
  if (s.sent && s.result) { success(); return; }
  try { await load(); if (s.sent) success(); else if (s.frozen) submit(); else { page('exam'); render(); clock(); if (s.dirty) sync().catch(syncError); } }
  catch (e) {
    page('results'); $('sendNotice').textContent = 'Saved attempt found. Reconnect to recover it.';
    $('sendError').textContent = e.message; $('sendError').hidden = false; $('retry').hidden = false; $('backup').hidden = false;
    $('retry').onclick = async () => { $('retry').onclick = submit; await init(); };
  }
}
function move(delta) { if (delta === 1 && s.index === 59) { confirmSubmit(); return; } s.index = Math.min(59, Math.max(0, s.index + delta)); persist(); render(true); }
$('start').onclick = start; $('prev').onclick = () => move(-1); $('next').onclick = () => move(1);
$('flag').onclick = () => { s.flags[s.index] = !s.flags[s.index]; persist(); render(); };
$('finish').onclick = confirmSubmit; $('retry').onclick = submit; $('backup').onclick = backup;
document.querySelectorAll('[data-c]').forEach(button => button.onclick = () => change(() => s.confidence[s.index] = s.confidence[s.index] === button.dataset.c ? null : button.dataset.c));
window.addEventListener('online', () => { if (s.frozen) submit(); else sync().catch(syncError); });
window.addEventListener('beforeunload', event => { if (s.token && !s.sent && s.dirty) { event.preventDefault(); event.returnValue = ''; } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) clock(); });
document.addEventListener('keydown', event => {
  if ($('exam').hidden || /INPUT|TEXTAREA|BUTTON/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (/^[1-4]$/.test(event.key)) { event.preventDefault(); change(() => s.answers[s.index] = Number(event.key) - 1); }
  if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1);
});
const ticker = setInterval(clock, 1000);
setInterval(() => { if (s.token && !s.frozen && s.dirty) sync().catch(syncError); }, 10000);
init();
