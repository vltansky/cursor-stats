import chalk from 'chalk';
import { Stats } from '../lib/analyzer.js';
import {
  boxHeader,
  boxDivider,
  boxFooter,
  boxLine,
  emptyLine,
  formatNumber,
  formatDuration,
  formatDate,
  createProgressBar,
  createBarChart,
  padRight,
  sectionTitle
} from '../lib/formatters.js';

export function displayDashboard(stats: Stats): void {
  console.clear();
  // Move cursor to top-left (0,0) to ensure output starts from top
  process.stdout.write('\x1b[H');

  const lines: string[] = [];
  const width = 74;

  // Header
  lines.push(boxHeader(chalk.bold.cyan('🚀 YOUR CURSOR STATS DASHBOARD'), width));
  lines.push(emptyLine(width));

  // Top summary bar
  const daysLine = `  📅 ${stats.overview.timeSpanDays} Days of Coding        🔥 ${stats.overview.currentStreak}-Day Streak`;
  lines.push(boxLine(daysLine, width));
  lines.push(emptyLine(width));

  // Quick Stats Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎯 QUICK STATS'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  const currentWeekTotal = stats.activity.last30Days.slice(-7).reduce((sum, d) => sum + d.conversations, 0);
  const previousWeekTotal = stats.activity.last30Days.slice(-14, -7).reduce((sum, d) => sum + d.conversations, 0);
  const isGrowing = currentWeekTotal > previousWeekTotal;

  lines.push(boxLine(`  💬 Conversations         ${padRight(formatNumber(stats.overview.totalConversations), 6)}    ${isGrowing ? chalk.green('📈 Growing!') : '📊 Active'}`, width));
  lines.push(boxLine(`  💭 Messages             ${padRight(formatNumber(stats.overview.totalMessages), 7)}`, width));
  lines.push(boxLine(`  📊 Avg msgs/day            ${padRight(formatNumber(stats.overview.avgMessagesPerDay), 4)}`, width));
  lines.push(emptyLine(width));

  // Activity Trends Chart (Last 30 Days)
  lines.push(boxLine('  Last 30 Days Activity:', width));
  const maxMessages = Math.max(...stats.activity.last30Days.map(d => d.messages), 1);
  const chartHeight = 8;
  const chartWidth = 30;

  for (let row = chartHeight; row >= 0; row--) {
    const threshold = (maxMessages / chartHeight) * row;
    let line = '  ';

    if (row === chartHeight || row === chartHeight / 2 || row === 0) {
      line += chalk.gray(`${Math.round(threshold).toString().padStart(4)}│`);
    } else {
      line += '     │';
    }

    stats.activity.last30Days.forEach((day, i) => {
      if (i % Math.ceil(30 / chartWidth) === 0) {
        if (day.messages >= threshold) {
          line += chalk.green('▓');
        } else {
          line += chalk.gray('░');
        }
      }
    });

    lines.push(boxLine(line.trimEnd(), width));
  }

  // Activity insights
  const currentWeekMsgs = stats.activity.last30Days.slice(-7).reduce((sum, d) => sum + d.messages, 0);
  const previousWeekMsgs = stats.activity.last30Days.slice(-14, -7).reduce((sum, d) => sum + d.messages, 0);
  const change = currentWeekMsgs - previousWeekMsgs;
  const changePercent = previousWeekMsgs > 0 ? Math.round((change / previousWeekMsgs) * 100) : 0;

  if (change > 0) {
    lines.push(boxLine(`  📈 Up ${changePercent}% from previous week`, width));
  }
  lines.push(boxLine(`  🔥 Most active: ${stats.activity.mostActiveDay.date} (${stats.activity.mostActiveDay.count} msgs)`, width));
  lines.push(emptyLine(width));

  // Vibe-Coding Rhythm Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  ⏰ YOUR VIBE-CODING RHYTHM'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  const peakHourStr = stats.time.peakHour.hour === 12 ? '12pm' :
                      stats.time.peakHour.hour > 12 ? `${stats.time.peakHour.hour - 12}pm` :
                      stats.time.peakHour.hour === 0 ? '12am' : `${stats.time.peakHour.hour}am`;

  const nextHour = (stats.time.peakHour.hour + 1) % 24;
  const nextHourStr = nextHour === 12 ? '12pm' :
                      nextHour > 12 ? `${nextHour - 12}pm` :
                      nextHour === 0 ? '12am' : `${nextHour}am`;

  lines.push(boxLine(`  Most Productive Hour:  ${peakHourStr}-${nextHourStr}  ${getTimeEmoji(stats.time.peakHour.hour)}  (${formatNumber(stats.time.peakHour.count)} msgs)`, width));

  const nightOwlLabel = stats.time.nightOwlScore > 20 ? "You're a night owl!" : "You're an early bird!";
  lines.push(boxLine(`  Night Owl Score:       ${stats.time.nightOwlScore}%  🌙  ${chalk.gray(nightOwlLabel)}`, width));
  lines.push(boxLine(`  Best Day:              ${stats.time.mostProductiveDay}  💚`, width));

  if (stats.conversations.longestSession.duration > 0) {
    lines.push(boxLine(`  Longest Session:       ${formatDuration(stats.conversations.longestSession.duration)}  🏃  (on ${formatDate(stats.conversations.longestSession.date)})`, width));
  }

  lines.push(emptyLine(width));

  // Hour-by-Hour Activity
  lines.push(boxLine('  Hour-by-Hour Activity:', width));

  const hours = Array.from(stats.time.hourlyDistribution.entries()).sort((a, b) => a[0] - b[0]);
  const maxHourly = Math.max(...hours.map(h => h[1]), 1);

  // Create 6 rows of hours (4 hours per row = 24 hours total)
  for (let row = 0; row < 6; row++) {
    const startHour = row * 4;
    let line = '  ';

    for (let h = startHour; h < startHour + 4 && h < 24; h++) {
      const count = stats.time.hourlyDistribution.get(h) || 0;
      const hourStr = h.toString().padStart(2, '0');
      const bar = createBarChart(count, maxHourly, 12);
      line += `${hourStr} ${bar}  `;
    }
    lines.push(boxLine(line.trimEnd(), width));
  }

  lines.push(emptyLine(width));

  // Day of Week Breakdown
  lines.push(boxLine('  Day of Week Breakdown:', width));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayEmojis: Record<string, string> = {
    'Monday': '💼', 'Tuesday': '🔥', 'Wednesday': '💚', 'Thursday': '⚡',
    'Friday': '🎉', 'Saturday': '😴', 'Sunday': '🌴'
  };
  const maxDayCount = Math.max(...days.map(d => stats.time.dayOfWeekDistribution.get(d) || 0), 1);

  days.forEach(day => {
    const count = stats.time.dayOfWeekDistribution.get(day) || 0;
    const bar = createProgressBar(count, maxDayCount, 20);
    const percentage = maxDayCount > 0 ? Math.round((count / maxDayCount) * 100) : 0;
    lines.push(boxLine(`  ${padRight(day, 12)} ${bar}  ${percentage}%  ${dayEmojis[day] || ''}`, width));
  });

  lines.push(emptyLine(width));

  // AI Interaction Style Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🤖 YOUR AI INTERACTION STYLE'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  const oneShotBar = createProgressBar(stats.conversations.oneShotPercentage, 100, 20);
  lines.push(boxLine(`  One-Shot Sessions: ${oneShotBar}  ${stats.conversations.oneShotPercentage}%`, width));
  lines.push(boxLine(chalk.gray(`  (Quick Q&A vs back-and-forth discussion)`), width));
  lines.push(emptyLine(width));

  lines.push(boxLine(`  📊 ${formatNumber(stats.conversations.oneShotConversations)} quick Q&As  •  ${formatNumber(stats.conversations.multiShotConversations)} discussions`, width));
  lines.push(boxLine(`  🎯 Avg ${stats.engagement.messagesPerConversation.user} msgs to get answer`, width));
  lines.push(emptyLine(width));

  // Conversation Length Distribution
  const total = stats.conversations.lengthDistribution.quick +
                stats.conversations.lengthDistribution.short +
                stats.conversations.lengthDistribution.medium +
                stats.conversations.lengthDistribution.epic;

  if (total > 0) {
    lines.push(boxLine('  Conversation Length Distribution:', width));
    const distributions = [
      { label: 'Quick (1-5 msgs)', value: stats.conversations.lengthDistribution.quick },
      { label: 'Short (6-20)', value: stats.conversations.lengthDistribution.short },
      { label: 'Medium (21-50)', value: stats.conversations.lengthDistribution.medium },
      { label: 'Epic (50+)', value: stats.conversations.lengthDistribution.epic }
    ];

    const maxDist = Math.max(...distributions.map(d => d.value), 1);
    distributions.forEach(({ label, value }) => {
      const bar = createProgressBar(value, maxDist, 20);
      const percentage = Math.round((value / total) * 100);
      lines.push(boxLine(`  ${padRight(label, 18)} ${bar}  ${percentage}%`, width));
    });
    lines.push(emptyLine(width));
  }

  // Conversation length breakdowns
  if (stats.conversations.twoTurnConversations > 0) {
    const twoTurnPct = Math.round((stats.conversations.twoTurnConversations / stats.overview.totalConversations) * 100);
    lines.push(boxLine(`  🔄 Quick Turn: ${formatNumber(stats.conversations.twoTurnConversations)} conversations (${twoTurnPct}%) - exactly 2 messages`, width));
  }

  if (stats.conversations.extendedConversations > 0) {
    const extendedPct = Math.round((stats.conversations.extendedConversations / stats.overview.totalConversations) * 100);
    lines.push(boxLine(`  📚 Extended: ${formatNumber(stats.conversations.extendedConversations)} conversations (${extendedPct}%) - >10 messages`, width));
  }

  if (stats.conversations.marathonConversations > 0) {
    const marathonPct = Math.round((stats.conversations.marathonConversations / stats.overview.totalConversations) * 100);
    lines.push(boxLine(`  🏃 Marathon: ${formatNumber(stats.conversations.marathonConversations)} conversations (${marathonPct}%) - >50 messages`, width));
  }

  if (stats.conversations.twoTurnConversations > 0 || stats.conversations.extendedConversations > 0 || stats.conversations.marathonConversations > 0) {
    lines.push(emptyLine(width));
  }

  // Response time and session duration
  if (stats.conversations.avgTimeBetweenTurns > 0) {
    const responseTime = stats.conversations.avgTimeBetweenTurns < 1
      ? `${Math.round(stats.conversations.avgTimeBetweenTurns * 60)}s`
      : `${Math.round(stats.conversations.avgTimeBetweenTurns)}min`;
    lines.push(boxLine(`  ⚡ Response Speed: ${responseTime} avg between messages`, width));
  }

  if (stats.conversations.avgSessionDuration > 0) {
    lines.push(boxLine(`  ⏱️  Session Duration: ${Math.round(stats.conversations.avgSessionDuration * 10) / 10}h avg per conversation`, width));
  }

  if (stats.conversations.multiDayConversations > 0) {
    lines.push(boxLine(`  🔄 Multi-day Conversations: ${formatNumber(stats.conversations.multiDayConversations)} (${Math.round((stats.conversations.multiDayConversations / stats.overview.totalConversations) * 100)}%)`, width));
  }

  // Message length comparison
  const userMsgLength = stats.engagement.avgUserMessageLength;
  const aiMsgLength = stats.engagement.avgAssistantMessageLength;
  const ratio = userMsgLength > 0 ? Math.round((aiMsgLength / userMsgLength) * 10) / 10 : 0;
  lines.push(boxLine(`  📝 Message Length: ${formatNumber(userMsgLength)} chars (you) vs ${formatNumber(aiMsgLength)} chars (AI)`, width));
  lines.push(boxLine(chalk.gray(`  (AI responses are ${ratio}x longer on average)`), width));
  lines.push(emptyLine(width));

  // Vibe-Coding Snapshot Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  ✨ VIBE-CODING SNAPSHOT'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  // Emotions
  const emotionEmojis: Record<string, string> = {
    frustrated: '😤',
    excited: '🎉',
    confused: '🤔',
    grateful: '🙏',
    neutral: '😐'
  };
  lines.push(boxLine(`  Mood:              ${chalk.bold.yellow(stats.emotions.topEmotion.toUpperCase())} ${emotionEmojis[stats.emotions.topEmotion]}  ${stats.emotions.yelling > 0 ? `(${stats.emotions.yelling} CAPS msgs 📢)` : ''}`, width));

  // Tasks
  const taskEmojis: Record<string, string> = {
    fix: '🐛', add: '✨', refactor: '♻️', delete: '🗑️', optimize: '⚡', test: '🧪', docs: '📝', none: '🤷'
  };
  lines.push(boxLine(`  Main Task:         ${chalk.bold.cyan(stats.tasks.topTaskType.toUpperCase())} ${taskEmojis[stats.tasks.topTaskType] || ''}  (${stats.tasks.totalTasks} total)`, width));

  // Thinking mode
  const thinkingEmojis: Record<string, string> = {
    deep: '🧠', speed: '⚡', experimental: '🧪', balanced: '⚖️'
  };
  lines.push(boxLine(`  Thinking Mode:     ${chalk.bold.green(stats.thinking.thinkingMode.toUpperCase())} ${thinkingEmojis[stats.thinking.thinkingMode]}`, width));

  // Confidence
  const confBar = createProgressBar(stats.confidence.confidenceScore, 100, 15);
  lines.push(boxLine(`  Confidence:        ${confBar}  ${stats.confidence.confidenceScore}%`, width));

  // Communication style
  const commStyle = stats.communication.politenessScore >= 70 ? `😇 Polite (${stats.communication.politenessScore}%)` :
                     stats.communication.direct > stats.communication.polite ? `👑 Direct` :
                     stats.communication.collaborative > stats.communication.polite ? `🤝 Collaborative` : `⚖️ Balanced`;
  lines.push(boxLine(`  Communication:     ${commStyle}`, width));

  lines.push(emptyLine(width));

  // Achievements Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🏆 ACHIEVEMENTS UNLOCKED'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  const achievements = getAchievements(stats);
  achievements.forEach(achievement => {
    lines.push(boxLine(`  ${achievement.emoji} ${padRight(achievement.name, 18)} - ${achievement.description}`, width));
  });

  lines.push(emptyLine(width));

  // Fun Facts Section
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎉 FUN FACTS'), width));
  lines.push(boxLine('  ' + '━'.repeat(70), width));
  lines.push(emptyLine(width));

  const funFacts = getFunFacts(stats);
  funFacts.forEach(fact => {
    lines.push(boxLine(`  • ${fact}`, width));
  });

  lines.push(emptyLine(width));

  lines.push(boxFooter(width));

  console.log(lines.join('\n'));
  console.log(chalk.gray('\nPress any key to return to menu...\n'));
}

