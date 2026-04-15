const fs = require('fs');
const path = require('path');
const os = require('os');

const MCP_TOOL_REGEX = /mcp__[a-zA-Z0-9_-]+__[a-zA-Z0-9_-]+/g;

function projectKey(cwd) {
  return cwd.replace(/[:\\/]/g, '-');
}

function processTranscript(tp, counts, allToolNames) {
  try {
    const content = fs.readFileSync(tp, 'utf8');
    const matches = content.match(MCP_TOOL_REGEX);
    if (matches) for (const m of matches) allToolNames.add(m);

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }

      const usage = msg.message?.usage;
      if (counts && usage?.cache_read_input_tokens) {
        counts.cacheReads += usage.cache_read_input_tokens;
      }

      const blocks = msg.message?.content;
      if (!Array.isArray(blocks)) continue;

      for (const block of blocks) {
        if (block.type === 'tool_use') {
          if (block.name) allToolNames.add(block.name);
          if (!counts) continue;
          counts.tools++;
          if (block.name === 'Task') counts.agents++;
          else if (
            block.name === 'Edit' ||
            block.name === 'Write' ||
            block.name === 'MultiEdit'
          ) {
            const fp = block.input?.file_path;
            if (fp) counts.files.add(fp);
          }
        } else if (block.type === 'tool_result' && block.is_error && counts) {
          counts.toolErrors++;
        }
      }
    }
  } catch {}
}

function collectStats({ cwd, transcriptPath, scope }) {
  const counts = {
    agents: 0,
    tools: 0,
    toolErrors: 0,
    files: new Set(),
    cacheReads: 0,
  };
  const allToolNames = new Set();

  const projectsRoot = path.join(os.homedir(), '.claude', 'projects');

  const projectDirs = [];
  if (scope === 'global') {
    try {
      for (const p of fs.readdirSync(projectsRoot)) {
        projectDirs.push(path.join(projectsRoot, p));
      }
    } catch {}
  } else {
    projectDirs.push(path.join(projectsRoot, projectKey(cwd)));
  }

  const projectTranscripts = [];
  for (const dir of projectDirs) {
    try {
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith('.jsonl')) projectTranscripts.push(path.join(dir, f));
      }
    } catch {}
  }
  if (projectTranscripts.length === 0 && transcriptPath && fs.existsSync(transcriptPath)) {
    projectTranscripts.push(transcriptPath);
  }

  for (const tp of projectTranscripts) {
    processTranscript(tp, counts, allToolNames);
  }

  // Always scan ALL projects for the global tools catalog (regardless of scope)
  if (scope !== 'global') {
    try {
      for (const p of fs.readdirSync(projectsRoot)) {
        const dir = path.join(projectsRoot, p);
        try {
          for (const f of fs.readdirSync(dir)) {
            if (f.endsWith('.jsonl')) processTranscript(path.join(dir, f), null, allToolNames);
          }
        } catch {}
      }
    } catch {}
  }

  const filesCount = counts.files.size;
  counts.files = filesCount;

  return {
    counts,
    allToolsCount: allToolNames.size,
  };
}

module.exports = { collectStats, projectKey };
