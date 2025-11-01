import chalk from 'chalk';
import { boxHeader, boxDivider, boxFooter, boxLine, emptyLine, formatNumber, formatDuration, formatDate, createBarChart, padRight, sectionTitle } from '../lib/formatters.js';
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
    // What You're Building Section
    lines.push(boxDivider(width));
    lines.push(boxLine(sectionTitle('  💻 WHAT YOU\'RE BUILDING'), width));
    lines.push(boxLine('  ' + '━'.repeat(70), width));
    lines.push(emptyLine(width));
    // Note: We don't have language data yet in our analyzer
    // This is a placeholder - would need to parse code blocks
    lines.push(boxLine(`  📦 ${formatNumber(stats.overview.assistantMessages)} assistant messages generated`, width));
    lines.push(boxLine(`  📝 Avg message length: ${stats.engagement.avgAssistantMessageLength} characters`, width));
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
