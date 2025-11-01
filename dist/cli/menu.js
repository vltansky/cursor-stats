import inquirer from 'inquirer';
import chalk from 'chalk';
import { displayDashboard } from './dashboard.js';
import { displayPushupChallenge } from './pushup-challenge.js';
export async function showMainMenu(stats) {
    while (true) {
        console.clear();
        console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
        console.log(chalk.bold.cyan('║    🚀 CURSOR STATS - Your AI Journey           ║'));
        console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝\n'));
        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to see?',
                choices: [
                    { name: '📊 Dashboard - The Big Picture', value: 'dashboard' },
                    { name: '🔍 Deep Dive - Analyze Everything', value: 'deepdive' },
                    { name: '💪 Pushup Challenge - Track Your "Rights"', value: 'pushups' },
                    { name: '📤 Export & Settings', value: 'export' },
                    new inquirer.Separator(),
                    { name: '👋 Exit', value: 'exit' }
                ]
            }
        ]);
        if (choice === 'exit') {
            console.clear();
            console.log(chalk.green('\n╔════════════════════════════════════════════════╗'));
            console.log(chalk.green('║              👋 Thanks for using               ║'));
            console.log(chalk.green('║            CURSOR STATS ANALYZER               ║'));
            console.log(chalk.green('╚════════════════════════════════════════════════╝\n'));
            console.log(chalk.gray('  Keep up the great work! 🚀\n'));
            process.exit(0);
        }
        switch (choice) {
            case 'dashboard':
                displayDashboard(stats);
                await waitForKey();
                break;
            case 'deepdive':
                await showDeepDiveMenu(stats);
                break;
            case 'pushups':
                displayPushupChallenge(stats.pushups);
                await waitForKey();
                break;
            case 'export':
                await showExportMenu(stats);
                break;
        }
    }
}
async function showDeepDiveMenu(stats) {
    while (true) {
        console.clear();
        console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
        console.log(chalk.bold.cyan('║          🔍 DEEP DIVE - Pick Your View         ║'));
        console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝\n'));
        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What do you want to explore?',
                choices: [
                    { name: '📈 Activity Trends (daily/weekly/monthly charts)', value: 'activity' },
                    { name: '💬 Conversation Patterns (length, sessions, turns)', value: 'conversations' },
                    { name: '⏰ Time Machine (when do you code?)', value: 'time' },
                    { name: '🤖 AI Interaction Style (how you use Cursor)', value: 'engagement' },
                    new inquirer.Separator(),
                    { name: '← Back to Main Menu', value: 'back' }
                ]
            }
        ]);
        if (choice === 'back') {
            return;
        }
        switch (choice) {
            case 'activity':
                await displayActivityTrends(stats);
                break;
            case 'conversations':
                await displayConversationPatterns(stats);
                break;
            case 'time':
                await displayTimeMachine(stats);
                break;
            case 'engagement':
                await displayEngagement(stats);
                break;
        }
    }
}
async function displayActivityTrends(stats) {
    console.clear();
    const lines = [];
    const width = 74;
    lines.push('╔' + '═'.repeat(width) + '╗');
    lines.push('║' + chalk.bold.cyan('                       📈 YOUR ACTIVITY TRENDS                            ') + '║');
    lines.push('╠' + '═'.repeat(width) + '╣');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('📊 LAST 30 DAYS') + ' '.repeat(width - 18) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    // Simple ASCII chart of last 30 days
    const maxMessages = Math.max(...stats.activity.last30Days.map(d => d.messages));
    const chartHeight = 10;
    for (let row = chartHeight; row >= 0; row--) {
        const threshold = (maxMessages / chartHeight) * row;
        let line = '║  ';
        if (row === chartHeight || row === chartHeight / 2 || row === 0) {
            line += chalk.gray(`${Math.round(threshold).toString().padStart(4)}│`);
        }
        else {
            line += '     │';
        }
        stats.activity.last30Days.forEach((day, i) => {
            if (i % 3 === 0) { // Show every 3rd day to fit
                if (day.messages >= threshold) {
                    line += chalk.green('▓');
                }
                else {
                    line += chalk.gray('░');
                }
            }
        });
        line += ' '.repeat(width - line.length + 6);
        lines.push(line + '║');
    }
    lines.push('║       └' + '─'.repeat(60) + ' '.repeat(width - 68) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    // Insights
    lines.push('║  ' + chalk.bold.white('💡 INSIGHTS') + ' '.repeat(width - 14) + '║');
    const currentWeekTotal = stats.activity.last30Days.slice(-7).reduce((sum, d) => sum + d.messages, 0);
    const previousWeekTotal = stats.activity.last30Days.slice(-14, -7).reduce((sum, d) => sum + d.messages, 0);
    const change = currentWeekTotal - previousWeekTotal;
    const changePercent = previousWeekTotal > 0 ? Math.round((change / previousWeekTotal) * 100) : 0;
    if (change > 0) {
        lines.push('║  • ' + chalk.green(`📈 Up ${changePercent}% from previous week`) + ' '.repeat(width - 35 - changePercent.toString().length) + '║');
    }
    lines.push('║  • 🔥 Most active: ' + stats.activity.mostActiveDay.date + ` (${stats.activity.mostActiveDay.count} msgs)` + ' '.repeat(width - 45 - stats.activity.mostActiveDay.date.length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('╚' + '═'.repeat(width) + '╝');
    console.log(lines.join('\n'));
    console.log(chalk.gray('\nPress any key to continue...\n'));
    await waitForKey();
}
async function displayConversationPatterns(stats) {
    console.clear();
    const lines = [];
    const width = 74;
    lines.push('╔' + '═'.repeat(width) + '╗');
    lines.push('║' + chalk.bold.cyan('                    💬 YOUR CONVERSATION STYLE                           ') + '║');
    lines.push('╠' + '═'.repeat(width) + '╣');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.yellow('🎯 THE EFFICIENT CODER') + ' '.repeat(width - 25) + '║');
    lines.push('║  You ask focused questions and get to the point quickly!' + ' '.repeat(width - 60) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  Average Conversation Length:  ' + chalk.bold(`${stats.conversations.avgLength} messages`) + ' '.repeat(width - 43 - stats.conversations.avgLength.toString().length) + '║');
    lines.push('║  Your Average Question:         ' + chalk.bold(`${stats.engagement.avgUserMessageLength} characters`) + ' '.repeat(width - 45 - stats.engagement.avgUserMessageLength.toString().length) + '║');
    lines.push('║  AI Average Response:           ' + chalk.bold(`${stats.engagement.avgAssistantMessageLength} characters`) + ' '.repeat(width - 45 - stats.engagement.avgAssistantMessageLength.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + '━'.repeat(70) + ' '.repeat(width - 73) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('📊 CONVERSATION LENGTH DISTRIBUTION') + ' '.repeat(width - 38) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    const total = stats.conversations.lengthDistribution.quick +
        stats.conversations.lengthDistribution.short +
        stats.conversations.lengthDistribution.medium +
        stats.conversations.lengthDistribution.epic;
    const distributions = [
        { label: 'Quick (1-5 msgs)', value: stats.conversations.lengthDistribution.quick, comment: '"In and out!"' },
        { label: 'Short (6-20)', value: stats.conversations.lengthDistribution.short, comment: '"Most common"' },
        { label: 'Medium (21-50)', value: stats.conversations.lengthDistribution.medium, comment: '"Deep work"' },
        { label: 'Epic (50+)', value: stats.conversations.lengthDistribution.epic, comment: '"Marathon coding"' }
    ];
    distributions.forEach(({ label, value, comment }) => {
        const percent = Math.round((value / total) * 100);
        const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5));
        lines.push('║  ' + label.padEnd(18) + chalk.green(bar) + `  ${percent}%  ${chalk.gray(comment)}` + ' '.repeat(Math.max(0, width - 55 - label.length - comment.length - percent.toString().length)) + '║');
    });
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  🏆 LONGEST CONVERSATION: ' + chalk.bold(`${stats.conversations.longestLength} messages`) + ' '.repeat(width - 39 - stats.conversations.longestLength.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('╚' + '═'.repeat(width) + '╝');
    console.log(lines.join('\n'));
    console.log(chalk.gray('\nPress any key to continue...\n'));
    await waitForKey();
}
async function displayTimeMachine(stats) {
    console.clear();
    const lines = [];
    const width = 74;
    lines.push('╔' + '═'.repeat(width) + '╗');
    lines.push('║' + chalk.bold.cyan('                      ⏰ YOUR CODING TIME MACHINE                        ') + '║');
    lines.push('╠' + '═'.repeat(width) + '╣');
    lines.push('║' + ' '.repeat(width) + '║');
    const isNightOwl = stats.time.nightOwlScore > 20;
    lines.push('║  ' + chalk.bold.yellow(isNightOwl ? '🦉 YOU\'RE A NIGHT OWL!' : '🌅 YOU\'RE AN EARLY BIRD!') + ' '.repeat(width - (isNightOwl ? 26 : 28)) + '║');
    const peakHourStr = stats.time.peakHour.hour === 12 ? '12pm' :
        stats.time.peakHour.hour > 12 ? `${stats.time.peakHour.hour - 12}pm` :
            stats.time.peakHour.hour === 0 ? '12am' : `${stats.time.peakHour.hour}am`;
    lines.push('║  Peak hours: ' + peakHourStr + ' ' + (stats.time.nightOwlScore > 20 ? '🌙' : '☀️') + ' '.repeat(width - 20 - peakHourStr.length) + '║');
    lines.push('║  Night owl score: ' + stats.time.nightOwlScore + '% 🌙' + ' '.repeat(width - 26 - stats.time.nightOwlScore.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + '━'.repeat(70) + ' '.repeat(width - 73) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('📅 DAY OF WEEK BREAKDOWN') + ' '.repeat(width - 28) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayEmojis = {
        'Monday': '💼',
        'Tuesday': '🔥',
        'Wednesday': '💚',
        'Thursday': '⚡',
        'Friday': '🎉',
        'Saturday': '😴',
        'Sunday': '🌴'
    };
    const maxDayCount = Math.max(...days.map(d => stats.time.dayOfWeekDistribution.get(d) || 0));
    days.forEach(day => {
        const count = stats.time.dayOfWeekDistribution.get(day) || 0;
        const percent = Math.round((count / maxDayCount) * 100);
        const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5));
        lines.push('║  ' + day.padEnd(11) + chalk.blue(bar) + `  ${percent}%  ${dayEmojis[day] || ''}` + ' '.repeat(width - 29 - day.length - percent.toString().length) + '║');
    });
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('╚' + '═'.repeat(width) + '╝');
    console.log(lines.join('\n'));
    console.log(chalk.gray('\nPress any key to continue...\n'));
    await waitForKey();
}
async function displayEngagement(stats) {
    console.clear();
    const lines = [];
    const width = 74;
    lines.push('╔' + '═'.repeat(width) + '╗');
    lines.push('║' + chalk.bold.cyan('                      🤖 AI INTERACTION STYLE                            ') + '║');
    lines.push('╠' + '═'.repeat(width) + '╣');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('User Engagement:') + ' '.repeat(width - 19) + '║');
    lines.push('║    Messages per Conversation:     ' + chalk.bold(`${stats.engagement.messagesPerConversation.user}`) + ' '.repeat(width - 39 - stats.engagement.messagesPerConversation.user.toString().length) + '║');
    lines.push('║    Average Message Length:        ' + chalk.bold(`${stats.engagement.avgUserMessageLength} chars`) + ' '.repeat(width - 42 - stats.engagement.avgUserMessageLength.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('Assistant Performance:') + ' '.repeat(width - 25) + '║');
    lines.push('║    Messages per Conversation:     ' + chalk.bold(`${stats.engagement.messagesPerConversation.assistant}`) + ' '.repeat(width - 39 - stats.engagement.messagesPerConversation.assistant.toString().length) + '║');
    lines.push('║    Average Message Length:        ' + chalk.bold(`${stats.engagement.avgAssistantMessageLength} chars`) + ' '.repeat(width - 42 - stats.engagement.avgAssistantMessageLength.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('Context Usage:') + ' '.repeat(width - 17) + '║');
    lines.push('║    Conversations with Context:    ' + chalk.bold(`${stats.engagement.conversationsWithContext} (${stats.engagement.contextPercentage}%)`) + ' '.repeat(width - 47 - stats.engagement.conversationsWithContext.toString().length - stats.engagement.contextPercentage.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('║  ' + chalk.bold.white('Agentic Mode:') + ' '.repeat(width - 16) + '║');
    lines.push('║    Agentic Conversations:         ' + chalk.bold(`${stats.engagement.agenticConversations} (${stats.engagement.agenticPercentage}%)`) + ' '.repeat(width - 47 - stats.engagement.agenticConversations.toString().length - stats.engagement.agenticPercentage.toString().length) + '║');
    lines.push('║' + ' '.repeat(width) + '║');
    lines.push('╚' + '═'.repeat(width) + '╝');
    console.log(lines.join('\n'));
    console.log(chalk.gray('\nPress any key to continue...\n'));
    await waitForKey();
}
async function showExportMenu(stats) {
    console.clear();
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║           📤 EXPORT & SETTINGS                 ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝\n'));
    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Export options:',
            choices: [
                { name: '📄 Full Report (Markdown)', value: 'markdown' },
                { name: '📊 Data Dump (JSON)', value: 'json' },
                { name: '🎯 Quick Summary (Text)', value: 'summary' },
                new inquirer.Separator(),
                { name: '← Back to Main Menu', value: 'back' }
            ]
        }
    ]);
    if (choice !== 'back') {
        console.log(chalk.yellow('\n⚠️  Export functionality coming soon!\n'));
        await waitForKey();
    }
}
async function waitForKey() {
    // Check if stdin is a TTY
    if (!process.stdin.isTTY) {
        // In non-interactive mode (CI, pipes), just wait a moment
        return new Promise(resolve => setTimeout(resolve, 100));
    }
    return new Promise((resolve, reject) => {
        try {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            // Timeout after 5 minutes
            const timeout = setTimeout(() => {
                cleanup();
                resolve(); // Resolve instead of reject to allow continuation
            }, 300000);
            const cleanup = () => {
                clearTimeout(timeout);
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                process.stdin.pause();
            };
            process.stdin.once('data', () => {
                cleanup();
                resolve();
            });
            process.stdin.once('error', (err) => {
                cleanup();
                // Log error but don't reject
                console.error(chalk.red('Input error:', err.message));
                resolve();
            });
        }
        catch (error) {
            // If setRawMode fails, just continue
            resolve();
        }
    });
}
