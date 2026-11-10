import { QUESTIONS } from '../lib/questions.js';
import { json } from '../lib/session.js';

export default function handler(req,res) {
  if (req.method !== 'GET') return json(res,405,{error:'Method not allowed'});
  const questions = QUESTIONS.map(({id,topic,skill,level,prompt,options}) => ({id,topic,skill,level,prompt,options}));
  return json(res,200,{questions,durationSeconds:3600,version:1});
}
