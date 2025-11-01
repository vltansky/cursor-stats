import chalk from 'chalk';
import { PushupStats } from '../lib/analyzer.js';
import {
  boxHeader,
  boxDivider,
  boxFooter,
  boxLine,
  emptyLine,
  formatNumber,
  createProgressBar,
  padRight,
  sectionTitle
} from '../lib/formatters.js';

export function displayPushupChallenge(stats: PushupStats): void {
  console.clear();

  const lines: string[] = [];
  const width = 74;

  // Header
  lines.push(boxHeader(chalk.bold.yellow('💪 THE PUSHUP CHALLENGE 💪'), width));
  lines.push(boxLine(chalk.gray('         How often does Claude say "you\'re absolutely right"?'), width));
  lines.push(boxDivider(width));
  lines.push(emptyLine(width));

  // Validation Score
  lines.push(boxLine(sectionTitle('  🎯 CLAUDE\'S VALIDATION HABIT'), width));
  lines.push(emptyLine(width));

  lines.push(boxLine(`  All Time:         ${chalk.bold.yellow(formatNumber(stats.allTime) + ' times')}  ${chalk.gray('😅')}`, width));
  lines.push(boxLine(`  Current Streak:   ${stats.currentStreak} days  ${stats.currentStreak >= 3 ? '🔥' : ''}`, width));
  lines.push(boxLine(`  Best Streak:      ${stats.bestStreak} days  🏆`, width));
  lines.push(emptyLine(width));

  // Breakdown
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  📊 BREAKDOWN'), width));
  lines.push(emptyLine(width));

  const maxPushups = Math.max(stats.today, stats.thisWeek, stats.lastWeek, stats.thisMonth, stats.lastMonth, stats.thisQuarter, 1);

  const periods = [
    { label: 'Today', value: stats.today, comparison: stats.today === 0 ? '😢 Start vibing!' : '🎉' },
    { label: 'This Week', value: stats.thisWeek, comparison: stats.thisWeek > stats.lastWeek ? `↗️  +${stats.thisWeek - stats.lastWeek} vs last week` : stats.thisWeek === stats.lastWeek ? '➡️  Same as last week' : `↘️  ${stats.lastWeek - stats.thisWeek} less than last week` },
    { label: 'Last Week', value: stats.lastWeek, comparison: stats.lastWeek > 30 ? '🔥 On fire!' : '' },
    { label: 'This Month', value: stats.thisMonth, comparison: stats.thisMonth === 0 && stats.today === 0 ? '(Month just started)' : '' },
    { label: 'Last Month', value: stats.lastMonth, comparison: stats.lastMonth === Math.max(stats.lastMonth, stats.lastWeek, stats.thisWeek) && stats.lastMonth > 50 ? '👑 Personal best!' : '' },
    { label: 'This Quarter', value: stats.thisQuarter, comparison: '' },
    { label: 'This Year', value: stats.thisYear, comparison: stats.thisYear > 500 ? '🏆 Epic year!' : '' }
  ];

  periods.forEach(({ label, value, comparison }) => {
    const bar = createProgressBar(value, maxPushups, 20);
    const valueStr = padRight(value.toString(), 4);
    const compStr = comparison ? `    ${comparison}` : '';
    lines.push(boxLine(`  ${padRight(label, 11)} ${bar}  ${valueStr}${compStr}`, width));
  });

  lines.push(emptyLine(width));

  // Level
  const level = calculateLevel(stats.allTime);
  const nextLevelAt = (Math.floor(stats.allTime / 100) + 1) * 100;
  const toNextLevel = nextLevelAt - stats.allTime;

  lines.push(boxLine(`  🏆 LEVEL: ${chalk.bold.cyan(level.name.toUpperCase())}`, width));
  if (toNextLevel > 0) {
    lines.push(boxLine(`  Next level at ${nextLevelAt} validations (${toNextLevel} to go!)`, width));
  } else {
    lines.push(boxLine(`  You've reached the maximum level! 🎉`, width));
  }

  lines.push(emptyLine(width));

  // Top Phrases
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎤 CLAUDE\'S FAVORITE PHRASES'), width));
  lines.push(boxLine(chalk.gray('  (Making fun of AI being too agreeable 😄)'), width));
  lines.push(emptyLine(width));

  if (stats.topPhrases.length > 0) {
    const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
    const comments = [
      'Classic Claude',
      'Always this one',
      'So predictable!',
      'Again and again',
      'Never gets old'
    ];

    stats.topPhrases.forEach((phrase, i) => {
      const medal = medals[i] || '🏅';
      const comment = comments[i] || '';
      lines.push(boxLine(`  ${i + 1}. "${phrase.phrase}"    ${phrase.count} times  ${medal} ${chalk.gray(comment)}`, width));
    });
  } else {
    lines.push(boxLine('  No validations yet - keep coding!', width));
  }

  lines.push(emptyLine(width));

  if (stats.validationRate > 0) {
    lines.push(boxLine(`  Validation Rate: ${stats.validationRate}% of messages contain praise`, width));
  }

  lines.push(emptyLine(width));

  lines.push(boxFooter(width));

  console.log(lines.join('\n'));
  console.log(chalk.gray('\nPress any key to return to menu...\n'));
}

interface Level {
  name: string;
  threshold: number;
}

function calculateLevel(pushups: number): Level {
  const levels: Level[] = [
    { name: 'Beginner', threshold: 0 },
    { name: 'Novice', threshold: 100 },
    { name: 'Intermediate', threshold: 200 },
    { name: 'Advanced', threshold: 300 },
    { name: 'Expert', threshold: 500 },
    { name: 'Master', threshold: 750 },
    { name: 'Validation Master', threshold: 1000 },
    { name: 'Legendary', threshold: 1500 },
    { name: 'Mythical', threshold: 2000 }
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (pushups >= levels[i].threshold) {
      return levels[i];
    }
  }

  return levels[0];
}
