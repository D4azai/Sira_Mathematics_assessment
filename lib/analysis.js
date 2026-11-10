import { QUESTIONS } from './questions.js';
import { escapeHtml as e } from './session.js';
export const OBJECTIVES = {
  'Numerical fluency': 'Explain fraction, ratio and percent reasoning; check estimates before calculating.',
  'Algebra and manipulation': 'Expand and factor expressions, preserve restrictions and explain each transformation.',
  'Equations and inequalities': 'Solve linear, quadratic and rational equations; check candidates in the original equation.',
  'Functions and graphs': 'Connect formulas to graphs; justify domains, transformations and inverse restrictions.',
  'Exponents and logarithms': 'Use exponent and log laws with domain checks; model growth and solve equations.',
  'Trigonometry': 'Use radians and the unit circle to explain identities and find every solution in an interval.',
  'Precalculus and calculus bridge': 'Connect average change, limits and derivative meaning before practising rules.'
};
export function scoreAttempt(answers, confidence) {
  const details = QUESTIONS.map((q, i) => ({ ...q, answer: answers[i] === null ? 'Not answered' : q.options[answers[i]], isCorrect: answers[i] === q.correct, confidence: confidence[i], unanswered: answers[i] === null }));
  const breakdown = Object.keys(OBJECTIVES).map(topic => {
    const items = details.filter(q => q.topic === topic);
    const correct = items.filter(q => q.isCorrect).length;
    const percent = Math.round(100 * correct / items.length);
    const unsureCorrect = items.filter(q => q.isCorrect && ['unsure', 'guess'].includes(q.confidence)).length;
    const confidentErrors = items.filter(q => !q.isCorrect && q.confidence === 'sure' && !q.unanswered).length;
    const levels = ['Foundation', 'Intermediate', 'Stretch'].map(level => ({ level, total: items.filter(q => q.level === level).length, correct: items.filter(q => q.level === level && q.isCorrect).length }));
    const foundation = levels[0];
    const secure = percent >= 80 && unsureCorrect <= correct / 3 && confidentErrors === 0 && (!foundation.total || foundation.correct / foundation.total >= .8);
    return { topic, correct, total: items.length, answered: items.filter(q => !q.unanswered).length, percent, levels, unsureCorrect, confidentErrors, category: secure ? 'Secure' : percent >= 40 ? 'Fragile' : 'Not yet acquired', objective: OBJECTIVES[topic] };
  });
  const correct = details.filter(q => q.isCorrect).length;
  const strongest = [...breakdown].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const priorities = [...breakdown].sort((a, b) => a.percent - b.percent || b.confidentErrors - a.confidentErrors).slice(0, 3);
  const needs = priorities.filter(x => x.category !== 'Secure');
  const plan = Array.from({ length: 6 }, (_, i) => {
    const area = (needs.length ? needs : priorities)[Math.min(Math.floor(i / 2), (needs.length || priorities.length) - 1)];
    return { week: i + 2, topic: area.topic, objective: `${area.objective} ${i % 2 ? 'Apply to mixed problems and check independently with an exit task.' : 'Start with worked explanations and a short verbal check.'}` };
  });
  return { correct, total: 60, percent: Math.round(correct / 60 * 100), answered: details.filter(q => !q.unanswered).length, unanswered: details.filter(q => q.unanswered).map(q => q.id), incorrect: details.filter(q => !q.isCorrect && !q.unanswered).map(q => q.id), stretchCorrect: details.filter(q => q.level === 'Stretch' && q.isCorrect).length, stretchTotal: details.filter(q => q.level === 'Stretch').length, breakdown, strongest, priorities, plan, details };
}
export function makeMail(record) {
  const s = scoreAttempt(record.answers, record.confidence);
  const summary = `Learner: ${record.learnerCode}\nAttempt: ${record.id}\nSubmitted (UTC): ${new Date(record.submittedAt).toISOString()}\nTime: ${Math.ceil((record.submittedAt - record.startedAt) / 60000)} minutes\nScore: ${s.correct}/60 (${s.percent}%)\nAdvanced: ${s.stretchCorrect}/${s.stretchTotal}\nUnanswered: ${s.unanswered.join(', ') || 'None'}\nIncorrect: ${s.incorrect.join(', ') || 'None'}\nDeadline reached: ${Boolean(record.expired)}`;
  const topics = s.breakdown.map(x => `${x.topic}: ${x.correct}/${x.total} (${x.percent}%) — ${x.category}; confident errors: ${x.confidentErrors}; uncertain correct: ${x.unsureCorrect}. ${x.levels.map(l => `${l.level} ${l.correct}/${l.total}`).join('; ')}. ${x.objective}`).join('\n');
  const rankings = `Strongest areas (relative): ${s.strongest.map(x => x.topic).join(', ')}\nPriority checks: ${s.priorities.map(x => x.topic).join(', ')}`;
  const plan = s.plan.map(x => `Week ${x.week}: ${x.topic}. ${x.objective}`).join('\n');
  const detail = s.details.map(q => `Q${q.id} [${q.level}] ${q.topic} / ${q.skill}\n${q.prompt}\nStudent: ${q.answer} | Correct: ${q.options[q.correct]} | ${q.unanswered ? 'UNANSWERED' : q.isCorrect ? 'CORRECT' : 'INCORRECT'} | Confidence: ${q.confidence || 'Not rated'}\n${q.explanation}`).join('\n\n');
  const caveat = 'Provisional screening indicators only, not official placement classifications. Confidence is self-reported. Each skill has limited evidence; confirm with worked solutions. Unanswered questions may reflect time pressure. Preserve secure foundations and adjust Weeks 2–7 after observation.';
  const text = `SIRA mathematics diagnostic\n${summary}\n\n${topics}\n\n${rankings}\n\n${plan}\n\n${detail}\n\n${caveat}`;
  const html = `<div style="font:15px/1.6 Arial,sans-serif;color:#17283f;max-width:760px;margin:auto"><h1>SIRA mathematics diagnostic</h1><pre style="white-space:pre-wrap;font:inherit">${e(summary)}</pre><h2>Domain evidence</h2><table style="border-collapse:collapse;width:100%"><tr><th align="left">Domain</th><th>Score</th><th>Provisional indicator</th></tr>${s.breakdown.map(x => `<tr><td style="padding:10px;border-bottom:1px solid #ddd">${e(x.topic)}<br><small>${x.levels.map(l => `${l.level}: ${l.correct}/${l.total}`).join(' · ')}<br>Confident errors: ${x.confidentErrors}; uncertain correct: ${x.unsureCorrect}</small></td><td>${x.correct}/${x.total}</td><td>${x.category}</td></tr>`).join('')}</table><h2>Teaching priorities</h2><p>${e(rankings).replaceAll('\n', '<br>')}</p><h2>Suggested Weeks 2–7</h2>${s.plan.map(x => `<p><b>Week ${x.week}: ${e(x.topic)}</b><br>${e(x.objective)}</p>`).join('')}<h2>Question-by-question review</h2>${s.details.map(q => `<div style="padding:12px 0;border-top:1px solid #ddd"><b>Q${q.id} · ${e(q.skill)} · ${q.level}</b><p>${e(q.prompt)}</p><p>Student: ${e(q.answer)}<br>Correct: ${e(q.options[q.correct])}<br>${q.unanswered ? 'Unanswered' : q.isCorrect ? 'Correct' : 'Incorrect'} · Confidence: ${e(q.confidence || 'Not rated')}</p><p>${e(q.explanation)}</p></div>`).join('')}<p style="color:#64748b">${e(caveat)}</p></div>`;
  return { text, html, score: s };
}
