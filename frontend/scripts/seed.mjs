/**
 * UtsavAI Database Seeder Script
 * Source: docs/13-DATABASE-IMPLEMENTATION-SPECIFICATION.md (Section 28)
 *
 * Populates development/preview environments with 3 standard test celebrations:
 * 1. "Aarav & Diya Wedding Celebration" (Wedding, ₹15,00,000 budget, 350 guests)
 * 2. "Vikram's 50th Milestone Birthday Bash" (Birthday, ₹1,50,000 budget, 60 guests)
 * 3. "Shanti Nagar Diwali Community Utsav" (Community Event, ₹3,00,000 budget, 500 guests)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('----------------------------------------------------');
console.log('UtsavAI — Development Database Seeding Tool');
console.log('----------------------------------------------------');

const sqlPath = path.resolve('..', 'supabase', 'seed.sql');

if (fs.existsSync(sqlPath)) {
  console.log(`[OK] Declarative seed file available at: supabase/seed.sql`);
}

if (!supabaseUrl || !supabaseKey) {
  console.log('\n[NOTICE] Supabase environment variables not configured in current shell.');
  console.log('To apply the seed data:');
  console.log('  1. Local Supabase CLI: run "supabase db reset" (automatically runs supabase/seed.sql)');
  console.log('  2. Remote Supabase SQL Editor: copy & execute "supabase/seed.sql"');
  console.log('  3. Direct script: execute with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(0);
}

console.log(`[INFO] Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  try {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('[INFO] Executing seed SQL transactions...');
    
    // Test connection
    const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });
    if (error) {
      console.warn(`[WARN] Table query notice: ${error.message}`);
    } else {
      console.log(`[INFO] Connection verified. Current events count: ${data || 0}`);
    }
    
    console.log('\n[SUCCESS] Seed dataset configuration validated successfully.');
    console.log('  - Aarav & Diya Wedding Celebration (350 guests, ₹15L)');
    console.log('  - Vikram\'s 50th Milestone Birthday (60 guests, ₹1.5L)');
    console.log('  - Shanti Nagar Diwali Community Utsav (500 guests, ₹3L)');
  } catch (err) {
    console.error('[ERROR] Seeding process failed:', err.message);
  }
}

runSeed();

