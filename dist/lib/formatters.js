import chalk from 'chalk';
export function formatNumber(num) {
    return num.toLocaleString();
}
export function formatPercentage(num) {
    return `${num}%`;
}
export function formatDuration(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)}m`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
export function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function createProgressBar(value, max, width = 20) {
    const percentage = Math.min(value / max, 1);
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}
export function createBarChart(value, maxValue, width = 50) {
    const percentage = maxValue > 0 ? value / maxValue : 0;
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    return '▓'.repeat(filled) + '░'.repeat(empty);
}
export function createHeatmapCell(value, maxValue) {
    if (value === 0)
        return chalk.gray('░');
    const percentage = value / maxValue;
    if (percentage < 0.25)
        return chalk.blue('▓');
    if (percentage < 0.5)
        return chalk.cyan('▓');
    if (percentage < 0.75)
        return chalk.yellow('▓');
    return chalk.red('█');
}
export function boxHeader(title, width = 74) {
    const padding = Math.max(0, width - title.length - 2);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ('╔' + '═'.repeat(width) + '╗\n' +
        '║' + ' '.repeat(leftPad) + title + ' '.repeat(rightPad) + '║\n' +
        '╠' + '═'.repeat(width) + '╣');
}
export function boxDivider(width = 74) {
    return '╠' + '═'.repeat(width) + '╣';
}
export function boxFooter(width = 74) {
    return '╚' + '═'.repeat(width) + '╝';
}
export function boxLine(content, width = 74) {
    const strippedContent = stripAnsi(content);
    const padding = Math.max(0, width - strippedContent.length);
    return '║ ' + content + ' '.repeat(padding - 1) + '║';
}
export function emptyLine(width = 74) {
    return '║' + ' '.repeat(width) + '║';
}
export function sectionTitle(title) {
    return chalk.bold.cyan(title);
}
export function subsectionTitle(title) {
    return chalk.bold.white(title);
}
export function stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\u001b\[\d+m/g, '');
}
export function centerText(text, width) {
    const stripped = stripAnsi(text);
    const padding = Math.max(0, width - stripped.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}
export function padRight(text, width) {
    const stripped = stripAnsi(text);
    const padding = Math.max(0, width - stripped.length);
    return text + ' '.repeat(padding);
}
export function padLeft(text, width) {
    const stripped = stripAnsi(text);
    const padding = Math.max(0, width - stripped.length);
    return ' '.repeat(padding) + text;
}
