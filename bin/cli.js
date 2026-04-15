#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CMD = process.argv[2];
const SCRIPT_PATH = path.resolve(__dirname, '..', 'src', 'statusline.js');
const CONFIG_PATH = path.join(os.homedir(), '.claude', 'statusline-pro.json');
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

function log(msg) { process.stdout.write(msg + '\n'); }
function error(msg) { process.stderr.write('Error: ' + msg + '\n'); }

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function install() {
  const existing = readJson(SETTINGS_PATH) || {};
  existing.statusLine = {
    type: 'command',
    command: `node "${SCRIPT_PATH}"`,
  };
  writeJson(SETTINGS_PATH, existing);
  log('✅ Statusline installed in ' + SETTINGS_PATH);
  log('');
  log('Restart Claude Code to see the statusline.');
  log('');
  log('Customize by editing: ' + CONFIG_PATH);
  log('Run `claude-statusline-pro init` to create a default config file.');
}

function uninstall() {
  const existing = readJson(SETTINGS_PATH);
  if (!existing) {
    log('No settings.json found. Nothing to remove.');
    return;
  }
  delete existing.statusLine;
  writeJson(SETTINGS_PATH, existing);
  log('✅ Statusline removed from ' + SETTINGS_PATH);
}

function init() {
  if (fs.existsSync(CONFIG_PATH)) {
    log('⚠ Config already exists at ' + CONFIG_PATH);
    log('Delete or edit it manually.');
    return;
  }
  const example = {
    show: {
      model: true, context: true, usage5h: true, usage7d: true,
      directory: true, gitBranch: true,
      agents: true, tools: true, files: true, mcps: true, successRate: true, cache: true,
    },
    thresholds: { warning: 60, critical: 85 },
    colors: {
      normal: 'green', warning: 'yellow', critical: 'red',
      model: 'cyan', directory: 'magenta', gitBranch: 'green',
      agents: 'blue', tools: 'yellow', files: 'cyan', mcps: 'green',
      cache: 'magenta',
      successGood: 'green', successMid: 'yellow', successBad: 'red',
    },
    bar: { width: 10, fillChar: '█', emptyChar: '░', emptyColor: 'gray' },
    iconsEnabled: true,
    separator: ' • ',
    countdownFormat: 'full',
    tokenFormat: 'short',
    statsScope: 'project',
    line1: ['model', 'context', 'usage5h', 'usage7d', 'directory', 'gitBranch'],
    line2: ['agents', 'tools', 'files', 'mcps', 'successRate', 'cache'],
  };
  writeJson(CONFIG_PATH, example);
  log('✅ Default config created at ' + CONFIG_PATH);
  log('Edit this file to customize colors, sections, thresholds, etc.');
}

function preview() {
  const sample = {
    model: { display_name: 'Opus 4.6' },
    workspace: { current_dir: process.cwd() },
    context_window: { used_percentage: 37 },
    rate_limits: {
      five_hour: { used_percentage: 23, resets_at: Math.floor(Date.now() / 1000) + 7200 },
      seven_day: { used_percentage: 41, resets_at: Math.floor(Date.now() / 1000) + 190000 },
    },
  };
  const { spawn } = require('child_process');
  const child = spawn(process.execPath, [SCRIPT_PATH], { stdio: ['pipe', 'inherit', 'inherit'] });
  child.stdin.write(JSON.stringify(sample));
  child.stdin.end();
}

function help() {
  log('claude-statusline-pro — Customizable statusline for Claude Code');
  log('');
  log('Usage:');
  log('  claude-statusline-pro install     Install the statusline in ~/.claude/settings.json');
  log('  claude-statusline-pro uninstall   Remove the statusline');
  log('  claude-statusline-pro init        Create default config file');
  log('  claude-statusline-pro preview     Preview with sample data');
  log('  claude-statusline-pro help        Show this help');
  log('');
  log('Config file: ' + CONFIG_PATH);
  log('Docs: https://github.com/lemale237/claude-statusline-pro');
}

switch (CMD) {
  case 'install': install(); break;
  case 'uninstall': uninstall(); break;
  case 'init': init(); break;
  case 'preview': preview(); break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    help(); break;
  default:
    error('Unknown command: ' + CMD);
    help();
    process.exit(1);
}
