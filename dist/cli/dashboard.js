import chalk from 'chalk';
import { boxHeader, boxDivider, boxFooter, boxLine, emptyLine, formatNumber, formatDuration, formatDate, createProgressBar, createBarChart, padRight, sectionTitle } from '../lib/formatters.js';
export function displayDashboard(stats) {
    console.clear();
    const lines = [];
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
    lines.push(boxLine(`  💬 Conversations         ${padRight(formatNumber(stats.overview.totalConversations), 6)}    ${chalk.green('📈')} ${stats.activity.last30Days[29].conversations > stats.activity.last30Days[0].conversations ? 'Growing!' : 'Active'}`, width));
    lines.push(boxLine(`  💭 Messages             ${padRight(formatNumber(stats.overview.totalMessages), 7)}    ${chalk.green('💪')} Impressive!`, width));
    lines.push(boxLine(`  📊 Avg msgs/day            ${padRight(formatNumber(stats.overview.avgMessagesPerDay), 4)}`, width));
    lines.push(boxLine(`  🤖 AI Help Ratio          ${stats.overview.responseRatio}x    ${chalk.gray('(responses per question)')}`, width));
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
    const maxHourly = Math.max(...hours.map(h => h[1]));
    // Create 3 rows of hours (8 hours per row)
    for (let row = 0; row < 3; row++) {
        const startHour = row * 8;
        const endHour = startHour + 4;
        let line = '  ';
        for (let h = startHour; h < endHour; h++) {
            const count = stats.time.hourlyDistribution.get(h) || 0;
            const hourStr = h.toString().padStart(2, '0');
            const bar = createBarChart(count, maxHourly, 12);
            line += `${hourStr} ${bar}  `;
        }
        lines.push(boxLine(line.trimEnd(), width));
    }
    lines.push(emptyLine(width));
    // AI Interaction Style Section
    lines.push(boxDivider(width));
    lines.push(boxLine(sectionTitle('  🤖 YOUR AI INTERACTION STYLE'), width));
    lines.push(boxLine('  ' + '━'.repeat(70), width));
    lines.push(emptyLine(width));
    const agenticBar = createProgressBar(stats.engagement.agenticPercentage, 100, 20);
    lines.push(boxLine(`  Agentic Mode:      ${agenticBar}  ${stats.engagement.agenticPercentage}%`, width));
    lines.push(boxLine(chalk.gray(`  (AI working autonomously vs chat-only)`), width));
    lines.push(emptyLine(width));
    const oneShotBar = createProgressBar(stats.conversations.oneShotPercentage, 100, 20);
    lines.push(boxLine(`  One-Shot Sessions: ${oneShotBar}  ${stats.conversations.oneShotPercentage}%`, width));
    lines.push(boxLine(chalk.gray(`  (Quick Q&A vs back-and-forth discussion)`), width));
    lines.push(emptyLine(width));
    lines.push(boxLine(`  📊 ${formatNumber(stats.conversations.oneShotConversations)} quick Q&As  •  ${formatNumber(stats.conversations.multiShotConversations)} discussions`, width));
    lines.push(boxLine(`  🎯 Avg ${stats.engagement.messagesPerConversation.user} msgs to get answer`, width));
    lines.push(emptyLine(width));
    // Vibe-Coding Snapshot Section
    lines.push(boxDivider(width));
    lines.push(boxLine(sectionTitle('  ✨ VIBE-CODING SNAPSHOT'), width));
    lines.push(boxLine('  ' + '━'.repeat(70), width));
    lines.push(emptyLine(width));
    // Emotions
    const emotionEmojis = {
        frustrated: '😤',
        excited: '🎉',
        confused: '🤔',
        grateful: '🙏',
        neutral: '😐'
    };
    lines.push(boxLine(`  Mood:              ${chalk.bold.yellow(stats.emotions.topEmotion.toUpperCase())} ${emotionEmojis[stats.emotions.topEmotion]}  ${stats.emotions.yelling > 0 ? `(${stats.emotions.yelling} CAPS msgs 📢)` : ''}`, width));
    // Tasks
    const taskEmojis = {
        fix: '🐛', add: '✨', refactor: '♻️', delete: '🗑️', optimize: '⚡', test: '🧪', docs: '📝', none: '🤷'
    };
    lines.push(boxLine(`  Main Task:         ${chalk.bold.cyan(stats.tasks.topTaskType.toUpperCase())} ${taskEmojis[stats.tasks.topTaskType] || ''}  (${stats.tasks.totalTasks} total)`, width));
    // Thinking mode
    const thinkingEmojis = {
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
    // Learning
    if (stats.learning.questionsAsked > 0) {
        lines.push(boxLine(`  Questions Asked:   ${stats.learning.questionsAsked}  💡`, width));
    }
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
function getTimeEmoji(hour) {
    if (hour >= 5 && hour < 8)
        return '🌅';
    if (hour >= 8 && hour < 12)
        return '☀️';
    if (hour >= 12 && hour < 17)
        return '🌤️';
    if (hour >= 17 && hour < 20)
        return '🌆';
    return '🌙';
}
function getAchievements(stats) {
    const achievements = [];
    // Streak achievements
    if (stats.overview.currentStreak >= 7) {
        achievements.push({
            emoji: '🔥',
            name: 'Hot Streak',
            description: `${stats.overview.currentStreak} consecutive days`
        });
    }
    // Night owl vs early bird
    if (stats.time.nightOwlScore < 15) {
        achievements.push({
            emoji: '🌅',
            name: 'Early Bird',
            description: `${100 - stats.time.nightOwlScore}% of coding during daytime`
        });
    }
    else if (stats.time.nightOwlScore > 25) {
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
    if (stats.engagement.agenticPercentage > 10) {
        achievements.push({
            emoji: '🤖',
            name: 'AI Whisperer',
            description: `${stats.engagement.agenticPercentage}% AI acting autonomously (Composer, edits)`
        });
    }
    // Pushup achievement (Claude being too agreeable)
    if (stats.pushups.allTime >= 500) {
        achievements.push({
            emoji: '💪',
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
    if (stats.emotions.frustration >= 100) {
        achievements.push({
            emoji: '😤',
            name: 'Potty Mouth',
            description: `${stats.emotions.frustration} frustration moments (warrior!)`
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
function getFunFacts(stats) {
    const facts = [];
    // Character count to pages
    const totalChars = stats.overview.userMessages * stats.engagement.avgUserMessageLength;
    const pages = Math.round(totalChars / 1800); // ~1800 chars per page
    if (pages > 10) {
        facts.push(`You've typed enough to fill ${formatNumber(pages)} pages of a novel 📖`);
    }
    // AI response length
    facts.push(`AI generated ${stats.engagement.avgAssistantMessageLength} chars per response (like a long email)`);
    // Longest conversation
    if (stats.conversations.longestLength > 50) {
        facts.push(`Your longest conversation: ${stats.conversations.longestLength} messages! 🏆`);
    }
    // Time span
    if (stats.overview.timeSpanDays >= 30) {
        facts.push(`You've been using Cursor for ${stats.overview.timeSpanDays} days ${getTimeEmoji(12)}`);
    }
    // Response ratio
    if (stats.overview.responseRatio > 10) {
        facts.push(`AI gives you ${stats.overview.responseRatio}x more content than you ask for! 🤯`);
    }
    // Average time
    if (stats.conversations.avgTimeBetweenTurns > 0) {
        const minutes = stats.conversations.avgTimeBetweenTurns;
        facts.push(`You ask for help every ~${Math.round(minutes)} minutes on average ⏰`);
    }
    return facts.slice(0, 6);
}
