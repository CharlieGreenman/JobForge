#!/usr/bin/env node
/**
 * verify-pipeline.mjs — Health check for job-forge pipeline integrity
 *
 * Checks:
 * 1. All statuses are canonical (from templates/states.yml when present, else built-in list)
 * 2. No duplicate company+role entries
 * 3. All report links point to existing files
 * 4. Scores match format X.XX/5 or N/A or DUP
 * 5. All rows have proper pipe-delimited format
 * 6. No pending TSVs in tracker-additions/ (only in merged/ or archived/)
 * 7. No markdown bold in score column
 * 8. Drift warning if states.yml ids differ from the built-in fallback list
 *
 * Run: node job-forge/verify-pipeline.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const PROJECT_DIR = new URL('.', import.meta.url).pathname;
// Support both layouts: data/applications.md (boilerplate) and applications.md (original)
const APPS_FILE = existsSync(join(PROJECT_DIR, 'data/applications.md'))
  ? join(PROJECT_DIR, 'data/applications.md')
  : join(PROJECT_DIR, 'applications.md');
const ADDITIONS_DIR = join(PROJECT_DIR, 'batch/tracker-additions');
const STATES_FILE = existsSync(join(PROJECT_DIR, 'templates/states.yml'))
  ? join(PROJECT_DIR, 'templates/states.yml')
  : join(PROJECT_DIR, 'states.yml');

const appsDisplay = relative(PROJECT_DIR, APPS_FILE).replace(/\\/g, '/');

const CANONICAL_STATUSES = [
  'evaluated', 'applied', 'contacted', 'responded', 'interview',
  'offer', 'rejected', 'discarded', 'skip',
];

const ALIASES = {
  'sent': 'applied',
};

/**
 * Parse templates/states.yml enough to read state ids and alias → id (no YAML dependency).
 * Returns null if the file is missing or no ids were found.
 */
function loadStatesFromYaml(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, 'utf-8');
  const ids = new Set();
  const aliasToId = new Map();
  let currentId = null;
  for (const line of text.split('\n')) {
    const idLine = line.match(/^\s+- id:\s*(\S+)/);
    if (idLine) {
      currentId = idLine[1].toLowerCase();
      ids.add(currentId);
      continue;
    }
    const aliasLine = line.match(/^\s+aliases:\s*\[(.*)\]\s*$/);
    if (aliasLine && currentId) {
      const inner = aliasLine[1].trim();
      if (inner) {
        for (let raw of inner.split(',')) {
          raw = raw.trim().replace(/^['"]|['"]$/g, '');
          if (raw) aliasToId.set(raw.toLowerCase(), currentId);
        }
      }
    }
  }
  if (ids.size === 0) return null;
  return { ids, aliasToId };
}

const statesMeta = loadStatesFromYaml(STATES_FILE);

function statusIsAllowed(statusOnlyLower) {
  if (statesMeta) {
    if (statesMeta.ids.has(statusOnlyLower)) return true;
    if (statesMeta.aliasToId.has(statusOnlyLower)) return true;
    return false;
  }
  return CANONICAL_STATUSES.includes(statusOnlyLower) || Boolean(ALIASES[statusOnlyLower]);
}

let errors = 0;
let warnings = 0;

function error(msg) { console.log(`❌ ${msg}`); errors++; }
function warn(msg) { console.log(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`✅ ${msg}`); }

/** Check 8: drift between states.yml and built-in fallback (warnings only). */
function verifyStatesYamlDrift() {
  let stateDrift = 0;
  if (statesMeta) {
    const builtin = new Set(CANONICAL_STATUSES);
    for (const id of statesMeta.ids) {
      if (!builtin.has(id)) {
        warn(`states.yml defines id "${id}" not in verify built-in list — extend CANONICAL_STATUSES if intentional`);
        stateDrift++;
      }
    }
    for (const id of builtin) {
      if (!statesMeta.ids.has(id)) {
        warn(`Built-in status "${id}" missing from ${STATES_FILE} — files may be out of sync`);
        stateDrift++;
      }
    }
    if (stateDrift === 0) ok('states.yml ids match verify built-in fallback list');
  } else if (existsSync(STATES_FILE)) {
    warn(`Could not parse state ids from ${STATES_FILE} — using built-in status list only`);
  }
}

function printPipelineSummaryAndExit() {
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Pipeline Health: ${errors} errors, ${warnings} warnings`);
  if (errors === 0 && warnings === 0) {
    console.log('🟢 Pipeline is clean!');
  } else if (errors === 0) {
    console.log('🟡 Pipeline OK with warnings');
  } else {
    console.log('🔴 Pipeline has errors — fix before proceeding');
  }
  process.exit(errors > 0 ? 1 : 0);
}

// --- Read applications.md ---
if (!existsSync(APPS_FILE)) {
  console.log('\n📊 No tracker file yet (expected data/applications.md or applications.md).');
  console.log('   This is normal for a fresh setup; it is created when you evaluate your first offer.\n');
  verifyStatesYamlDrift();
  printPipelineSummaryAndExit();
}
const content = readFileSync(APPS_FILE, 'utf-8');
const lines = content.split('\n');

const entries = [];
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  const parts = line.split('|').map(s => s.trim());
  if (parts.length < 9) continue;
  const num = parseInt(parts[1]);
  if (isNaN(num)) continue;
  entries.push({
    num, date: parts[2], company: parts[3], role: parts[4],
    score: parts[5], status: parts[6], pdf: parts[7], report: parts[8],
    notes: parts[9] || '',
  });
}

console.log(`\n📊 Checking ${entries.length} entries in ${appsDisplay}\n`);

// --- Check 1: Canonical statuses ---
let badStatuses = 0;
for (const e of entries) {
  const clean = e.status.replace(/\*\*/g, '').trim().toLowerCase();
  // Strip trailing dates
  const statusOnly = clean.replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();

  if (!statusIsAllowed(statusOnly)) {
    error(`#${e.num}: Non-canonical status "${e.status}"`);
    badStatuses++;
  }

  // Check for markdown bold in status
  if (e.status.includes('**')) {
    error(`#${e.num}: Status contains markdown bold: "${e.status}"`);
    badStatuses++;
  }

  // Check for dates in status
  if (/\d{4}-\d{2}-\d{2}/.test(e.status)) {
    error(`#${e.num}: Status contains date: "${e.status}" — dates go in date column`);
    badStatuses++;
  }
}
if (badStatuses === 0) ok('All statuses are canonical');

