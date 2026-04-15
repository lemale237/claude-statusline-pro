const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULTS = {
  // Which sections to display
  show: {
    model: true,
    context: true,
    usage5h: true,
    usage7d: true,
    directory: true,
    gitBranch: true,
    agents: true,
    tools: true,
    files: true,
    mcps: true,
    successRate: true,
    cache: true,
  },

  // Colors for progress bars based on thresholds
  thresholds: {
    warning: 60,    // Yellow above this %
    critical: 85,   // Red above this %
  },

  // Available colors: red, green, yellow, blue, magenta, cyan, gray, white
  colors: {
    normal: 'green',
    warning: 'yellow',
    critical: 'red',
    model: 'cyan',
    directory: 'magenta',
    gitBranch: 'green',
    agents: 'blue',
    tools: 'yellow',
    files: 'cyan',
    mcps: 'green',
    cache: 'magenta',
    successGood: 'green',
    successMid: 'yellow',
    successBad: 'red',
  },

  // Progress bar appearance
  bar: {
    width: 10,
    fillChar: '█',
    emptyChar: '░',
    emptyColor: 'gray',
  },

  // Icons (set to "" to disable individual icons; set iconsEnabled: false to disable all)
  iconsEnabled: true,
  icons: {
    model: '🧠',
    context: '📊',
    usage5h: '⏱ ',
    usage7d: '📅',
    directory: '📁',
    gitBranch: '🌿',
    agents: '🤖',
    tools: '🔧',
    files: '📝',
    mcps: '🔌',
    successRate: '✅',
    cache: '💾',
    resetArrow: '↻',
  },

  // Separator between sections
  separator: ' • ',

  // Show elapsed/remaining time format: "full" (2d 4h), "short" (2d), "hms" (2d4h0m)
  countdownFormat: 'full',

  // Label before the countdown value (e.g. "reset in ", "↻", "→ ")
  resetLabel: 'reset in ',

  // Responsive behavior: hide sections progressively when terminal is too narrow
  responsive: {
    enabled: true,
    // Priority order (sections listed LATER are hidden FIRST when narrow)
    priority: [
      'model', 'context', 'usage5h', 'usage7d', 'directory', 'gitBranch',
      'agents', 'tools', 'files', 'mcps', 'successRate', 'cache',
    ],
    // Manual override: maxWidth in columns. 0 = auto-detect, -1 = no responsive
    maxWidth: 0,
  },

  // Number formatting: "short" (1.2k), "full" (1,200)
  tokenFormat: 'short',

  // Scope: "project" = aggregate current project only, "global" = all projects
  statsScope: 'project',

  // Section order (sections not listed are hidden regardless of `show`)
  line1: ['model', 'context', 'usage5h', 'usage7d', 'directory', 'gitBranch'],
  line2: ['agents', 'tools', 'files', 'mcps', 'successRate', 'cache'],
};

function deepMerge(target, source) {
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] ? { ...target[key] } : {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function loadConfig() {
  const configPaths = [
    process.env.CLAUDE_STATUSLINE_CONFIG,
    path.join(os.homedir(), '.claude', 'statusline-pro.json'),
    path.join(os.homedir(), '.config', 'claude-statusline-pro', 'config.json'),
  ].filter(Boolean);

  let user = {};
  for (const p of configPaths) {
    try {
      if (fs.existsSync(p)) {
        user = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      }
    } catch {}
  }

  return deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), user);
}

module.exports = { DEFAULTS, loadConfig, deepMerge };
