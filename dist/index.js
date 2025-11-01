#!/usr/bin/env node
import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import { getAllConversations } from './lib/database.js';
import { analyzeConversations } from './lib/analyzer.js';
import { showMainMenu } from './cli/menu.js';
// Setup signal handlers for graceful shutdown
function setupSignalHandlers() {
    const cleanup = () => {
        // Restore terminal state
        if (process.stdin.isTTY && process.stdin.isRaw) {
            process.stdin.setRawMode(false);
            process.stdin.pause();
        }
        console.log(chalk.yellow('\n\n👋 Goodbye!\n'));
        process.exit(0);
    };
    process.on('SIGINT', cleanup); // Ctrl+C
    process.on('SIGTERM', cleanup); // Kill command
    process.on('exit', () => {
        if (process.stdin.isTTY && process.stdin.isRaw) {
            process.stdin.setRawMode(false);
        }
    });
}
async function main() {
    setupSignalHandlers();
    const program = new Command();
    program
        .name('cursor-stats')
        .description('Interactive CLI for analyzing Cursor IDE usage statistics')
        .version('1.0.0')
        .option('-j, --json', 'output stats as JSON (non-interactive)')
        .option('-v, --verbose', 'enable verbose logging')
        .option('--no-color', 'disable colors')
        .addHelpText('after', `

Examples:
  $ cursor-stats              # Interactive mode
  $ cursor-stats --json       # Output JSON
  $ cursor-stats --version    # Show version
  $ cursor-stats --help       # Show this help
    `)
        .parse();
    const options = program.opts();
    // Disable colors if requested
    if (options.color === false) {
        chalk.level = 0;
    }
    console.clear();
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║         🚀 CURSOR STATS ANALYZER v1.0          ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝\n'));
    const spinner = ora('Loading your Cursor data...').start();
    try {
        // Load conversations from database
        const conversations = getAllConversations();
        if (conversations.length === 0) {
            spinner.fail(chalk.red('No conversations found in your Cursor database!'));
            console.log(chalk.yellow('\nMake sure you have used Cursor IDE and have some chat history.'));
            process.exit(1);
        }
        spinner.text = `Analyzing ${conversations.length} conversations...`;
        // Analyze all the data
        const stats = analyzeConversations(conversations);
        spinner.succeed(chalk.green(`Loaded ${conversations.length} conversations with ${stats.overview.totalMessages} messages!`));
        // JSON output mode (non-interactive)
        if (options.json) {
            console.log(JSON.stringify(stats, null, 2));
            process.exit(0);
        }
        console.log(chalk.gray(`\nData span: ${stats.overview.timeSpanDays} days (${stats.overview.oldestDate.toLocaleDateString()} - ${stats.overview.newestDate.toLocaleDateString()})\n`));
        // Wait a moment for user to see the success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Show the main menu
        await showMainMenu(stats);
    }
    catch (error) {
        spinner.fail(chalk.red('Error loading data'));
        if (error instanceof Error) {
            console.error(chalk.red('\nError: ' + error.message));
            if (error.message.includes('database not found')) {
                console.log(chalk.yellow('\nCursor database location should be at:'));
                console.log(chalk.gray('  macOS: ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb'));
                console.log(chalk.gray('  Windows: %APPDATA%/Cursor/User/globalStorage/state.vscdb'));
                console.log(chalk.gray('  Linux: ~/.config/Cursor/User/globalStorage/state.vscdb\n'));
            }
        }
        else {
            console.error(chalk.red('\nUnknown error occurred'));
        }
        process.exit(1);
    }
}
main();
