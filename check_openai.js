import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: 'test' });
console.log('openai.responses:', openai.responses);
console.log('openai.beta:', openai.beta);
