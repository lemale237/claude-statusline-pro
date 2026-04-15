const { CODES, ansi } = require('./colors');

function bar(pct, cfg) {
  const width = cfg.bar.width;
  const filled = Math.min(width, Math.round(pct * width / 100));
  const empty = width - filled;
  let colorName = cfg.colors.normal;
  if (pct >= cfg.thresholds.critical) colorName = cfg.colors.critical;
  else if (pct >= cfg.thresholds.warning) colorName = cfg.colors.warning;
  return (
    ansi(colorName) +
    cfg.bar.fillChar.repeat(filled) +
    ansi(cfg.bar.emptyColor) +
    cfg.bar.emptyChar.repeat(empty) +
    CODES.reset
  );
}

function formatTokens(n, format) {
  if (format === 'full') return n.toLocaleString('en-US');
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function formatCountdown(resetAt, format) {
  if (!resetAt) return null;
  const diff = Math.max(0, resetAt - Math.floor(Date.now() / 1000));
  if (diff === 0) return '0m';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (format === 'hms') {
    if (days > 0) return `${days}d${hours}h${minutes}m`;
    if (hours > 0) return `${hours}h${minutes}m`;
    return `${minutes}m`;
  }
  if (format === 'short') {
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function icon(key, cfg) {
  if (!cfg.iconsEnabled) return '';
  const i = cfg.icons[key];
  return i ? `${i} ` : '';
}

function renderers(cfg, data) {
  const { BOLD, DIM, RESET } = { BOLD: CODES.bold, DIM: CODES.dim, RESET: CODES.reset };

  return {
    model: () =>
      `${ansi(cfg.colors.model)}${BOLD}${icon('model', cfg)}${data.model}${RESET}`,

    context: () =>
      `${icon('context', cfg)}${bar(data.ctxPct, cfg)} ${BOLD}${data.ctxPct}%${RESET}`,

    usage5h: () => {
      if (!data.has5h) return null;
      const cd = formatCountdown(data.reset5h, cfg.countdownFormat);
      const tail = cd ? ` ${cfg.icons.resetArrow || ''}${cd}` : ' 5h';
      return `${icon('usage5h', cfg)}${bar(data.usage5h, cfg)} ${BOLD}${data.usage5h}%${RESET}${DIM}${tail}${RESET}`;
    },

    usage7d: () => {
      if (!data.has7d) return null;
      const cd = formatCountdown(data.reset7d, cfg.countdownFormat);
      const tail = cd ? ` ${cfg.icons.resetArrow || ''}${cd}` : ' 7d';
      return `${icon('usage7d', cfg)}${bar(data.usage7d, cfg)} ${BOLD}${data.usage7d}%${RESET}${DIM}${tail}${RESET}`;
    },

    directory: () =>
      data.dir ? `${ansi(cfg.colors.directory)}${icon('directory', cfg)}${data.dir}${RESET}` : null,

    gitBranch: () =>
      data.branch ? `${ansi(cfg.colors.gitBranch)}${icon('gitBranch', cfg)}${data.branch}${RESET}` : null,

    agents: () =>
      `${ansi(cfg.colors.agents)}${icon('agents', cfg)}${data.counts.agents}${RESET}${DIM} agents${RESET}`,

    tools: () =>
      `${ansi(cfg.colors.tools)}${icon('tools', cfg)}${data.counts.tools}${DIM}/${RESET}${ansi(cfg.colors.tools)}${data.allToolsCount}${RESET}${DIM} tools${RESET}`,

    files: () =>
      `${ansi(cfg.colors.files)}${icon('files', cfg)}${data.counts.files}${RESET}${DIM} files${RESET}`,

    mcps: () =>
      `${ansi(cfg.colors.mcps)}${icon('mcps', cfg)}${data.mcpCount}${RESET}${DIM} MCPs${RESET}`,

    successRate: () => {
      let color = cfg.colors.successGood;
      if (data.successRate < 80) color = cfg.colors.successBad;
      else if (data.successRate < 95) color = cfg.colors.successMid;
      return `${ansi(color)}${icon('successRate', cfg)}${data.successRate}%${RESET}${DIM} ok${RESET}`;
    },

    cache: () =>
      `${ansi(cfg.colors.cache)}${icon('cache', cfg)}${formatTokens(data.counts.cacheReads, cfg.tokenFormat)}${RESET}${DIM} cache${RESET}`,
  };
}

function renderLine(sectionKeys, cfg, data) {
  const r = renderers(cfg, data);
  const sep = `${CODES.dim}${cfg.separator}${CODES.reset}`;
  const parts = [];
  for (const key of sectionKeys) {
    if (cfg.show[key] === false) continue;
    const fn = r[key];
    if (!fn) continue;
    const val = fn();
    if (val) parts.push(val);
  }
  return parts.length > 0 ? parts.join(sep) : null;
}

module.exports = { renderLine, formatTokens, formatCountdown };
