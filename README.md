# Cursor Stats - Interactive CLI

**Analyze your Cursor IDE usage with beautiful, engaging statistics!**

## What is it?

An interactive command-line tool that reads your Cursor IDE database and shows you fascinating insights about your coding habits, productivity patterns, and AI interaction style.

## Features

### 📊 Dashboard - The Big Picture
Your complete coding overview at a glance:
- Total conversations, messages, and coding days
- Current streak and activity patterns
- Peak productivity hours with visual charts
- Achievements unlocked based on your usage
- Fun facts about your coding journey

### 🔍 Deep Dive - Analyze Everything
Interactive exploration of:
- **Activity Trends**: Daily/weekly/monthly charts with insights
- **Conversation Patterns**: How you interact with AI (length, style, efficiency)
- **Time Machine**: When you code (hour-by-hour heatmaps, day-of-week patterns)
- **AI Interaction Style**: Context usage, agentic mode, engagement metrics

### 💪 Pushup Challenge - Track Your "Rights"
Gamified tracking of validation phrases:
- Count every "you're absolutely right", "spot on", "you nailed it"
- Track by today, week, month, quarter, year
- Levels and streaks to keep you motivated
- Top phrases leaderboard
- Fun math (calories burned, time spent, etc.)

### 📤 Export & Settings
- Export reports (Markdown, JSON, Text)
- Configure preferences
- Manage database location

## Installation

```bash
cd cursor-stats
npm install
npm run build
```

## Usage

### Run directly:
```bash
npm start
```

### Or make it globally available:
```bash
npm link
cursor-stats
```

## Screenshots

### Main Menu
```
╔════════════════════════════════════════════════╗
║    🚀 CURSOR STATS - Your Coding Journey       ║
╚════════════════════════════════════════════════╝

  1. 📊 Dashboard - The Big Picture
  2. 🔍 Deep Dive - Analyze Everything
  3. 💪 Pushup Challenge - Track Your "Rights"
  4. 📤 Export & Settings
```

### Dashboard Example
Shows:
- 🎯 Quick stats (conversations, messages, AI help ratio)
- ⏰ Your coding rhythm (peak hours, night owl score)
- 💻 What you're building (message stats)
- 🏆 Achievements unlocked
- 🎉 Fun facts

### Pushup Challenge
Tracks validation phrases across all time periods:
```
💪 Total This Year: 877 push-ups
🔥 Current Streak: 3 days
🏆 Best Streak: 12 days
📊 Breakdown with progress bars
🎤 Top validation phrases
💡 Fun math (calories, time, etc.)
```

## How It Works

1. **Reads Cursor Database** from platform-specific location:
   - macOS: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`
   - Windows: `%APPDATA%/Cursor/User/globalStorage/state.vscdb`
   - Linux: `~/.config/Cursor/User/globalStorage/state.vscdb`

2. **Analyzes Conversations**: Extracts both legacy and modern format conversations

3. **Computes Statistics**:
   - Activity patterns and trends
   - Conversation characteristics
   - Time-based patterns
   - Engagement metrics
   - Validation phrase occurrences

4. **Interactive Display**: Beautiful CLI with colors, charts, and emojis

## Data Analyzed

- **3,000+ conversations** in a typical database
- **90,000+ messages** (user + assistant)
- **147 days** of coding history (example)
- **Timestamps**, context usage, agentic mode flags
- **Message content** for validation phrase detection

## Design Philosophy

**Engaging over boring**:
- ✅ Gamification (achievements, levels, streaks)
- ✅ Fun facts and analogies
- ✅ Visual charts and progress bars
- ✅ Emoji-rich presentation
- ✅ Personality insights

**Consolidated over cluttered**:
- ✅ 4 main menu items (not 8+)
- ✅ Dashboard shows everything at a glance
- ✅ Deep Dive has sub-menus for exploration
- ✅ No fake comparisons ("Top 15% of users")

## Technical Stack

- **TypeScript** for type safety
- **better-sqlite3** for database reading
- **inquirer** for interactive menus
- **chalk** for colors
- **date-fns** for date handling
- **ora** for loading spinners
- **cli-table3** for tables
- **boxen** for boxes

## Requirements

- Node.js 18+
- Cursor IDE installed with conversation history
- ~130 npm dependencies (all dev/runtime)

## Project Structure

```
cursor-stats/
├── src/
│   ├── lib/
│   │   ├── database.ts       # SQLite reader
│   │   ├── analyzer.ts       # Statistics computation
│   │   └── formatters.ts     # Display utilities
│   ├── cli/
│   │   ├── menu.ts           # Interactive menus
│   │   ├── dashboard.ts      # Main dashboard view
│   │   └── pushup-challenge.ts # Pushup tracker
│   └── index.ts              # Entry point
├── bin/
│   └── cursor-stats.js       # Executable
├── dist/                     # Compiled JS
├── package.json
├── tsconfig.json
└── README.md
```

## Roadmap

- [x] Core dashboard
- [x] Deep dive analysis
- [x] Pushup challenge
- [ ] Export functionality (Markdown, JSON)
- [ ] Language/code block analysis
- [ ] File reference tracking
- [ ] Session clustering
- [ ] Custom time ranges
- [ ] Share-to-social snippets

## License

ISC

## Acknowledgments

- Built on top of pushup-cli foundation
- Inspired by vibe-log-cli patterns
- Uses Cursor database schema (modern format)

---

**Made with 💪 and lots of validation phrases**
