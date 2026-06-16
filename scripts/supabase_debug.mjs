import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function readEnv(envPath) {
  const txt = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const val = trimmed.slice(idx + 1);
    out[key] = val;
  }
  return out;
}

async function main() {
  const repoRoot = process.cwd();
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found at', envPath);
    process.exit(1);
  }

  const env = readEnv(envPath);
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Supabase URL or ANON key missing in .env');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log('Querying files table...');
  const { data, error } = await supabase.from('files').select('id, filename, path, url, owner').limit(200);
  if (error) {
    console.error('Error querying files table:', error);
    process.exit(1);
  }

  console.log(`Rows returned: ${data.length}`);

  // summarize path patterns
  const nullPath = data.filter(r => !r.path).length;
  const withPath = data.filter(r => r.path).length;
  console.log('rows with null/empty path:', nullPath);
  console.log('rows with path:', withPath);

  const sample = data.slice(0, 20);
  console.log('Sample rows (first 20):');
  console.log(JSON.stringify(sample, null, 2));

  // show distinct top-level prefixes
  const prefixes = {};
  for (const r of data) {
    const p = r.path || r.filename || '';
    const normalized = p.replace(/\\+/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    const top = parts[0] || '';
    prefixes[top] = (prefixes[top] || 0) + 1;
  }
  console.log('Top-level prefixes with counts (first 50):');
  console.log(JSON.stringify(Object.entries(prefixes).slice(0,50), null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
