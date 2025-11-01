import chalk from 'chalk';

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatPercentage(num: number): string {
  return `${num}%`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function createProgressBar(value: number, max: number, width: number = 20): string {
  if (max <= 0 || value < 0) {
    return chalk.gray('░'.repeat(width));
  }
  const percentage = Math.min(value / max, 1);
  const filled = Math.max(0, Math.round(percentage * width));
  const empty = Math.max(0, width - filled);
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

export function createBarChart(value: number, maxValue: number, width: number = 50): string {
  if (maxValue <= 0 || value < 0) {
    return '░'.repeat(width);
  }
  const percentage = value / maxValue;
  const filled = Math.max(0, Math.round(percentage * width));
  const empty = Math.max(0, width - filled);
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

export function createHeatmapCell(value: number, maxValue: number): string {
  if (value === 0 || maxValue <= 0) return chalk.gray('░');
  const percentage = value / maxValue;
  if (percentage < 0.25) return chalk.blue('▓');
  if (percentage < 0.5) return chalk.cyan('▓');
  if (percentage < 0.75) return chalk.yellow('▓');
  return chalk.red('█');
}

export function boxHeader(title: string, width: number = 74): string {
  const padding = Math.max(0, width - title.length - 2);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return (
    '╔' + '═'.repeat(width) + '╗\n' +
    '║' + ' '.repeat(leftPad) + title + ' '.repeat(rightPad) + '║\n' +
    '╠' + '═'.repeat(width) + '╣'
  );
}

export function boxDivider(width: number = 74): string {
  return '╠' + '═'.repeat(width) + '╣';
}

export function boxFooter(width: number = 74): string {
  return '╚' + '═'.repeat(width) + '╝';
}

export function boxLine(content: string, width: number = 74): string {
  const strippedContent = stripAnsi(content);
  const padding = Math.max(0, width - strippedContent.length);
  return '║ ' + content + ' '.repeat(Math.max(0, padding - 1)) + '║';
}

export function emptyLine(width: number = 74): string {
  return '║' + ' '.repeat(width) + '║';
}

export function sectionTitle(title: string): string {
  return chalk.bold.cyan(title);
}

export function subsectionTitle(title: string): string {
  return chalk.bold.white(title);
}

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[\d+m/g, '');
}

export function centerText(text: string, width: number): string {
  const stripped = stripAnsi(text);
  const padding = Math.max(0, width - stripped.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

export function padRight(text: string, width: number): string {
  const stripped = stripAnsi(text);
  const padding = Math.max(0, width - stripped.length);
  return text + ' '.repeat(padding);
}

export function padLeft(text: string, width: number): string {
  const stripped = stripAnsi(text);
  const padding = Math.max(0, width - stripped.length);
  return ' '.repeat(padding) + text;
}
