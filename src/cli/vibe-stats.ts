import chalk from 'chalk';
import { Stats } from '../lib/analyzer.js';
import {
  boxHeader,
  boxDivider,
  boxFooter,
  boxLine,
  emptyLine,
  sectionTitle,
  createProgressBar,
  padRight
} from '../lib/formatters.js';

export function displayVibeStats(stats: Stats): void {
  console.clear();
  // Move cursor to top-left (0,0) to ensure output starts from top
  process.stdout.write('\x1b[H');

  const lines: string[] = [];
  const width = 74;

  // Header
  lines.push(boxHeader(chalk.bold.magenta('✨ VIBE-CODING INSIGHTS ✨'), width));
  lines.push(boxLine(chalk.gray('         Deep dive into your AI relationship'), width));
  lines.push(boxDivider(width));
  lines.push(emptyLine(width));

  // Emotional Journey
  lines.push(boxLine(sectionTitle('  🎭 YOUR EMOTIONAL JOURNEY'), width));
  lines.push(emptyLine(width));

  const emotions = [
    { label: '😤 Frustration', value: stats.emotions.frustration, emoji: '💢' },
    { label: '🎉 Excitement', value: stats.emotions.excitement, emoji: '✨' },
    { label: '🤔 Confusion', value: stats.emotions.confusion, emoji: '❓' },
    { label: '🙏 Gratitude', value: stats.emotions.gratitude, emoji: '💝' }
  ];

  const maxEmotion = Math.max(...emotions.map(e => e.value), 1);

  emotions.forEach(({ label, value, emoji }) => {
    const bar = createProgressBar(value, maxEmotion, 20);
    lines.push(boxLine(`  ${padRight(label, 15)} ${bar}  ${padRight(value.toString(), 4)} ${emoji}`, width));
  });

  lines.push(emptyLine(width));
  lines.push(boxLine(`  Top Emotion:       ${chalk.bold.yellow(stats.emotions.topEmotion.toUpperCase())} ${getEmotionEmoji(stats.emotions.topEmotion)}`, width));
  if (stats.emotions.yelling > 0) {
    lines.push(boxLine(`  CAPS LOCK Rage:    ${stats.emotions.yelling} msgs 📢 ${stats.emotions.yellingPercentage > 10 ? '😱 Calm down!' : '(counted in frustration)'}`, width));
  }
  lines.push(boxLine(`  Emotional Range:   ${stats.emotions.emotionalRange}/4 emotions ${stats.emotions.emotionalRange >= 3 ? '🎨 Expressive!' : ''}`, width));

  lines.push(emptyLine(width));

  // Learning Style
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🧠 YOUR LEARNING STYLE'), width));
  lines.push(emptyLine(width));

  lines.push(boxLine(`  Questions Asked:   ${chalk.bold.cyan(stats.learning.questionsAsked)} total`, width));
  lines.push(boxLine(`    • How questions:  ${stats.learning.howQuestions}`, width));
  lines.push(boxLine(`    • Why questions:  ${stats.learning.whyQuestions}`, width));
  lines.push(boxLine(`    • What questions: ${stats.learning.whatQuestions}`, width));
  lines.push(emptyLine(width));
  lines.push(boxLine(`  Teaching Back:     ${stats.learning.teachingBack} times  ${stats.learning.teachingBack > 50 ? '👨‍🏫 The Professor!' : ''}`, width));
  lines.push(boxLine(`  AHA Moments:       ${stats.learning.ahaMoments} 💡`, width));

  lines.push(emptyLine(width));

  // Thinking Mode
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎯 YOUR THINKING MODE'), width));
  lines.push(emptyLine(width));

  lines.push(boxLine(`  Deep Thinking:     ${stats.thinking.deepThinkingRequests} requests  ${stats.thinking.deepThinkingRequests > 20 ? '🧠 Philosopher!' : ''}`, width));
  lines.push(boxLine(`  Speed Mode:        ${stats.thinking.speedRequests} requests  ${stats.thinking.speedRequests > 50 ? '⚡ Speedrunner!' : ''}`, width));
  lines.push(boxLine(`  Experimental:      ${stats.thinking.experimentalRequests} tries  ${stats.thinking.experimentalRequests > 30 ? '🧪 Mad Scientist!' : ''}`, width));
  lines.push(boxLine(`  Careful Mode:      ${stats.thinking.carefulRequests} times`, width));
  lines.push(emptyLine(width));
  lines.push(boxLine(`  Primary Mode:      ${chalk.bold.green(stats.thinking.thinkingMode.toUpperCase())} ${getThinkingModeEmoji(stats.thinking.thinkingMode)}`, width));

  lines.push(emptyLine(width));

  // Task Distribution
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🛠️  WHAT YOU ACTUALLY DO'), width));
  lines.push(emptyLine(width));

  const taskTypes = [
    { label: '🐛 Fix', value: stats.tasks.fix },
    { label: '✨ Add', value: stats.tasks.add },
    { label: '♻️  Refactor', value: stats.tasks.refactor },
    { label: '🗑️  Delete', value: stats.tasks.delete },
    { label: '⚡ Optimize', value: stats.tasks.optimize },
    { label: '🧪 Test', value: stats.tasks.test },
    { label: '📝 Docs', value: stats.tasks.docs }
  ];

  const maxTask = Math.max(...taskTypes.map(t => t.value), 1);

  taskTypes.forEach(({ label, value }) => {
    const bar = createProgressBar(value, maxTask, 20);
    const percentage = stats.tasks.totalTasks > 0 ? Math.round((value / stats.tasks.totalTasks) * 100) : 0;
    lines.push(boxLine(`  ${padRight(label, 12)} ${bar}  ${padRight(value.toString(), 4)} (${percentage}%)`, width));
  });

  lines.push(emptyLine(width));
  lines.push(boxLine(`  Top Task Type:     ${chalk.bold.yellow(stats.tasks.topTaskType.toUpperCase())} ${getTaskEmoji(stats.tasks.topTaskType)}`, width));
  if (stats.tasks.fixVsAddRatio > 2) {
    lines.push(boxLine(`  ${chalk.yellow('⚠️  Warning:')} You fix ${stats.tasks.fixVsAddRatio}x more than you add! 🐛`, width));
  } else if (stats.tasks.fixVsAddRatio < 0.5) {
    lines.push(boxLine(`  ${chalk.green('✨ Nice!')} You create more than you fix! 🚀`, width));
  }

  lines.push(emptyLine(width));

  // Confidence Level
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎚️  CONFIDENCE METER'), width));
  lines.push(emptyLine(width));

  const confBar = createProgressBar(stats.confidence.confidenceScore, 100, 30);
  lines.push(boxLine(`  ${confBar} ${stats.confidence.confidenceScore}%`, width));
  lines.push(emptyLine(width));
  lines.push(boxLine(`  Certain:           ${stats.confidence.certain} times`, width));
  lines.push(boxLine(`  Uncertain:         ${stats.confidence.uncertain} times`, width));
  lines.push(boxLine(`  Exploratory:       ${stats.confidence.exploratory} times`, width));
  lines.push(emptyLine(width));

  const confLevel = getConfidenceLevel(stats.confidence.confidenceScore);
  lines.push(boxLine(`  You are:           ${chalk.bold.cyan(confLevel.name)} ${confLevel.emoji}`, width));
  lines.push(boxLine(chalk.gray(`  ${confLevel.description}`), width));

  lines.push(emptyLine(width));

  // Session Style - One-shot vs Multi-shot
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  🎯 SESSION STYLE'), width));
  lines.push(emptyLine(width));

  const oneShotBar = createProgressBar(stats.conversations.oneShotConversations, stats.conversations.oneShotConversations + stats.conversations.multiShotConversations, 30);
  const multiShotBar = createProgressBar(stats.conversations.multiShotConversations, stats.conversations.oneShotConversations + stats.conversations.multiShotConversations, 30);

  lines.push(boxLine(`  One-Shot Sessions: ${oneShotBar} ${stats.conversations.oneShotConversations}`, width));
  lines.push(boxLine(chalk.gray(`  (Quick Q&A: ask once, get answer, done)`), width));
  lines.push(emptyLine(width));
  lines.push(boxLine(`  Multi-Shot Sessions: ${multiShotBar} ${stats.conversations.multiShotConversations}`, width));
  lines.push(boxLine(chalk.gray(`  (Back-and-forth: 3+ messages of discussion)`), width));
  lines.push(emptyLine(width));

  const sessionStyle = getSessionStyle(stats.conversations.oneShotPercentage);
  lines.push(boxLine(`  You are:           ${chalk.bold.cyan(sessionStyle.name)} ${sessionStyle.emoji}`, width));
  lines.push(boxLine(chalk.gray(`  ${sessionStyle.description}`), width));

  lines.push(emptyLine(width));

  // Communication Style
  lines.push(boxDivider(width));
  lines.push(boxLine(sectionTitle('  💬 COMMUNICATION STYLE'), width));
  lines.push(emptyLine(width));

  lines.push(boxLine(`  Polite:            ${stats.communication.polite} times  ${stats.communication.politenessScore > 70 ? '😇 So nice!' : ''}`, width));
  lines.push(boxLine(`  Direct:            ${stats.communication.direct} times  ${stats.communication.direct > 100 ? '🎯 Boss Mode!' : ''}`, width));
  lines.push(boxLine(`  Collaborative:     ${stats.communication.collaborative} times  ${stats.communication.collaborative > 100 ? '🤝 Team Player!' : ''}`, width));
  lines.push(emptyLine(width));
  lines.push(boxLine(`  Politeness Score:  ${stats.communication.politenessScore}% ${getPolitenessBadge(stats.communication.politenessScore)}`, width));
  lines.push(emptyLine(width));

  const commStyle = getCommunicationStyle(stats.communication);
  lines.push(boxLine(`  You are:           ${chalk.bold.magenta(commStyle.name)} ${commStyle.emoji}`, width));
  lines.push(boxLine(chalk.gray(`  ${commStyle.description}`), width));

  lines.push(emptyLine(width));

  lines.push(boxFooter(width));

  console.log(lines.join('\n'));
  console.log(chalk.gray('\nPress any key to return to menu...\n'));
}

