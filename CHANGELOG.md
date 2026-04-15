# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-04-16

### Added
- **Responsive statusline**: sections are now progressively hidden when the terminal is too narrow, based on a configurable priority list.
- `responsive.enabled`, `responsive.priority`, `responsive.maxWidth` config options.
- `resetLabel` config option to customize the label shown before countdown values.

### Changed
- Default countdown label is now `"reset in "` instead of `"↻"` — the full word is clearer about what the time represents.

## [1.0.0] — 2026-04-14

### Added
- Initial release.
- Two-line statusline with progress bars, icons, and sections:
  - Line 1: model, context, 5h usage + countdown, 7d usage + countdown, directory, git branch
  - Line 2: agents, tools used/available, files edited, MCPs, success rate, cache reads
- Fully configurable via `~/.claude/statusline-pro.json`:
  - Per-section show/hide
  - Color palette and progress-bar thresholds
  - Custom icons (or disable all)
  - Custom separator
  - Countdown and token format modes
  - Stats scope (current project vs global)
- Persistent stats across terminal restarts (aggregates all transcripts in the project dir).
- Cached 5h/7d rate limits so they stay visible during early-session warmup.
- CLI: `install`, `uninstall`, `init`, `preview`, `help`.
