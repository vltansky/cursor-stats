import inquirer from 'inquirer';
import chalk from 'chalk';
import { Stats } from '../lib/analyzer.js';
import { displayDashboard } from './dashboard.js';
import { displayPushupChallenge } from './pushup-challenge.js';

export async function showMainMenu(stats: Stats): Promise<void> {
  while (true) {
    console.clear();
    process.stdout.write('\x1b[H');
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

async function showExportMenu(stats: Stats): Promise<void> {
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

async function waitForKey(): Promise<void> {
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
    } catch (error) {
      // If setRawMode fails, just continue
      resolve();
    }
  });
}