// --- Check 2: Duplicates ---
const companyRoleMap = new Map();
let dupes = 0;
for (const e of entries) {
  const key = e.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '::' +
    e.role.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (!companyRoleMap.has(key)) companyRoleMap.set(key, []);
  companyRoleMap.get(key).push(e);
}
for (const [key, group] of companyRoleMap) {
  if (group.length > 1) {
    warn(`Possible duplicates: ${group.map(e => `#${e.num}`).join(', ')} (${group[0].company} — ${group[0].role})`);
    dupes++;
  }
}
if (dupes === 0) ok('No exact duplicates found');

// --- Check 3: Report links ---
let brokenReports = 0;
for (const e of entries) {
  const match = e.report.match(/\]\(([^)]+)\)/);
  if (!match) continue;
  const reportPath = join(PROJECT_DIR, match[1]);
  if (!existsSync(reportPath)) {
    error(`#${e.num}: Report not found: ${match[1]}`);
    brokenReports++;
  }
}
if (brokenReports === 0) ok('All report links valid');

// --- Check 4: Score format ---
let badScores = 0;
for (const e of entries) {
  const s = e.score.replace(/\*\*/g, '').trim();
  if (!/^\d+\.?\d*\/5$/.test(s) && s !== 'N/A' && s !== 'DUP') {
    error(`#${e.num}: Invalid score format: "${e.score}"`);
    badScores++;
  }
}
if (badScores === 0) ok('All scores valid');

// --- Check 5: Row format ---
let badRows = 0;
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  if (line.includes('---') || line.includes('Company')) continue;
  const parts = line.split('|');
  if (parts.length < 9) {
    error(`Row with <9 columns: ${line.substring(0, 80)}...`);
    badRows++;
  }
}
if (badRows === 0) ok('All rows properly formatted');

// --- Check 6: Pending TSVs ---
let pendingTsvs = 0;
if (existsSync(ADDITIONS_DIR)) {
  const files = readdirSync(ADDITIONS_DIR).filter(f => f.endsWith('.tsv'));
  pendingTsvs = files.length;
  if (pendingTsvs > 0) {
    warn(`${pendingTsvs} pending TSVs in tracker-additions/ (not merged)`);
  }
}
if (pendingTsvs === 0) ok('No pending TSVs');

// --- Check 7: Bold in scores ---
let boldScores = 0;
for (const e of entries) {
  if (e.score.includes('**')) {
    warn(`#${e.num}: Score has markdown bold: "${e.score}"`);
    boldScores++;
  }
}
if (boldScores === 0) ok('No bold in scores');

verifyStatesYamlDrift();
printPipelineSummaryAndExit();