function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    frustrated: '😤',
    excited: '🎉',
    confused: '🤔',
    grateful: '🙏',
    neutral: '😐'
  };
  return emojis[emotion] || '😐';
}

function getThinkingModeEmoji(mode: string): string {
  const emojis: Record<string, string> = {
    deep: '🧠',
    speed: '⚡',
    experimental: '🧪',
    balanced: '⚖️'
  };
  return emojis[mode] || '⚖️';
}

function getTaskEmoji(task: string): string {
  const emojis: Record<string, string> = {
    fix: '🐛',
    add: '✨',
    refactor: '♻️',
    delete: '🗑️',
    optimize: '⚡',
    test: '🧪',
    docs: '📝',
    none: '🤷'
  };
  return emojis[task] || '🤷';
}

function getConfidenceLevel(score: number): { name: string; emoji: string; description: string } {
  if (score >= 80) return {
    name: 'Very Confident',
    emoji: '💪',
    description: 'You know what you want and you\'re not afraid to say it!'
  };
  if (score >= 60) return {
    name: 'Confident',
    emoji: '👍',
    description: 'Pretty sure about your approach most of the time'
  };
  if (score >= 40) return {
    name: 'Balanced',
    emoji: '⚖️',
    description: 'Good mix of certainty and openness to exploration'
  };
  if (score >= 20) return {
    name: 'Cautious',
    emoji: '🤔',
    description: 'You like to explore options before committing'
  };
  return {
    name: 'Very Exploratory',
    emoji: '🔍',
    description: 'You love to investigate and keep options open'
  };
}

