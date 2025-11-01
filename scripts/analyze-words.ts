#!/usr/bin/env node

import { getUserMessages } from '../dist/lib/database.js';

const stopWords = new Set([
  // Articles and prepositions
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'including', 'against', 'among',
  'throughout', 'despite', 'towards', 'upon', 'concerning', 'as', 'like', 'than', 'so', 'that',
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'me', 'him', 'her', 'us', 'them',
  'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  // Verbs
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'am',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can',
  'get', 'got', 'make', 'makes', 'made',
  // Question words
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  // Determiners and quantifiers
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  // Adverbs and conjunctions
  'only', 'own', 'same', 'too', 'very', 'just', 'don', 'now', 'if', 'then', 'else', 'when',
  // Common programming words (too generic)
  'file', 'files', 'code', 'add', 'fix', 'remove', 'delete', 'change', 'update', 'create',
  'function', 'functions',
  // Programming keywords and common terms
  'class', 'const', 'let', 'var', 'type', 'interface', 'enum', 'import', 'export', 'return',
  'void', 'null', 'undefined', 'true', 'false', 'async', 'await', 'promise', 'catch', 'throw',
  'try', 'catch', 'finally', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue',
  'new', 'this', 'super', 'extends', 'implements', 'static', 'public', 'private', 'protected',
  'string', 'number', 'boolean', 'object', 'array', 'map', 'set', 'list', 'dict', 'tuple',
  'int', 'float', 'double', 'char', 'bool', 'void', 'byte', 'short', 'long',
  // Common programming patterns
  'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'html', 'css', 'js', 'ts', 'tsx',
  'jsx', 'json', 'xml', 'yaml', 'md', 'txt', 'py', 'java', 'cpp', 'cxx', 'hpp', 'h',
  'go', 'rs', 'rb', 'php', 'swift', 'kt', 'dart', 'vue', 'react', 'node', 'npm', 'yarn',
  'git', 'repo', 'github', 'gitlab', 'commit', 'branch', 'merge', 'pull', 'push',
  // Common abbreviations and tech terms
  'api', 'url', 'http', 'https', 'www', 'com', 'org', 'net', 'io', 'dev', 'app', 'lib',
  'src', 'dist', 'build', 'test', 'spec', 'config', 'env', 'log', 'tmp', 'temp',
  'jsvm', 'wasm', 'vm', 'dom', 'bom', 'css', 'html', 'xml', 'sql', 'db', 'mongo', 'redis',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'ci', 'cd', 'ui', 'ux',
  'id', 'ids', 'name', 'value', 'key', 'keys', 'data', 'props', 'state', 'ref', 'refs',
  'ctx', 'req', 'res', 'err', 'msg', 'obj', 'str', 'num', 'bool', 'arr', 'fn', 'cb'
]);

async function analyzeTopWords() {
  console.log('Loading user messages from Cursor database...\n');

  const userMessages = await getUserMessages();
  console.log(`Found ${userMessages.length} user messages\n`);

  const wordCounts = new Map<string, number>();
  let totalWords = 0;
  let filteredWords = 0;

  for (const message of userMessages) {
    let text = message.text;

    // Remove code blocks (content between ```, including language specifiers)
    text = text.replace(/```[\w]*\n[\s\S]*?```/g, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');

    // Remove inline code (content between `)
    text = text.replace(/`[^`\n]*`/g, ' ');

    // Remove URLs
    text = text.replace(/https?:\/\/[^\s]+/g, ' ');

    // Remove file paths (e.g., /path/to/file, ./file, ../file)
    text = text.replace(/[./][^\s]+\.[a-z]{2,4}/gi, ' ');
    text = text.replace(/\/[^\s]+/g, ' ');

    // Remove email addresses
    text = text.replace(/[^\s]+@[^\s]+\.[^\s]+/g, ' ');

    // Remove hex colors (#fff, #ffffff)
    text = text.replace(/#[0-9a-f]{3,6}\b/gi, ' ');

    // Remove version numbers (v1.0.0, 1.2.3)
    text = text.replace(/\bv?\d+\.\d+\.\d+/g, ' ');

    // Extract words (alphanumeric, minimum 3 characters, case-insensitive)
    const words = text.match(/\b[a-z]{3,}\b/gi);

    if (words) {
      for (const word of words) {
        const normalized = word.toLowerCase();

        // Skip stop words
        if (stopWords.has(normalized)) {
          filteredWords++;
          continue;
        }

        // Skip words that are all uppercase and short (likely acronyms or constants)
        if (word === word.toUpperCase() && word.length <= 5) {
          filteredWords++;
          continue;
        }

        // Skip if word contains numbers (likely code identifiers)
        if (/\d/.test(word)) {
          filteredWords++;
          continue;
        }

        // Skip very short words that slipped through
        if (normalized.length < 3) {
          filteredWords++;
          continue;
        }

        wordCounts.set(normalized, (wordCounts.get(normalized) || 0) + 1);
        totalWords++;
      }
    }
  }

  // Get top 1000 words
  const topWords = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 1000);

  console.log('='.repeat(80));
  console.log(`Total words analyzed: ${totalWords.toLocaleString()}`);
  console.log(`Total unique words: ${wordCounts.size.toLocaleString()}`);
  console.log(`Words filtered out: ${filteredWords.toLocaleString()}`);
  console.log(`Top 1000 words:`);
  console.log('='.repeat(80));
  console.log();

  // Group by ranges for easier analysis
  const ranges = [
    { label: 'Top 1-50', words: topWords.slice(0, 50) },
    { label: 'Top 51-100', words: topWords.slice(50, 100) },
    { label: 'Top 101-200', words: topWords.slice(100, 200) },
    { label: 'Top 201-500', words: topWords.slice(200, 500) },
    { label: 'Top 501-1000', words: topWords.slice(500, 1000) },
  ];

  for (const range of ranges) {
    if (range.words.length === 0) continue;

    console.log(`\n${range.label} (${range.words.length} words):`);
    console.log('-'.repeat(80));

    // Show words in columns for readability
    const wordsPerLine = 5;
    for (let i = 0; i < range.words.length; i += wordsPerLine) {
      const lineWords = range.words.slice(i, i + wordsPerLine);
      const line = lineWords
        .map(({ word, count }) => `${word.padEnd(15)} (${count.toString().padStart(4)})`)
        .join('  ');
      console.log(line);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nFull list (CSV format):');
  console.log('word,count');
  topWords.forEach(({ word, count }) => {
    console.log(`${word},${count}`);
  });
}

analyzeTopWords().catch(console.error);
