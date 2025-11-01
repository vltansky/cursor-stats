# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cursor-stats** is an interactive CLI tool that analyzes Cursor IDE usage by reading the SQLite database and presenting engaging statistics about coding habits, AI interaction patterns, and emotional/behavioral "vibe-coding" insights.

## Development Commands

```bash
# Build TypeScript → JavaScript
npm run build

# Run the CLI
npm start

# Build and run (development)
npm run dev
```

## Architecture

### Three-Layer Design

1. **Data Layer** (`src/lib/`)
   - `database.ts` - SQLite reader that handles both **legacy** (conversation array) and **modern** (bubbleId reference) Cursor database formats
   - `analyzer.ts` - Statistics computation engine with 6 main stat categories + 6 keyword-based vibe stats
   - `formatters.ts` - Display utilities (progress bars, box drawing, number formatting)

2. **CLI Layer** (`src/cli/`)
   - `menu.ts` - Interactive menu system using inquirer, handles keyboard input with TTY safety
   - `dashboard.ts` - Main dashboard view with AI interaction style + vibe-coding snapshot
   - `pushup-challenge.ts` - Gamified tracker for Claude's validation phrases ("you're absolutely right", etc.)
   - `vibe-stats.ts` - Deep dive into emotions, learning, tasks, thinking modes, confidence, communication

3. **Entry Point**
   - `src/index.ts` - CLI setup with Commander flags, signal handlers (SIGINT/SIGTERM), and error handling
   - `bin/cursor-stats.js` - Executable entry with Node.js version check (requires 18+)

### Database Reading Strategy

The analyzer handles two Cursor conversation formats:

**Legacy format**:
```typescript
{ conversation: [...messages] }
```

**Modern format**:
```typescript
{
  bubbleId: "bubble123",
  composerId: "composer456",
  // messages stored separately, referenced by bubbleId:composerId:bubbleId
}
```

Key code in `src/lib/database.ts:getAssistantMessages()` resolves modern references.

### Statistics Categories

**Core stats** (`src/lib/analyzer.ts`):
- `OverviewStats` - totals, streaks, time span
- `ActivityStats` - daily/weekly/monthly patterns
- `ConversationStats` - length distribution, one-shot vs multi-shot sessions
- `TimeStats` - hourly/daily heatmaps, peak hours, night owl score
- `EngagementStats` - agentic mode %, context usage, messages per conversation
- `PushupStats` - Claude validation phrase tracking with streaks and top phrases

**Vibe-coding stats** (keyword-based analysis):
- `EmotionalStats` - frustration, excitement, confusion, gratitude, CAPS LOCK yelling
- `LearningStats` - question types (how/why/what), teaching back, AHA moments
- `ThinkingStats` - deep thinking, speed mode, experimental, careful requests
- `TaskStats` - fix/add/refactor/delete/optimize/test/docs distribution
- `ConfidenceStats` - certain vs uncertain language, confidence score
- `CommunicationStats` - polite/direct/collaborative style, politeness score

### Critical Implementation Notes

**CAPS LOCK Detection** (`src/lib/analyzer.ts:isYelling()`):
- Filters out code blocks, URLs, and common acronyms (API, URL, HTTP, CSS, etc.)
- Requires 50%+ of words to be in ALL CAPS (excluding acronyms)
- Minimum 3 words, each 3+ characters

**Validation Phrase Tracking**:
- Only tracks phrases from **assistant messages** (type 2), not user messages
- Patterns: "you're absolutely right", "spot on", "you nailed it", etc.
- This is specifically about **Claude being too agreeable** - making fun of AI validation habits

**Session Classification**:
- **One-shot**: 1-2 messages total (user asks, AI answers, done)
- **Multi-shot**: 3+ messages (back-and-forth discussion)

**Signal Handling**:
- Must restore terminal state on exit (setRawMode(false) if TTY)
- Handle SIGINT (Ctrl+C), SIGTERM, and exit events
- See `src/index.ts:setupSignalHandlers()` and `src/cli/menu.ts:waitForKey()`

## Design Philosophy

**Consolidated, not cluttered**:
- Only 4 main menu items (Dashboard, Deep Dive, Pushup Challenge, Export & Settings)
- Dashboard shows snapshot of everything at once
- Deep Dive has sub-menus for detailed exploration

**Engaging, not boring**:
- Gamification: achievements, levels, streaks
- Emoji-rich presentation with visual progress bars
- Fun personality insights (Quick Draw, Deep Diver, The Boss, Polite Partner, etc.)
- NO fake comparisons like "Top 15% of users" (we don't have external data)

**Claude-specific vs generic AI**:
- Only the **Pushup Challenge** section is Claude-specific (validation phrases)
- All other stats are generic "AI" or "Cursor" usage (not "Claude")
- Achievement: "Claude Agrees A Lot" is the ONLY Claude-specific achievement

## ES Modules Configuration

This project uses **ES modules** (`"type": "module"` in package.json):
- All imports must include `.js` extension even for `.ts` files: `import { foo } from './bar.js'`
- This is intentional for TypeScript + ES modules compatibility

## Data Privacy

The tool reads only local SQLite database at:
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`
- Windows: `%APPDATA%/Cursor/User/globalStorage/state.vscdb`
- Linux: `~/.config/Cursor/User/globalStorage/state.vscdb`

No data is ever sent to external servers.
