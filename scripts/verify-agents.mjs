#!/usr/bin/env node
/**
 * Verifies BibleFI "sub-agent" infrastructure is wired correctly:
 * - Edge functions using `withAgentSandbox` declare an `agentName`
 * - Those `agentName`s are registered in `agent_ops.agent_permissions` migrations
 * - Edge functions using `withAgentSandbox` also enforce `requireAgentAuth`
 *
 * Run: `node scripts/verify-agents.mjs`
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = process.cwd();
const FUNCTIONS_DIR = path.join(REPO_ROOT, 'supabase', 'functions');
const MIGRATIONS_DIR = path.join(REPO_ROOT, 'supabase', 'migrations');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listEdgeFunctionIndexFiles() {
  const entries = await fs.readdir(FUNCTIONS_DIR, { withFileTypes: true });
  const functionDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const indexFiles = [];

  for (const dirName of functionDirs) {
    const indexPath = path.join(FUNCTIONS_DIR, dirName, 'index.ts');
    if (await fileExists(indexPath)) indexFiles.push({ dirName, indexPath });
  }

  return indexFiles;
}

function extractSandboxAgentNames(sourceText) {
  if (!sourceText.includes('withAgentSandbox')) return [];

  const agentNames = new Set();
  const callBlocks = sourceText.split('withAgentSandbox').slice(1);

  for (const block of callBlocks) {
    // Grab a small window after the symbol to keep regex work bounded
    const window = block.slice(0, 600);
    const match = window.match(/agentName\s*:\s*['"]([^'"]+)['"]/);
    if (match?.[1]) agentNames.add(match[1]);
  }

  return [...agentNames];
}

function extractAgentNamesFromMigrations(sqlText) {
  const names = new Set();
  if (!sqlText.includes('agent_ops.agent_permissions')) return names;

  // Capture agent names in insert VALUE tuples: ('agent-name', ARRAY[...]
  const tupleRe = /\(\s*'([a-z0-9_-]+)'\s*,\s*ARRAY\s*\[/gi;
  for (const match of sqlText.matchAll(tupleRe)) {
    if (match[1]) names.add(match[1]);
  }

  return names;
}

async function listMigrationFiles() {
  const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.sql'))
    .map((e) => path.join(MIGRATIONS_DIR, e.name));
}

function printSection(title, lines) {
  process.stdout.write(`\n${title}\n`);
  for (const line of lines) process.stdout.write(`- ${line}\n`);
}

async function main() {
  const indexFiles = await listEdgeFunctionIndexFiles();

  const sandboxedAgents = new Map(); // agentName -> { dirName, indexPath }
  const sandboxedFilesMissingAuth = [];
  const sandboxedFilesMissingAgentName = [];

  for (const { dirName, indexPath } of indexFiles) {
    const source = await fs.readFile(indexPath, 'utf8');
    const usesSandbox = source.includes('withAgentSandbox');
    if (!usesSandbox) continue;

    const agentNames = extractSandboxAgentNames(source);
    if (agentNames.length === 0) {
      sandboxedFilesMissingAgentName.push(`${dirName} (${path.relative(REPO_ROOT, indexPath)})`);
      continue;
    }

    for (const agentName of agentNames) {
      sandboxedAgents.set(agentName, { dirName, indexPath });
    }

    if (!source.includes('requireAgentAuth')) {
      sandboxedFilesMissingAuth.push(`${dirName} (${path.relative(REPO_ROOT, indexPath)})`);
    }
  }

  const migrationFiles = await listMigrationFiles();
  const registered = new Set();
  for (const filePath of migrationFiles) {
    const sql = await fs.readFile(filePath, 'utf8');
    for (const name of extractAgentNamesFromMigrations(sql)) registered.add(name);
  }

  const sandboxedAgentNames = [...sandboxedAgents.keys()].sort();
  const missingRegistrations = sandboxedAgentNames.filter((n) => !registered.has(n));

  if (sandboxedAgentNames.length === 0) {
    printSection('No sandboxed agents detected', [
      `Expected at least one Edge Function to use withAgentSandbox in ${path.relative(REPO_ROOT, FUNCTIONS_DIR)}`,
    ]);
    process.exitCode = 1;
    return;
  }

  printSection('Sandboxed agents (from code)', sandboxedAgentNames);

  if (missingRegistrations.length > 0) {
    printSection('Missing agent_ops registration (migrations)', missingRegistrations);
  }

  if (sandboxedFilesMissingAgentName.length > 0) {
    printSection('Sandboxed functions missing agentName', sandboxedFilesMissingAgentName);
  }

  if (sandboxedFilesMissingAuth.length > 0) {
    printSection('Sandboxed functions missing requireAgentAuth', sandboxedFilesMissingAuth);
  }

  if (missingRegistrations.length > 0 || sandboxedFilesMissingAgentName.length > 0) {
    process.exitCode = 1;
  }

  if (sandboxedFilesMissingAuth.length > 0) {
    // Auth can be legitimately different in rare cases, but default to failing fast.
    process.exitCode = 1;
  }
}

await main();