function getTimeEmoji(hour: number): string {
  if (hour >= 5 && hour < 8) return '🌅';
  if (hour >= 8 && hour < 12) return '☀️';
  if (hour >= 12 && hour < 17) return '🌤️';
  if (hour >= 17 && hour < 20) return '🌆';
  return '🌙';
}

interface Achievement {
  emoji: string;
  name: string;
  description: string;
}

function getAchievements(stats: Stats): Achievement[] {
  const achievements: Achievement[] = [];

  // Streak achievements
  if (stats.overview.currentStreak >= 7) {
    achievements.push({
      emoji: '🔥',
      name: 'Hot Streak',
      description: `${stats.overview.currentStreak} consecutive days`
    });
  }

  // Night owl vs early bird
  // Calculate morning score (5am-10am)
  const morningHours = [5, 6, 7, 8, 9];
  const morningMessages = morningHours.reduce((sum, hour) => sum + (stats.time.hourlyDistribution.get(hour) || 0), 0);
  const totalMessages = Array.from(stats.time.hourlyDistribution.values()).reduce((a, b) => a + b, 0);
  const morningScore = totalMessages > 0 ? Math.round((morningMessages / totalMessages) * 100) : 0;

  if (morningScore >= 20) {
    achievements.push({
      emoji: '🌅',
      name: 'Early Bird',
      description: `${morningScore}% of coding during morning hours (5am-10am)`
    });
  } else if (stats.time.nightOwlScore > 25) {
    achievements.push({
      emoji: '🦉',
      name: 'Night Owl',
      description: `${stats.time.nightOwlScore}% of coding after midnight`
    });
  }

  // Conversation achievements
  if (stats.overview.totalConversations >= 1000) {
    achievements.push({
      emoji: '📚',
      name: 'Bookworm',
      description: `${formatNumber(stats.overview.totalConversations)} conversations`
    });
  }

  // Efficiency achievement
  if (stats.engagement.messagesPerConversation.user < 3) {
    achievements.push({
      emoji: '🎯',
      name: 'Sniper',
      description: `Avg ${stats.engagement.messagesPerConversation.user} msgs to get answer`
    });
  }

  // Pushup achievement (Claude being too agreeable)
  if (stats.pushups.allTime >= 500) {
    achievements.push({
      emoji: '😂',
      name: 'Claude Agrees A Lot',
      description: `Claude said "you're right" ${stats.pushups.allTime} times 😅`
    });
  }

  if (stats.conversations.longestLength >= 100) {
    achievements.push({
      emoji: '🏰',
      name: 'Marathon Chatter',
      description: `Longest conversation: ${stats.conversations.longestLength} messages`
    });
  }

  // Emotional achievements
  if (stats.emotions.curses >= 100) {
    achievements.push({
      emoji: '😤',
      name: 'Potty Mouth',
      description: `${stats.emotions.curses} curse words detected (warrior!)`
    });
  }

  if (stats.emotions.yelling >= 50) {
    achievements.push({
      emoji: '😤',
      name: 'CAPS LOCK Rage',
      description: `${stats.emotions.yelling} frustrated msgs in ALL CAPS`
    });
  }

  // Learning achievements
  if (stats.learning.questionsAsked >= 500) {
    achievements.push({
      emoji: '🎓',
      name: 'Eternal Student',
      description: `Asked ${stats.learning.questionsAsked} questions`
    });
  }

  if (stats.learning.teachingBack >= 50) {
    achievements.push({
      emoji: '👨‍🏫',
      name: 'The Professor',
      description: `Taught AI back ${stats.learning.teachingBack} times`
    });
  }

  if (stats.learning.ahaMoments >= 100) {
    achievements.push({
      emoji: '💡',
      name: 'Lightbulb Collector',
      description: `${stats.learning.ahaMoments} AHA moments!`
    });
  }

  // Thinking mode achievements
  if (stats.thinking.deepThinkingRequests >= 20) {
    achievements.push({
      emoji: '🧠',
      name: 'Deep Thinker',
      description: `Used ultrathink ${stats.thinking.deepThinkingRequests} times`
    });
  }

  if (stats.thinking.speedRequests >= 100) {
    achievements.push({
      emoji: '⚡',
      name: 'Speedrunner',
      description: `${stats.thinking.speedRequests} quick/fast requests`
    });
  }

  // Task achievements
  if (stats.tasks.fix > stats.tasks.add * 1.5) {
    achievements.push({
      emoji: '🐛',
      name: 'Bug Hunter',
      description: `You fix more than you build!`
    });
  }

  if (stats.tasks.add > stats.tasks.fix * 1.5) {
    achievements.push({
      emoji: '✨',
      name: 'Creator',
      description: `You build more than you fix!`
    });
  }

  if (stats.tasks.refactor >= 100) {
    achievements.push({
      emoji: '♻️',
      name: 'Perfectionist',
      description: `${stats.tasks.refactor} refactoring tasks`
    });
  }

  // Confidence achievements
  if (stats.confidence.confidenceScore >= 80) {
    achievements.push({
      emoji: '👑',
      name: 'Alpha Dev',
      description: `${stats.confidence.confidenceScore}% confidence level`
    });
  }

  if (stats.confidence.confidenceScore <= 30) {
    achievements.push({
      emoji: '🤔',
      name: 'Humble Coder',
      description: `Lots of "maybe" and "not sure"`
    });
  }

  // Communication achievements
  if (stats.communication.politenessScore >= 80) {
    achievements.push({
      emoji: '😇',
      name: 'Polite Partner',
      description: `${stats.communication.politenessScore}% politeness score`
    });
  }

  if (stats.communication.direct >= 200) {
    achievements.push({
      emoji: '🎯',
      name: 'The Boss',
      description: `${stats.communication.direct} direct commands`
    });
  }

  // Session style achievements
  if (stats.conversations.oneShotPercentage >= 80) {
    achievements.push({
      emoji: '⚡',
      name: 'Quick Draw',
      description: `${stats.conversations.oneShotPercentage}% one-shot sessions`
    });
  }

  if (stats.conversations.oneShotPercentage <= 20) {
    achievements.push({
      emoji: '🏊',
      name: 'Deep Diver',
      description: `Loves long, thorough conversations`
    });
  }

  return achievements.slice(0, 6); // Max 6 achievements
}

function getFunFacts(stats: Stats): string[] {
  const facts: string[] = [];

  // Character count to pages
  const totalChars = stats.overview.userMessages * stats.engagement.avgUserMessageLength;
  const pages = Math.round(totalChars / 1800); // ~1800 chars per page
  if (pages > 10) {
    facts.push(`You've typed enough to fill ${formatNumber(pages)} pages of a novel 📖`);
  }

  // AI response length
  facts.push(`AI generated ${stats.engagement.avgAssistantMessageLength} chars per response on average`);

  // Longest conversation
  if (stats.conversations.longestLength > 50) {
    facts.push(`Your longest conversation: ${stats.conversations.longestLength} messages! 🏆`);
  }

  // Time span
  if (stats.overview.timeSpanDays >= 30) {
    facts.push(`You've been using Cursor for ${stats.overview.timeSpanDays} days ${getTimeEmoji(12)}`);
  }

  // Average time
  if (stats.conversations.avgTimeBetweenTurns > 0) {
    const minutes = stats.conversations.avgTimeBetweenTurns;
    facts.push(`You ask for help every ~${Math.round(minutes)} minutes on average ⏰`);
  }

  return facts.slice(0, 6);
}
