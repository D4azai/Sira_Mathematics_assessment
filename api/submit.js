import { createHash } from 'node:crypto';
import { QUESTIONS } from '../lib/questions.js';
import { escapeHtml,json,verifySession } from '../lib/session.js';

const DESTINATION = 'aymane.chellak@outlook.fr';
const DOMAIN_HINTS = {
  'Numerical fluency':'Fractions, signed values, ratio/percent and independent reasoning',
  'Algebra and manipulation':'Expansion, factorisation, manipulation, algebraic fractions',
  'Equations and inequalities':'Linear/quadratic equations, inequalities and checking solutions',
  'Functions and graphs':'Domain, transformations, slope and inverse functions',
  'Exponents and logarithms':'Powers, logs and exponential models',
  'Trigonometry':'Radians, unit circle, identities and reference angles',
  'Precalculus and calculus bridge':'Average change, limits and derivative foundations'
};
function scoreAttempt(answers,confidence) {
  const topics = [...new Set(QUESTIONS.map(q=>q.topic))];
  const breakdown = topics.map(topic => {
    const items=QUESTIONS.filter(q=>q.topic===topic);
    const correct=items.filter(q=>answers[q.id-1]===q.correct).length;
    const answered=items.filter(q=>answers[q.id-1]!==null).length;
    return {topic,correct,answered,total:items.length,percent:Math.round(100*correct/items.length),focus:DOMAIN_HINTS[topic]};
  });
  const correct = QUESTIONS.filter(q=>answers[q.id-1]===q.correct).length;
  const stretch=QUESTIONS.filter(q=>q.level==='Stretch');
  return {correct,total:QUESTIONS.length,percent:Math.round(correct*100/QUESTIONS.length),answered:answers.filter(x=>x!==null).length,
    stretchCorrect:stretch.filter(q=>answers[q.id-1]===q.correct).length,stretchTotal:stretch.length,
    breakdown,details:QUESTIONS.map(q=>({id:q.id,topic:q.topic,skill:q.skill,level:q.level,prompt:q.prompt,
      answer:answers[q.id-1]===null?'Not answered':q.options[answers[q.id-1]],
      correctAnswer:q.options[q.correct],isCorrect:answers[q.id-1]===q.correct,
      confidence:confidence[q.id-1],explanation:q.explanation}))};
}
function makeMail(learnerCode,s,session) {
  const header='SIRA — Mathematics assessment result\n' +
    'Learner reference: '+learnerCode+'\n' +
    'Score: '+s.correct+'/'+s.total+' ('+s.percent+'%)\n' +
    'Answered: '+s.answered+'/'+s.total+'\n' +
    'Advanced questions: '+s.stretchCorrect+'/'+s.stretchTotal+'\n' +
    'Time used: '+Math.ceil(session.elapsedSeconds/60)+' minutes\n' +
    'Started (UTC): '+new Date(session.startedAt).toISOString()+'\n\n';
  const topicText=s.breakdown.map(x=>x.topic+': '+x.correct+'/'+x.total+' ('+x.percent+'%). '+x.focus).join('\n');
  const detailText=s.details.map(x=>'Q'+x.id+' ['+x.level+'] '+x.topic+' / '+x.skill+'\n'+x.prompt+'\nStudent: '+x.answer+' | Correct: '+x.correctAnswer+' | '+(x.isCorrect?'RIGHT':'WRONG')+' | Confidence: '+(x.confidence||'not rated')+'\nExplanation: '+x.explanation).join('\n\n');
  const priority=s.breakdown.filter(x=>x.percent<60).sort((a,b)=>a.percent-b.percent).map(x=>x.topic).join(', ')||'No domain below 60%; verify advanced reasoning verbally';
  const text=header+'PERFORMANCE BY TOPIC\n'+topicText+'\n\nPOTENTIAL PRIORITIES\n'+priority+'\n\nDETAILED RESPONSE REVIEW\n'+detailText+
  '\n\nInterpretation: screening evidence only; validate with observed worked solutions, not a formal placement decision.';
  const rows=s.breakdown.map(x=>'<tr><td style="padding:8px;border-bottom:1px solid #ddd">'+escapeHtml(x.topic)+'</td><td style="padding:8px;border-bottom:1px solid #ddd">'+x.correct+'/'+x.total+' ('+x.percent+'%)</td></tr>').join('');
  const html='<div style="font:15px/1.6 Arial,sans-serif;color:#17283e;max-width:680px"><h2>SIRA mathematics assessment</h2>'+
    '<p><b>Learner reference:</b> '+escapeHtml(learnerCode)+'</p><h1>'+s.correct+' / '+s.total+' · '+s.percent+'%</h1>'+
    '<p>Answered '+s.answered+' questions · Advanced '+s.stretchCorrect+'/'+s.stretchTotal+' · '+Math.ceil(session.elapsedSeconds/60)+' minutes</p>'+
    '<h3>Topic breakdown</h3><table style="border-collapse:collapse;width:100%">'+rows+'</table><h3>Areas to investigate</h3><p>'+escapeHtml(priority)+'</p>'+
    '<p>The detailed question-level review is included in the plain-text version of this email.</p><p style="color:#64748b;font-size:12px">Instructor-designed diagnostic, not an official placement assessment.</p></div>';
  return {text,html};
}

export default async function handler(req,res) {
  if(req.method !== 'POST') return json(res,405,{error:'Method not allowed'});
  if(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return json(res,503,{error:'Email delivery has not been configured; your answers remain saved on this device'});
  const {token,answers,confidence}=req.body||{};
  let session;
  try { session=verifySession(token); } catch(e) { return json(res,400,{error:e.message}); }
  if(!Array.isArray(answers)||answers.length!==QUESTIONS.length||answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>3))) return json(res,400,{error:'Invalid answer set'});
  if(!Array.isArray(confidence)||confidence.length!==QUESTIONS.length||confidence.some(a=>a!==null&&!['sure','unsure','guess'].includes(a))) return json(res,400,{error:'Invalid confidence values'});
  const report=scoreAttempt(answers,confidence);
  const message=makeMail(session.learnerCode,report,session);
  try {
    const hash=createHash('sha256').update(token).digest('hex');
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'sira-'+hash.slice(0,45)},
      body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL,to:[DESTINATION],subject:'SIRA assessment · '+session.learnerCode+' · '+report.correct+'/60',...message})
    });
    if(!response.ok) { console.error('Resend delivery failed',response.status);return json(res,502,{error:'Email delivery failed. Keep this browser open and try again or contact your teacher.'}); }
    return json(res,200,{ok:true,submittedAt:new Date().toISOString(),score:report.correct,total:report.total,percent:report.percent,answered:report.answered});
  } catch { return json(res,502,{error:'Could not reach the email service. Please retry when connected.'}); }
}