function getPolitenessBadge(score: number): string {
  if (score >= 80) return '😇';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😤';
  return '👑 Boss Mode';
}

function getCommunicationStyle(comm: any): { name: string; emoji: string; description: string } {
  if (comm.politenessScore >= 70) return {
    name: 'Polite Partner',
    emoji: '😇',
    description: 'You treat AI with kindness and respect!'
  };
  if (comm.direct > comm.collaborative && comm.direct > comm.polite) return {
    name: 'The Boss',
    emoji: '👑',
    description: 'Direct and to the point - you know what you want!'
  };
  if (comm.collaborative > comm.direct && comm.collaborative > comm.polite) return {
    name: 'Team Player',
    emoji: '🤝',
    description: 'You see AI as a collaborative partner'
  };
  return {
    name: 'Balanced',
    emoji: '⚖️',
    description: 'Nice mix of different communication styles'
  };
}

function getSessionStyle(oneShotPercentage: number): { name: string; emoji: string; description: string } {
  if (oneShotPercentage >= 80) return {
    name: 'Quick Draw',
    emoji: '⚡',
    description: 'You ask, you get, you move on - efficiency master!'
  };
  if (oneShotPercentage >= 60) return {
    name: 'Mostly One-Shot',
    emoji: '🎯',
    description: 'You usually know what you want and get it fast'
  };
  if (oneShotPercentage >= 40) return {
    name: 'Balanced Explorer',
    emoji: '⚖️',
    description: 'Good mix of quick questions and deep discussions'
  };
  if (oneShotPercentage >= 20) return {
    name: 'Discussion Lover',
    emoji: '💬',
    description: 'You prefer back-and-forth conversations'
  };
  return {
    name: 'Deep Diver',
    emoji: '🏊',
    description: 'You love long, thorough conversations with AI'
  };
}
