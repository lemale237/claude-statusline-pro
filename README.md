# claude-statusline-pro

> 🎨 Beautiful, customizable statusline for [Claude Code](https://code.claude.com) — progress bars, icons, git, MCP tracking, usage limits, and session stats.

[![npm version](https://img.shields.io/npm/v/claude-statusline-pro.svg?style=flat-square)](https://www.npmjs.com/package/claude-statusline-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Node](https://img.shields.io/node/v/claude-statusline-pro.svg?style=flat-square)](https://nodejs.org)

```
🧠 Opus 4.6 • 📊 ████░░░░░░ 37% • ⏱  ██░░░░░░░░ 23% ↻2h 15m • 📅 ████░░░░░░ 41% ↻2d 4h • 📁 my-project • 🌿 main
🤖 3 agents • 🔧 326/724 tools • 📝 11 files • 🔌 6 MCPs • ✅ 94% ok • 💾 138.5M cache
```

## Features

- 🎨 **Configurable colors** with thresholds (green / yellow / red based on usage)
- 📊 **Progress bars** for context, 5h & 7d usage limits
- ⏳ **Countdown timers** to next reset (no more guessing when weekly resets)
- 🌿 **Git branch** detection (walks up directories)
- 🔧 **Tools tracking** — used in project / unique tools available globally
- 🤖 **Subagent counter** (Task tool invocations)
- 📝 **Unique files edited** (Edit/Write/MultiEdit, dedup)
- 🔌 **Active MCP servers** count
- ✅ **Success rate** of tool calls
- 💾 **Cache read tokens** (see your caching savings)
- 💾 **Persistent stats** — aggregated across all sessions in a project
- 🛰️ **Cached rate limits** — keep showing 5h/7d even after terminal restart
- 🌍 **Cross-platform** — Windows, macOS, Linux (no external deps beyond Node)

## Install

```bash
npx claude-statusline-pro install
```

Then restart Claude Code.

To remove:

```bash
npx claude-statusline-pro uninstall
```

## Commands

```bash
claude-statusline-pro install     # Wire into ~/.claude/settings.json
claude-statusline-pro uninstall   # Remove from ~/.claude/settings.json
claude-statusline-pro init        # Create default config at ~/.claude/statusline-pro.json
claude-statusline-pro preview     # Preview with sample data
claude-statusline-pro help        # Show help
```

## Customize

Run `npx claude-statusline-pro init` to create `~/.claude/statusline-pro.json`.

You can also set `CLAUDE_STATUSLINE_CONFIG=/path/to/your/config.json` to use a custom location.

### All options

```jsonc
{
  // Which sections to show — toggle any off
  "show": {
    "model": true,
    "context": true,
    "usage5h": true,
    "usage7d": true,
    "directory": true,
    "gitBranch": true,
    "agents": true,
    "tools": true,
    "files": true,
    "mcps": true,
    "successRate": true,
    "cache": true
  },

  // Color thresholds (%)
  "thresholds": {
    "warning": 60,   // Yellow above this
    "critical": 85   // Red above this
  },

  // Colors — any of: red, green, yellow, blue, magenta, cyan, gray, white
  "colors": {
    "normal": "green",
    "warning": "yellow",
    "critical": "red",
    "model": "cyan",
    "directory": "magenta",
    "gitBranch": "green",
    "agents": "blue",
    "tools": "yellow",
    "files": "cyan",
    "mcps": "green",
    "cache": "magenta",
    "successGood": "green",
    "successMid": "yellow",
    "successBad": "red"
  },

  // Progress bar style
  "bar": {
    "width": 10,
    "fillChar": "█",
    "emptyChar": "░",
    "emptyColor": "gray"
  },

  // Disable all icons, or customize each one
  "iconsEnabled": true,
  "icons": {
    "model": "🧠",
    "context": "📊",
    "usage5h": "⏱ ",
    "usage7d": "📅",
    "directory": "📁",
    "gitBranch": "🌿",
    "agents": "🤖",
    "tools": "🔧",
    "files": "📝",
    "mcps": "🔌",
    "successRate": "✅",
    "cache": "💾",
    "resetArrow": "↻"
  },

  // Separator between sections
  "separator": " • ",

  // Countdown format: "full" → "2d 4h", "short" → "2d", "hms" → "2d4h0m"
  "countdownFormat": "full",

  // Label shown before the countdown (e.g. "reset in ", "↻", "→ ")
  "resetLabel": "reset in ",

  // Token format: "short" → "1.2k", "full" → "1,200"
  "tokenFormat": "short",

  // Stats aggregation: "project" (current project) or "global" (all projects)
  "statsScope": "project",

  // Responsive: hide sections progressively when terminal is too narrow.
  // Items appearing LATER in `priority` are hidden FIRST.
  // maxWidth: 0 = auto-detect, -1 = disable responsive, >0 = force width
  "responsive": {
    "enabled": true,
    "priority": [
      "model", "context", "usage5h", "usage7d", "directory", "gitBranch",
      "agents", "tools", "files", "mcps", "successRate", "cache"
    ],
    "maxWidth": 0
  },

  // Section order & visibility (sections not listed are hidden)
  "line1": ["model", "context", "usage5h", "usage7d", "directory", "gitBranch"],
  "line2": ["agents", "tools", "files", "mcps", "successRate", "cache"]
}
```

### Example: minimal single line

```json
{
  "show": { "agents": false, "tools": false, "files": false, "mcps": false, "successRate": false, "cache": false },
  "line1": ["model", "context", "usage5h", "usage7d"],
  "line2": []
}
```

### Example: powerline-style without icons

```json
{
  "iconsEnabled": false,
  "separator": " │ ",
  "bar": { "fillChar": "▰", "emptyChar": "▱" }
}
```

## What the sections show

| Section | Meaning |
|---|---|
| 🧠 model | Current Claude model name |
| 📊 context | Context window usage % |
| ⏱  usage5h | Rolling 5h quota usage + countdown to reset |
| 📅 usage7d | Rolling 7d quota usage + countdown to reset (Pro/Max only) |
| 📁 directory | Current project folder |
| 🌿 gitBranch | Active git branch (walks up directories) |
| 🤖 agents | Task tool invocations (subagents spawned) |
| 🔧 tools | Tools invoked in project / unique tools known globally |
| 📝 files | Unique files edited (Edit/Write/MultiEdit) |
| 🔌 mcps | Active MCP servers (configured across all sources) |
| ✅ successRate | Tool success ratio (errors vs OK) |
| 💾 cache | Total cache read tokens (cumulative session tokens saved by cache) |

## Troubleshooting

**The statusline doesn't appear after install.** Fully quit Claude Code and relaunch. A `/reload` won't pick up the new `statusLine` config.

**Icons render as boxes.** Your terminal needs an emoji-capable font. Windows Terminal and iTerm2 handle them by default. Or set `iconsEnabled: false`.

**Output wraps over multiple lines on a narrow terminal.** That's the terminal, not the statusline. Widen the window or hide some sections.

**Stats reset after restarting Claude Code.** They shouldn't — they aggregate across all `.jsonl` transcripts in `~/.claude/projects/<sanitized-cwd>/`. If you're seeing resets, check that `transcript_path` points to the right place.

## How it works

Claude Code invokes the statusline command after each assistant message, passing a JSON payload via stdin. The script reads:

- Live data from stdin (model, rate limits, context usage)
- Aggregated stats from `~/.claude/projects/<project>/` JSONL transcripts
- MCP configuration from `~/.claude.json`, `~/.mcp.json`, and `<project>/.mcp.json`
- Cached rate limits from `~/.claude/statusline-cache/rate-limits.json` (for early-session display)
- Git state by walking parent directories for `.git/HEAD`

See the [Claude Code statusline docs](https://code.claude.com/docs/en/statusline) for the full input schema.

## License

MIT © [lemale237](https://github.com/lemale237)
