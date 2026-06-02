#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const argvRaw = process.argv.slice(2);
const args = {};
for (let i=0;i<argvRaw.length;i++){
  if (argvRaw[i].startsWith('--')){
    const key = argvRaw[i].slice(2);
    const next = argvRaw[i+1];
    if (next && !next.startsWith('--')) { args[key]=next; i++; } else args[key]=true;
  }
}
const templatePath = args.template || args.t;
const outputPath = args.output || args.o || 'out/generated.md';
const brief = args.brief || args.b || '';
const apiKey = args.apiKey || process.env.OPENAI_API_KEY;
const model = args.model || 'gpt-4o-mini';

if (!templatePath) { console.error('Missing --template path'); process.exit(1); }

const template = fs.readFileSync(path.resolve(templatePath),'utf8');

const placeholders = Array.from(new Set((template.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g)||[]).map(m=>m.replace(/{{\s*|\s*}}/g,'')));

if (placeholders.length===0) {
  console.log('No placeholders found, copying template to output.');
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath,template,'utf8');
  process.exit(0);
}

async function callOpenAI() {
  if (!apiKey) { console.error('No API key provided. Set OPENAI_API_KEY or pass --apiKey.'); process.exit(1); }
  const system = 'You are a helpful spec writer. Given the project brief and a list of placeholder keys, produce a JSON object whose keys exactly match the placeholders and values are strings suitable to insert into a Markdown template. Return ONLY valid JSON.';
  const user = `Placeholders: ${JSON.stringify(placeholders)}\n\nProject brief:\n${brief}\n\nInstructions: For each placeholder, generate a clear, concise Markdown-formatted string (can contain multiple paragraphs or lists). Ensure the JSON is valid and keys match exactly.`;
  const body = {
    model,
    messages: [
      {role:'system', content: system},
      {role:'user', content: user}
    ],
    temperature: 0.2,
    max_tokens: 1500
  };
  const fetchFn = (typeof fetch !== 'undefined') ? fetch : require('node-fetch');
  const res = await fetchFn('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const text = data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text) || '';
  const jsonStart = text.indexOf('{');
  const jsonText = jsonStart>=0 ? text.slice(jsonStart) : text;
  try {
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    throw new Error('Failed to parse JSON from model response. Response was:\n' + text);
  }
}

(async function main(){
  try {
    let values;
    if (apiKey) {
      console.log('Calling OpenAI to generate content for placeholders:', placeholders.join(', '));
      values = await callOpenAI();
    } else {
      console.log('No API key. Writing a sample values.json for you to fill out.');
      const sample = {};
      placeholders.forEach(k=> sample[k]="<write content for "+k+">");
      const samplePath = outputPath.replace(/\.md$/,'') + '.values.json';
      fs.mkdirSync(path.dirname(samplePath), { recursive:true });
      fs.writeFileSync(samplePath, JSON.stringify(sample, null, 2), 'utf8');
      console.log('Sample JSON written to', samplePath);
      process.exit(0);
    }
    let out = template;
    placeholders.forEach(key=>{
      const val = values[key] || '';
      out = out.replace(new RegExp('{{\\s*'+key+'\\s*}}','g'), val);
    });
    const unresolved = out.match(/\{\{\s*[^}]+\s*\}\}/g);
    if (unresolved && unresolved.length) {
      throw new Error('Template validation failed: unresolved placeholders remain: ' + unresolved.slice(0, 5).join(', '));
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive:true });
    fs.writeFileSync(outputPath, out, 'utf8');
    console.log('Generated document written to', outputPath);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
