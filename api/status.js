import { json } from '../lib/session.js';
export default function handler(req,res) {
  if(req.method !== 'GET') return json(res,405,{error:'Method not allowed'});
  return json(res,200,{
    assessmentReady: Boolean(process.env.ASSESSMENT_SECRET && process.env.ASSESSMENT_ACCESS_CODE),
    emailReady: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    version:1
  });
}
