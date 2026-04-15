#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const { loadConfig } = require('./config');
const { renderLine } = require('./render');
const { collectStats } = require('./stats');

function gitBranch(cwd) {
  try {
    let d = cwd;
    for (let i = 0; i < 10; i++) {
      const gitDir = path.join(d, '.git');
      if (fs.existsSync(gitDir)) {
        const head = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
        if (head.startsWith('ref: refs/heads/')) return head.slice(16);
        return head.slice(0, 7);
      }
      const parent = path.dirname(d);
      if (parent === d) break;
      d = parent;
    }
  } catch {}
  return null;
}

function countMcps(cwd) {
  const seen = new Set();
  const files = [
    path.join(os.homedir(), '.claude.json'),
    path.join(os.homedir(), '.mcp.json'),
    path.join(cwd, '.mcp.json'),
  ];
  for (const f of files) {
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (j.mcpServers) Object.keys(j.mcpServers).forEach(k => seen.add(k));
    } catch {}
  }
  return seen.size;
}

function loadRateLimits(data, cwd) {
  const cacheDir = path.join(os.homedir(), '.claude', 'statusline-cache');
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch {}
  const cachePath = path.join(cacheDir, 'rate-limits.json');

  const out = {
    usage5h: 0, usage7d: 0,
    has5h: false, has7d: false,
    reset5h: null, reset7d: null,
  };

  const fiveHour = data.rate_limits?.five_hour;
  const sevenDay = data.rate_limits?.seven_day;

  if (fiveHour || sevenDay) {
    if (fiveHour?.used_percentage != null) {
      out.usage5h = Math.round(fiveHour.used_percentage);
      out.has5h = true;
      out.reset5h = fiveHour.resets_at;
    }
    if (sevenDay?.used_percentage != null) {
      out.usage7d = Math.round(sevenDay.used_percentage);
      out.has7d = true;
      out.reset7d = sevenDay.resets_at;
    }
    try {
      fs.writeFileSync(cachePath, JSON.stringify({
        five_hour: fiveHour,
        seven_day: sevenDay,
        savedAt: Date.now(),
      }));
    } catch {}
    return out;
  }

  try {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const now = Date.now() / 1000;
    if (cached.five_hour?.resets_at && cached.five_hour.resets_at > now) {
      out.usage5h = Math.round(cached.five_hour.used_percentage || 0);
      out.reset5h = cached.five_hour.resets_at;
      out.has5h = true;
    }
    if (cached.seven_day?.resets_at && cached.seven_day.resets_at > now) {
      out.usage7d = Math.round(cached.seven_day.used_percentage || 0);
      out.reset7d = cached.seven_day.resets_at;
      out.has7d = true;
    }
  } catch {}
  return out;
}

function main() {
  let input = '';
  process.stdin.on('data', d => { input += d; });
  process.stdin.on('end', () => {
    let data;
    try { data = JSON.parse(input); } catch { data = {}; }

    const cfg = loadConfig();

    const cwd = data.workspace?.current_dir || '';
    const dir = cwd.split(/[/\\]/).filter(Boolean).pop() || '';
    const transcriptPath = data.transcript_path;

    const stats = collectStats({ cwd, transcriptPath, scope: cfg.statsScope });
    const rates = loadRateLimits(data, cwd);

    const successRate = stats.counts.tools > 0
      ? Math.round(((stats.counts.tools - stats.counts.toolErrors) / stats.counts.tools) * 100)
      : 100;

    const viewData = {
      model: data.model?.display_name || 'Claude',
      dir,
      ctxPct: Math.round(data.context_window?.used_percentage || 0),
      branch: gitBranch(cwd),
      counts: stats.counts,
      allToolsCount: stats.allToolsCount,
      mcpCount: countMcps(cwd),
      successRate,
      ...rates,
    };

    const line1 = renderLine(cfg.line1, cfg, viewData);
    const line2 = renderLine(cfg.line2, cfg, viewData);

    const out = [line1, line2].filter(Boolean).join('\n') + '\n';
    process.stdout.write(out);
  });
}

main();
