import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';
import https from 'https';
import http from 'http';

console.log('====================================================');
console.log('UTSAVAI PRE-DEPLOYMENT VERIFICATION');
console.log('====================================================\n');

// 1. SUPABASE PROJECT CONNECTIVITY
console.log('1. VERIFYING CONFIGURED SUPABASE PROJECT REACHABILITY...');
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseAnonKey = '';
let geminiApiKey = '';
let databaseUrl = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    const val = vals.join('=').trim();
    if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
    if (key.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    if (key.trim() === 'GEMINI_API_KEY') geminiApiKey = val;
    if (key.trim() === 'DATABASE_URL') databaseUrl = val;
  }
}

console.log(`- Configured URL: ${supabaseUrl || '(NOT SET)'}`);

async function checkSupabase() {
  if (!supabaseUrl) {
    console.log('❌ Blocker: NEXT_PUBLIC_SUPABASE_URL is not set.');
    return;
  }

  let host = '';
  try {
    host = new URL(supabaseUrl).host;
  } catch (err) {
    console.log(`❌ Blocker: Invalid Supabase URL format: ${supabaseUrl}`);
    return;
  }

  try {
    console.log(`- Resolving DNS for ${host}...`);
    const addresses = await dns.lookup(host, { all: true });
    console.log(`  ✔ DNS resolved: ${addresses.map(a => a.address).join(', ')}`);
  } catch (dnsErr) {
    console.log(`❌ Blocker: DNS resolution failed for ${host}: ${dnsErr.message}`);
    return;
  }

  // Check HTTP probe with anon key
  console.log(`- Probing health endpoint (${supabaseUrl}/auth/v1/health) with anon key...`);
  const probe = await new Promise((resolve) => {
    const req = https.get(`${supabaseUrl}/auth/v1/health`, {
      timeout: 8000,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Connection timed out (8000ms)' });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
  });

  if (probe.error) {
    console.log(`❌ Blocker: Supabase endpoint unreachable: ${probe.error}`);
  } else {
    console.log(`✔ Supabase health endpoint returned HTTP ${probe.status}: ${probe.body.substring(0, 80)}`);
  }

  // Also probe REST endpoint /rest/v1/events
  console.log(`- Probing PostgREST API endpoint (${supabaseUrl}/rest/v1/events?select=id)...`);
  const restEventsProbe = await new Promise((resolve) => {
    const req = https.get(`${supabaseUrl}/rest/v1/events?select=id&limit=1`, {
      timeout: 8000,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Connection timed out (8000ms)' });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
  });

  // Also probe REST endpoint /rest/v1/profiles
  console.log(`- Probing PostgREST API endpoint (${supabaseUrl}/rest/v1/profiles?select=id)...`);
  const restProfilesProbe = await new Promise((resolve) => {
    const req = https.get(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
      timeout: 8000,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Connection timed out (8000ms)' });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
  });

  if (restProfilesProbe.error) {
    console.log(`❌ Blocker: Supabase REST profiles unreachable: ${restProfilesProbe.error}`);
  } else {
    console.log(`✔ PostgREST profiles query returned HTTP ${restProfilesProbe.status}: ${restProfilesProbe.body.substring(0, 120)}`);
  }
}

await checkSupabase();

// 2. CHECK SQLITE / PRISMA LOCAL DATABASE PATHS
console.log('\n2. CHECKING SQLITE LOCAL DATABASE PATHS & PRODUCTION DB ENGINE...');
console.log(`- Current DATABASE_URL: ${databaseUrl}`);

function checkCodebaseForPrisma() {
  const matches = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git'].includes(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|mjs)$/.test(ent.name)) {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes('prisma') || text.includes('db/custom.db') || text.includes('DATABASE_URL')) {
          matches.push({ file: full, text });
        }
      }
    }
  }
  walk('.');
  return matches;
}

const prismaMatches = checkCodebaseForPrisma();
console.log(`- Files referencing prisma/database in frontend: ${prismaMatches.length}`);
for (const m of prismaMatches) {
  console.log(`  * ${m.file}`);
}

// 3. GOOGLE OAUTH REDIRECT CONFIGURATION
console.log('\n3. VERIFYING GOOGLE OAUTH REDIRECT CONFIGURATION...');
const authClientPath = path.resolve('src/lib/auth.ts');
if (fs.existsSync(authClientPath)) {
  const text = fs.readFileSync(authClientPath, 'utf8');
  const hasGoogle = text.includes('signInWithOAuth') || text.includes('provider: \'google\'') || text.includes('provider: "google"');
  console.log(`- signInWithGoogle implemented: ${hasGoogle}`);
  const matchRedirect = text.match(/redirectTo:\s*([^\n,}]+)/);
  if (matchRedirect) {
    console.log(`- OAuth redirectTo expression: ${matchRedirect[1].trim()}`);
  }
}

