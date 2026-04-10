#!/usr/bin/env node

/**
 * verify-greenhouse-urls.mjs
 * Reads portals.example.yml, extracts Greenhouse API URLs, Ashby URLs, and Lever URLs,
 * then verifies each with a HEAD/GET request.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const YAML_PATH = resolve(__dirname, '..', 'templates', 'portals.example.yml');

const TIMEOUT_MS = 5000;
const DELAY_MS = 200;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Parse the YAML file line-by-line to extract company entries with their URLs.
 * We avoid pulling in a YAML library by doing simple regex extraction.
 */
function parseEntries(content) {
  const lines = content.split('\n');
  const greenhouse = [];
  const ashby = [];
  const lever = [];

  let currentName = null;

  for (const line of lines) {
    // Match "- name: Something"
    const nameMatch = line.match(/^\s*-\s*name:\s*(.+)/);
    if (nameMatch) {
      currentName = nameMatch[1].trim();
    }

    // Greenhouse API URLs
    const apiMatch = line.match(/^\s*api:\s*(https:\/\/boards-api\.greenhouse\.io\S+)/);
    if (apiMatch && currentName) {
      greenhouse.push({ name: currentName, url: apiMatch[1] });
    }

    // Ashby careers URLs
    const ashbyMatch = line.match(/^\s*careers_url:\s*(https:\/\/jobs\.ashbyhq\.com\/\S+)/);
    if (ashbyMatch && currentName) {
      ashby.push({ name: currentName, url: ashbyMatch[1] });
    }

    // Lever careers URLs
    const leverMatch = line.match(/^\s*careers_url:\s*(https:\/\/jobs\.lever\.co\/\S+)/);
    if (leverMatch && currentName) {
      lever.push({ name: currentName, url: leverMatch[1] });
    }
  }

  return { greenhouse, ashby, lever };
}

async function checkUrl(entry) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(entry.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'JobForge-URLVerifier/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    return {
      ...entry,
      status: res.status,
      pass: res.status >= 200 && res.status < 400,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      ...entry,
      status: err.name === 'AbortError' ? 'TIMEOUT' : `ERR: ${err.code || err.message}`,
      pass: false,
    };
  }
}

function printTable(title, results) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`  ${title} (${results.length} URLs)`);
  console.log('='.repeat(100));

  const nameW = 30;
  const urlW = 55;
  const statusW = 10;

  console.log(
    'Company'.padEnd(nameW) +
    'URL'.padEnd(urlW) +
    'Status'.padEnd(statusW) +
    'Result'
  );
  console.log('-'.repeat(100));

  let failCount = 0;
  for (const r of results) {
    const result = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) failCount++;
    const shortUrl = r.url.length > urlW - 2 ? r.url.slice(0, urlW - 5) + '...' : r.url;
    console.log(
      r.name.slice(0, nameW - 1).padEnd(nameW) +
      shortUrl.padEnd(urlW) +
      String(r.status).padEnd(statusW) +
      result
    );
  }

  console.log('-'.repeat(100));
  console.log(`Total: ${results.length} | Passed: ${results.length - failCount} | Failed: ${failCount}`);

  if (failCount > 0) {
    console.log(`\nFailed URLs:`);
    for (const r of results.filter(r => !r.pass)) {
      console.log(`  - ${r.name}: ${r.url} (${r.status})`);
    }
  }
}

async function main() {
  const content = readFileSync(YAML_PATH, 'utf-8');
  const { greenhouse, ashby, lever } = parseEntries(content);

  // Deduplicate by URL
  const dedup = (arr) => {
    const seen = new Set();
    return arr.filter(e => {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
      return true;
    });
  };

  const ghUnique = dedup(greenhouse);
  const ashbyUnique = dedup(ashby);
  const leverUnique = dedup(lever);

  console.log(`Found: ${ghUnique.length} Greenhouse APIs, ${ashbyUnique.length} Ashby URLs, ${leverUnique.length} Lever URLs`);

  // --- Greenhouse (all) ---
  console.log(`\nVerifying all ${ghUnique.length} Greenhouse API URLs...`);
  const ghResults = [];
  for (const entry of ghUnique) {
    ghResults.push(await checkUrl(entry));
    await sleep(DELAY_MS);
  }
  printTable('Greenhouse API URLs', ghResults);

  // --- Ashby (sample of 20) ---
  const ashbySample = ashbyUnique.slice(0, 20);
  console.log(`\nVerifying ${ashbySample.length} Ashby URLs (sample)...`);
  const ashbyResults = [];
  for (const entry of ashbySample) {
    ashbyResults.push(await checkUrl(entry));
    await sleep(DELAY_MS);
  }
  printTable('Ashby URLs (sample of 20)', ashbyResults);

  // --- Lever (sample of 10) ---
  const leverSample = leverUnique.slice(0, 10);
  console.log(`\nVerifying ${leverSample.length} Lever URLs (sample)...`);
  const leverResults = [];
  for (const entry of leverSample) {
    leverResults.push(await checkUrl(entry));
    await sleep(DELAY_MS);
  }
  printTable('Lever URLs (sample of 10)', leverResults);

  // --- Summary ---
  const allResults = [...ghResults, ...ashbyResults, ...leverResults];
  const allFails = allResults.filter(r => !r.pass);
  console.log(`\n${'='.repeat(100)}`);
  console.log(`OVERALL SUMMARY: ${allResults.length} checked, ${allResults.length - allFails.length} passed, ${allFails.length} failed`);
  if (allFails.length > 0) {
    console.log('\nAll failures:');
    for (const r of allFails) {
      console.log(`  [${r.status}] ${r.name} -- ${r.url}`);
    }
  }
  console.log('');
}

main();
