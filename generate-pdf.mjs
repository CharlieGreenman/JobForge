#!/usr/bin/env node

/**
 * generate-pdf.mjs — HTML → PDF via Playwright
 *
 * Usage:
 *   node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]
 *   npm run pdf -- <input.html> <output.pdf> [--format=letter|a4]
 *   node generate-pdf.mjs --help
 *
 * Requires: the `playwright` package (see repo `package.json`; run `npx playwright install chromium`).
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */

import { resolve, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const argvEarly = process.argv.slice(2);
if (argvEarly.includes('--help') || argvEarly.includes('-h')) {
  console.log(`generate-pdf.mjs — HTML → PDF via Playwright (Chromium)

Renders an HTML file to a print-style PDF (default paper size A4; optional Letter).

Usage:
  node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]
  npm run pdf -- <input.html> <output.pdf> [--format=letter|a4]

Requires: the playwright package (see package.json) and a local browser build,
  e.g. npx playwright install chromium

Self-hosted fonts: when repo-root fonts/ exists, ./fonts/ URLs in the HTML are
rewritten to absolute file:// paths. If fonts/ is missing, URLs are left unchanged.

Run from the repository root or any cwd; paths may be relative or absolute.
Creates the output directory (e.g. output/) when it does not exist yet.`);
  process.exit(0);
}

async function generatePDF() {
  const args = process.argv.slice(2);

  // Parse arguments
  let inputPath, outputPath, format = 'a4';

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      format = arg.split('=')[1].toLowerCase();
    } else if (!inputPath) {
      inputPath = arg;
    } else if (!outputPath) {
      outputPath = arg;
    }
  }

  if (!inputPath || !outputPath) {
    console.error('Usage: node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4]');
    process.exit(1);
  }

  inputPath = resolve(inputPath);
  outputPath = resolve(outputPath);

  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Validate format before creating output directories
  const validFormats = ['a4', 'letter'];
  if (!validFormats.includes(format)) {
    console.error(`Invalid format "${format}". Use: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }

  console.log(`📄 Input:  ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📏 Format: ${format.toUpperCase()}`);

  // Read HTML to inject font paths as absolute file:// URLs
  let html = await readFile(inputPath, 'utf-8');

  // Resolve font paths relative to repo-root fonts/ (skip if directory missing)
  const fontsDir = resolve(__dirname, 'fonts');
  if (existsSync(fontsDir)) {
    html = html.replace(
      /url\(['"]?\.\/fonts\//g,
      `url('file://${fontsDir}/`
    );
    // Close any unclosed quotes from the replacement
    html = html.replace(
      /file:\/\/([^'")]+)\.woff2['"]\)/g,
      `file://$1.woff2')`
    );
  } else {
    console.warn(
      `⚠️  fonts/ not found at ${fontsDir} — leaving @font-face URLs unchanged`
    );
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (e) {
    if (e?.code === 'ERR_MODULE_NOT_FOUND') {
      console.error(
        'Missing dependency: run npm install in the repo root, then npx playwright install chromium'
      );
      process.exit(1);
    }
    throw e;
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set content with file base URL for any relative resources
  await page.setContent(html, {
    waitUntil: 'networkidle',
    baseURL: `file://${dirname(inputPath)}/`,
  });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: format,
    printBackground: true,
    margin: {
      top: '0.6in',
      right: '0.6in',
      bottom: '0.6in',
      left: '0.6in',
    },
    preferCSSPageSize: false,
  });

  // Write PDF
  const { writeFile } = await import('fs/promises');
  await writeFile(outputPath, pdfBuffer);

  // Count pages (approximate from PDF structure)
  const pdfString = pdfBuffer.toString('latin1');
  const pageCount = (pdfString.match(/\/Type\s*\/Page[^s]/g) || []).length;

  await browser.close();

  console.log(`✅ PDF generated: ${outputPath}`);
  console.log(`📊 Pages: ${pageCount}`);
  console.log(`📦 Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  return { outputPath, pageCount, size: pdfBuffer.length };
}

generatePDF().catch((err) => {
  console.error('❌ PDF generation failed:', err.message);
  process.exit(1);
});