const callbackRoutePath = path.resolve('src/app/auth/callback/route.ts');
console.log(`- Callback route (/auth/callback): ${fs.existsSync(callbackRoutePath) ? 'Present' : 'Missing'}`);
if (fs.existsSync(callbackRoutePath)) {
  const text = fs.readFileSync(callbackRoutePath, 'utf8');
  console.log(`- Callback route exchanges code for session: ${text.includes('exchangeCodeForSession')}`);
}

// 4. DATABASE TABLES, RLS POLICIES & MIGRATIONS
console.log('\n4. VERIFYING DATABASE MIGRATIONS & RLS POLICIES...');
const m1 = fs.readFileSync('supabase/migrations/20261030000000_events_table_fix.sql', 'utf8');
const m2 = fs.readFileSync('../supabase/migrations/20261030000000_events_table_fix.sql', 'utf8');
console.log(`- Migration files content in exact sync: ${m1 === m2 ? 'YES (100% Identical)' : 'NO (Diff detected)'}`);

const migrationFiles = [
  'supabase/migrations/20261026000000_initial_schema.sql',
  'supabase/migrations/20261030000000_events_table_fix.sql'
];
for (const mf of migrationFiles) {
  const full = path.resolve(mf);
  if (fs.existsSync(full)) {
    const sql = fs.readFileSync(full, 'utf8');
    const hasProfiles = sql.includes('CREATE TABLE IF NOT EXISTS public.profiles');
    const hasEvents = sql.includes('CREATE TABLE IF NOT EXISTS public.events');
    const hasRLS = sql.includes('ENABLE ROW LEVEL SECURITY');
    const hasSearchPath = sql.includes("SET search_path = ''");
    console.log(`✔ ${mf}:`);
    console.log(`  - profiles table: ${hasProfiles ? 'YES' : 'NO'}`);
    console.log(`  - events table: ${hasEvents ? 'YES' : 'NO'}`);
    console.log(`  - RLS enabled: ${hasRLS ? 'YES' : 'NO'}`);
    console.log(`  - SECURITY DEFINER search_path secure: ${hasSearchPath ? 'YES' : 'NO'}`);
  } else {
    console.log(`- ${mf}: NOT FOUND`);
  }
}

// 5. PRODUCTION ENVIRONMENT VARIABLES DOCUMENTATION
console.log('\n5. VERIFYING ENVIRONMENT VARIABLES & DOCUMENTATION...');
const rootEnvEx = path.resolve('../.env.example');
const feEnvEx = path.resolve('.env.example');
console.log(`- Root .env.example exists: ${fs.existsSync(rootEnvEx)}`);
console.log(`- Frontend .env.example exists: ${fs.existsSync(feEnvEx)}`);

// 6. GEMINI AI CONFIGURATION & FALLBACK BEHAVIOR
console.log('\n6. VERIFYING GEMINI AI CONFIGURATION & FALLBACK...');
const aiFiles = [
  'src/lib/ai/client.ts',
  'src/lib/ai/prompt-builder.ts',
  'src/lib/ai/context-builder.ts',
  'src/app/api/ai/chat/route.ts',
  'src/app/api/ai/generate-plan/route.ts'
];
for (const af of aiFiles) {
  const full = path.resolve(af);
  if (fs.existsSync(full)) {
    const text = fs.readFileSync(full, 'utf8');
    const hasApiKey = text.includes('GEMINI_API_KEY') || text.includes('GOOGLE_API_KEY') || text.includes('isGeminiConfigured');
    const hasFallback = text.includes('generateDeterministicPlan') || text.includes('Deterministic') || text.includes('fallback') || text.includes('Offline');
    console.log(`✔ ${af}:`);
    console.log(`  - Gemini config check present: ${hasApiKey ? 'YES' : 'NO'}`);
    console.log(`  - Deterministic / offline fallback logic: ${hasFallback ? 'YES' : 'NO'}`);
  } else {
    console.log(`- ${af}: NOT FOUND`);
  }
}

console.log('\n====================================================');
console.log('CHECK COMPLETE');
console.log('====================================================');
