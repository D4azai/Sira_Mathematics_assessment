import { timingSafeEqual } from 'node:crypto';
import { makeSession,json } from '../lib/session.js';

export default function handler(req,res) {
  if (req.method !== 'POST') return json(res,405,{error:'Method not allowed'});
  const expected = process.env.ASSESSMENT_ACCESS_CODE;
  if (!expected || !process.env.ASSESSMENT_SECRET) return json(res,503,{error:'Assessment not yet configured'});
  const { accessCode, learnerCode } = req.body ?? {};
  if (typeof accessCode !== 'string' || accessCode.length > 100 || !/^[A-Za-z0-9_-]{2,32}$/.test(learnerCode || '')) return json(res,400,{error:'Enter a valid assessment code and learner reference'});
  const a = Buffer.from(accessCode), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b)) return json(res,403,{error:'Incorrect assessment access code'});
  try { return json(res,200,makeSession(learnerCode)); }
  catch { return json(res,503,{error:'Assessment temporarily unavailable'}); }
}
