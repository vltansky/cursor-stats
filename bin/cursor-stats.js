#!/usr/bin/env node

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);

if (majorVersion < 18) {
  console.error('\x1b[31m❌ Error: Node.js 18 or higher is required\x1b[0m');
  console.error(`You are using Node.js ${nodeVersion}`);
  console.error('\nPlease upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

// Import and run
import('../dist/index.js').catch(err => {
  console.error('\x1b[31m❌ Failed to start cursor-stats:\x1b[0m');
  console.error(err.message);
  if (err.stack) {
    console.error('\n' + err.stack);
  }
  process.exit(1);
});
