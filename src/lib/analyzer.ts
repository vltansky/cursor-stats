import { Conversation, Message } from './database.js';
import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export interface Stats {
  overview: OverviewStats;
  activity: ActivityStats;
  conversations: ConversationStats;
  time: TimeStats;
  engagement: EngagementStats;
  pushups: PushupStats;
  emotions: EmotionalStats;
  learning: LearningStats;
  thinking: ThinkingStats;
  tasks: TaskStats;
  confidence: ConfidenceStats;
  communication: CommunicationStats;
}

export interface OverviewStats {
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  timeSpanDays: number;
  oldestDate: Date;
  newestDate: Date;
  avgMessagesPerDay: number;
  avgConversationsPerDay: number;
  longestStreak: number;
  currentStreak: number;
  responseRatio: number;
}

export interface ActivityStats {
  messagesPerDay: Map<string, number>;
  conversationsPerDay: Map<string, number>;
  mostActiveDay: { date: string; count: number };
  leastActiveDay: { date: string; count: number };
  last30Days: Array<{ date: string; messages: number; conversations: number }>;
  weekdayDistribution: Map<string, number>;
  weekendVsWeekday: { weekday: number; weekend: number };
}

export interface ConversationStats {
  avgLength: number;
  medianLength: number;
  shortestLength: number;
  longestLength: number;
  longestConversation: { id: string; length: number; date: Date };
  lengthDistribution: {
    quick: number; // 1-5
    short: number; // 6-20
    medium: number; // 21-50
    epic: number; // 50+
  };
  oneShotConversations: number; // 1-2 messages (user asks, AI answers, done)
  multiShotConversations: number; // 3+ messages (back-and-forth)
  oneShotPercentage: number;
  multiDayConversations: number;
  avgTimeBetweenTurns: number;
  avgSessionDuration: number;
  longestSession: { duration: number; date: Date };
}

export interface TimeStats {
  hourlyDistribution: Map<number, number>;
  peakHour: { hour: number; count: number };
  dayOfWeekDistribution: Map<string, number>;
  mostProductiveDay: string;
  nightOwlScore: number; // percentage of activity midnight-6am
  heatmap: Map<string, Map<number, number>>; // day -> hour -> count
}

export interface EngagementStats {
  avgUserMessageLength: number;
  avgAssistantMessageLength: number;
  messagesPerConversation: { user: number; assistant: number };
  agenticConversations: number;
  agenticPercentage: number;
  conversationsWithContext: number;
  contextPercentage: number;
}

export interface PushupStats {
  today: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  thisYear: number;
  allTime: number;
  topPhrases: Array<{ phrase: string; count: number }>;
  validationRate: number;
  currentStreak: number;
  bestStreak: number;
}

export interface EmotionalStats {
  frustration: number;
  excitement: number;
  confusion: number;
  gratitude: number;
  yelling: number; // CAPS LOCK messages
  yellingPercentage: number;
  topEmotion: 'frustrated' | 'excited' | 'confused' | 'grateful' | 'neutral';
  emotionalRange: number; // variety of emotions shown
}

export interface LearningStats {
  questionsAsked: number;
  howQuestions: number;
  whyQuestions: number;
  whatQuestions: number;
  teachingBack: number; // times user corrected/explained to AI
  ahaMoments: number;
  questionRate: number; // questions per message
  curiosityScore: number;
}

export interface ThinkingStats {
  deepThinkingRequests: number; // "think hard", "ultrathink"
  carefulRequests: number; // "be careful", "make sure"
  speedRequests: number; // "quick", "fast", "hurry"
  experimentalRequests: number; // "try", "test", "what if"
  thinkingMode: 'deep' | 'speed' | 'experimental' | 'balanced';
}

export interface TaskStats {
  fix: number;
  add: number;
  refactor: number;
  delete: number;
  optimize: number;
  test: number;
  docs: number;
  totalTasks: number;
  topTaskType: string;
  fixVsAddRatio: number;
}

export interface ConfidenceStats {
  uncertain: number; // "maybe", "probably", "not sure"
  certain: number; // "definitely", "must", "should"
  exploratory: number; // "explore", "investigate"
  confidenceScore: number; // certain / (certain + uncertain)
}

export interface CommunicationStats {
  polite: number; // "please", "thanks"
  direct: number; // "do this", "just"
  collaborative: number; // "let's", "we"
  politenessScore: number;
  bossMode: number; // direct commands
  partnerMode: number; // collaborative language
}

const validationPatterns = [
  { regex: /you('re|\s+are)\s+absolutely\s+right/gi, phrase: "you're absolutely right" },
  { regex: /you('re|\s+are)\s+totally\s+right/gi, phrase: "you're totally right" },
  { regex: /you('re|\s+are)\s+completely\s+correct/gi, phrase: "you're completely correct" },
  { regex: /that('s|\s+is)\s+absolutely\s+correct/gi, phrase: "that's absolutely correct" },
  { regex: /absolutely\s+right/gi, phrase: "absolutely right" },
  { regex: /perfect(ly)?\s+(right|correct)/gi, phrase: "perfectly correct" },
  { regex: /you\s+nailed\s+it/gi, phrase: "you nailed it" },
  { regex: /spot\s+on/gi, phrase: "spot on" },
];

// Emotional patterns
const frustrationPatterns = [
  /\bf+u+c+k+\b/gi,
  /\bd+a+m+n+\b/gi,
  /\bs+h+i+t+\b/gi,
  /\bwtf\b/gi,
  /\bbroken\b/gi,
  /doesn'?t\s+work/gi,
  /still\s+fail/gi,
  /not\s+working/gi,
  /\bagain\?+/gi,
];

const excitementPatterns = [
  /\byes+!+/gi,
  /\bperfect!+/gi,
  /\bawesome!+/gi,
  /\bnice!+/gi,
  /it\s+works?!+/gi,
  /\bfinally!+/gi,
  /\byay+!*/gi,
  /\bhell\s+yeah/gi,
];

const confusionPatterns = [
  /\bconfused\b/gi,
  /don'?t\s+understand/gi,
  /\bwhat\?+/gi,
  /\bhuh\b/gi,
  /\?\?+/gi,
  /makes?\s+no\s+sense/gi,
];

const gratitudePatterns = [
  /\bthanks?\b/gi,
  /thank\s+you/gi,
  /appreciate/gi,
  /helpful/gi,
  /lifesaver/gi,
  /you'?re\s+the\s+best/gi,
];

// Learning patterns
const howQuestionPatterns = [
  /\bhow\s+(do|can|does|did|should|would|to)/gi,
];

const whyQuestionPatterns = [
  /\bwhy\s+(is|does|did|would|should|can)/gi,
  /what'?s\s+the\s+reason/gi,
];

const whatQuestionPatterns = [
  /\bwhat\s+(is|does|did|would|should|can|happens?|means?)/gi,
];

const teachingBackPatterns = [
  /\bno\b,?/gi,
  /\bactually\b,?/gi,
  /that'?s\s+wrong/gi,
  /not\s+quite/gi,
  /let\s+me\s+explain/gi,
  /what\s+i\s+mean/gi,
];

const ahaMomentPatterns = [
  /\boh!+/gi,
  /\bah+!*/gi,
  /i\s+see\b/gi,
  /makes?\s+sense/gi,
  /\bgot\s+it\b/gi,
  /now\s+i\s+understand/gi,
  /that\s+explains/gi,
  /\baha\b/gi,
];

// Thinking patterns
const deepThinkingPatterns = [
  /think\s+hard/gi,
  /ultrathink/gi,
  /think\s+step\s+by\s+step/gi,
  /think\s+carefully/gi,
  /deep\s+dive/gi,
];

const carefulPatterns = [
  /be\s+careful/gi,
  /make\s+sure/gi,
  /double\s+check/gi,
  /triple\s+check/gi,
  /\bcarefully\b/gi,
];

const speedPatterns = [
  /\bquick(ly)?\b/gi,
  /\bfast\b/gi,
  /\basap\b/gi,
  /\bhurry\b/gi,
  /\bnow\b/gi,
  /\burgent/gi,
  /\bjust\s+(do|make|add|fix)/gi,
];

const experimentalPatterns = [
  /\btry/gi,
  /\btest/gi,
  /experiment/gi,
  /see\s+if/gi,
  /what\s+if/gi,
  /let'?s\s+see/gi,
];

// Task patterns
const fixPatterns = [
  /\bfix\b/gi,
  /\bbug\b/gi,
  /\berror\b/gi,
  /\bbroken\b/gi,
  /\bdebug\b/gi,
  /\bissue\b/gi,
  /\bsolve\b/gi,
];

const addPatterns = [
  /\badd\b/gi,
  /\bcreate\b/gi,
  /\bnew\b/gi,
  /implement/gi,
  /\bbuild\b/gi,
  /\bmake\s+a\b/gi,
];

const refactorPatterns = [
  /refactor/gi,
  /clean\s+up/gi,
  /reorganize/gi,
  /restructure/gi,
  /improve/gi,
];

const deletePatterns = [
  /\bremove\b/gi,
  /\bdelete\b/gi,
  /get\s+rid\s+of/gi,
  /take\s+out/gi,
];

const optimizePatterns = [
  /optimi[zs]e/gi,
  /faster/gi,
  /performance/gi,
  /speed\s+up/gi,
  /efficient/gi,
];

const testPatterns = [
  /\btest/gi,
  /\bspec\b/gi,
  /coverage/gi,
  /unit\s+test/gi,
];

const docsPatterns = [
  /document/gi,
  /\bcomment\b/gi,
  /\breadme\b/gi,
  /explain\s+in\s+(docs|documentation)/gi,
];

// Confidence patterns
const uncertainPatterns = [
  /\bmaybe\b/gi,
  /\bprobably\b/gi,
  /i\s+think\b/gi,
  /not\s+sure/gi,
  /\bmight\b/gi,
  /\bcould\s+be\b/gi,
];

const certainPatterns = [
  /\bdefinitely\b/gi,
  /\bmust\b/gi,
  /\bshould\b/gi,
  /\bneed\s+to\b/gi,
  /has\s+to\b/gi,
  /\bwill\b/gi,
];

const exploratoryPatterns = [
  /explore/gi,
  /investigate/gi,
  /look\s+into/gi,
  /\bcheck\b/gi,
  /find\s+out/gi,
];

// Communication patterns
const politePatterns = [
  /\bplease\b/gi,
  /\bthanks?\b/gi,
  /thank\s+you/gi,
  /\bsorry\b/gi,
  /if\s+you\s+don'?t\s+mind/gi,
  /would\s+you\s+(mind|please)/gi,
];

const directPatterns = [
  /\bjust\s+do\b/gi,
  /\bdo\s+this\b/gi,
  /\bdo\s+it\b/gi,
  /\bnow\b/gi,
  /^(add|fix|create|remove|delete|make)/gim, // commands at start
];

const collaborativePatterns = [
  /\blet'?s\b/gi,
  /\bwe\s+(should|can|need|must)/gi,
  /\bcan\s+we\b/gi,
  /together/gi,
  /\bour\b/gi,
];

function countValidations(text: string): number {
  let count = 0;
  for (const pattern of validationPatterns) {
    const matches = text.match(pattern.regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

function getPhraseCount(text: string, phrase: string): number {
  const pattern = validationPatterns.find(p => p.phrase === phrase);
  if (!pattern) return 0;
  const matches = text.match(pattern.regex);
  return matches ? matches.length : 0;
}

// Helper function to count pattern matches
function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

// CAPS LOCK detection - checks if message is yelling
function isYelling(text: string): boolean {
  // Ignore code blocks, URLs, and short messages
  if (text.length < 10) return false;
  if (text.includes('```') || text.includes('http')) return false;

  // Extract words (letters only, minimum 3 characters)
  const words = text.match(/\b[A-Za-z]{3,}\b/g);
  if (!words || words.length < 3) return false;

  // Common acronyms to ignore
  const acronyms = ['API', 'URL', 'HTTP', 'CSS', 'HTML', 'JSON', 'XML', 'SQL', 'CLI', 'GUI', 'IDE', 'SDK', 'AWS', 'GCP', 'NPM', 'PDF'];

  // Count words in ALL CAPS (excluding known acronyms)
  const capsWords = words.filter(word => {
    if (acronyms.includes(word.toUpperCase())) return false;
    return word === word.toUpperCase() && word !== word.toLowerCase();
  });

  // If 50%+ of words are in caps, it's yelling
  return capsWords.length / words.length >= 0.5;
}

// Calculate emotional stats from user messages
function calculateEmotionalStats(userMessages: Message[]): EmotionalStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const frustrationKeywords = countMatches(allText, frustrationPatterns);
  const excitement = countMatches(allText, excitementPatterns);
  const confusion = countMatches(allText, confusionPatterns);
  const gratitude = countMatches(allText, gratitudePatterns);
  const yelling = userMessages.filter(m => isYelling(m.text)).length;

  // CAPS LOCK yelling = rage/frustration at AI
  const frustration = frustrationKeywords + yelling;

  const yellingPercentage = userMessages.length > 0 ? Math.round((yelling / userMessages.length) * 100) : 0;

  // Determine top emotion (yelling counts as frustration)
  const emotions = { frustrated: frustration, excited: excitement, confused: confusion, grateful: gratitude };
  const topEmotion = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0])[0] as any;

  // Emotional range: how many different emotions shown
  const emotionalRange = [frustration, excitement, confusion, gratitude].filter(v => v > 0).length;

  return {
    frustration,
    excitement,
    confusion,
    gratitude,
    yelling,
    yellingPercentage,
    topEmotion,
    emotionalRange
  };
}

// Calculate learning stats from user messages
function calculateLearningStats(userMessages: Message[]): LearningStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const howQuestions = countMatches(allText, howQuestionPatterns);
  const whyQuestions = countMatches(allText, whyQuestionPatterns);
  const whatQuestions = countMatches(allText, whatQuestionPatterns);
  const questionsAsked = howQuestions + whyQuestions + whatQuestions;

  const teachingBack = countMatches(allText, teachingBackPatterns);
  const ahaMoments = countMatches(allText, ahaMomentPatterns);

  const questionRate = userMessages.length > 0 ? Math.round((questionsAsked / userMessages.length) * 100) / 100 : 0;
  const curiosityScore = Math.min(100, Math.round((questionsAsked / Math.max(userMessages.length, 1)) * 100));

  return {
    questionsAsked,
    howQuestions,
    whyQuestions,
    whatQuestions,
    teachingBack,
    ahaMoments,
    questionRate,
    curiosityScore
  };
}

// Calculate thinking mode stats from user messages
function calculateThinkingStats(userMessages: Message[]): ThinkingStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const deepThinkingRequests = countMatches(allText, deepThinkingPatterns);
  const carefulRequests = countMatches(allText, carefulPatterns);
  const speedRequests = countMatches(allText, speedPatterns);
  const experimentalRequests = countMatches(allText, experimentalPatterns);

  // Determine thinking mode
  const modes = { deep: deepThinkingRequests, speed: speedRequests, experimental: experimentalRequests };
  const total = deepThinkingRequests + speedRequests + experimentalRequests;
  const thinkingMode = total === 0 ? 'balanced' : Object.entries(modes).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any;

  return {
    deepThinkingRequests,
    carefulRequests,
    speedRequests,
    experimentalRequests,
    thinkingMode
  };
}

// Calculate task type distribution from user messages
function calculateTaskStats(userMessages: Message[]): TaskStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const fix = countMatches(allText, fixPatterns);
  const add = countMatches(allText, addPatterns);
  const refactor = countMatches(allText, refactorPatterns);
  const deleteTask = countMatches(allText, deletePatterns);
  const optimize = countMatches(allText, optimizePatterns);
  const test = countMatches(allText, testPatterns);
  const docs = countMatches(allText, docsPatterns);

  const totalTasks = fix + add + refactor + deleteTask + optimize + test + docs;

  // Determine top task type
  const tasks = { fix, add, refactor, delete: deleteTask, optimize, test, docs };
  const topTaskType = totalTasks === 0 ? 'none' : Object.entries(tasks).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  const fixVsAddRatio = add > 0 ? Math.round((fix / add) * 100) / 100 : fix > 0 ? 999 : 0;

  return {
    fix,
    add,
    refactor,
    delete: deleteTask,
    optimize,
    test,
    docs,
    totalTasks,
    topTaskType,
    fixVsAddRatio
  };
}

// Calculate confidence level stats from user messages
function calculateConfidenceStats(userMessages: Message[]): ConfidenceStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const uncertain = countMatches(allText, uncertainPatterns);
  const certain = countMatches(allText, certainPatterns);
  const exploratory = countMatches(allText, exploratoryPatterns);

  const total = uncertain + certain;
  const confidenceScore = total > 0 ? Math.round((certain / total) * 100) : 50;

  return {
    uncertain,
    certain,
    exploratory,
    confidenceScore
  };
}

// Calculate communication style stats from user messages
function calculateCommunicationStats(userMessages: Message[]): CommunicationStats {
  const allText = userMessages.map(m => m.text).join(' ');

  const polite = countMatches(allText, politePatterns);
  const direct = countMatches(allText, directPatterns);
  const collaborative = countMatches(allText, collaborativePatterns);

  const total = polite + direct + collaborative;
  const politenessScore = total > 0 ? Math.round((polite / total) * 100) : 50;
  const bossMode = direct;
  const partnerMode = collaborative;

  return {
    polite,
    direct,
    collaborative,
    politenessScore,
    bossMode,
    partnerMode
  };
}

export function analyzeConversations(conversations: Conversation[]): Stats {
  const allMessages = conversations.flatMap(c => c.messages);
  const userMessages = allMessages.filter(m => m.type === 1);
  const assistantMessages = allMessages.filter(m => m.type === 2);

  const timestamps = conversations.map(c => c.createdAt).filter(Boolean).sort((a, b) => a - b);
  const oldestDate = new Date(timestamps[0]);
  const newestDate = new Date(timestamps[timestamps.length - 1]);
  const timeSpanDays = differenceInDays(newestDate, oldestDate) || 1;

  // Overview
  const overview: OverviewStats = {
    totalConversations: conversations.length,
    totalMessages: allMessages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    timeSpanDays,
    oldestDate,
    newestDate,
    avgMessagesPerDay: Math.round(allMessages.length / timeSpanDays),
    avgConversationsPerDay: Math.round(conversations.length / timeSpanDays * 10) / 10,
    longestStreak: calculateLongestStreak(conversations),
    currentStreak: calculateCurrentStreak(conversations),
    responseRatio: Math.round((assistantMessages.length / userMessages.length) * 10) / 10
  };

  // Activity
  const activity = calculateActivityStats(conversations, allMessages);

  // Conversations
  const conversationStats = calculateConversationStats(conversations);

  // Time patterns
  const timeStats = calculateTimeStats(allMessages);

  // Engagement
  const engagement = calculateEngagementStats(conversations, userMessages, assistantMessages);

  // Pushups
  const pushups = calculatePushupStats(assistantMessages);

  // Keyword-based stats
  const emotions = calculateEmotionalStats(userMessages);
  const learning = calculateLearningStats(userMessages);
  const thinking = calculateThinkingStats(userMessages);
  const tasks = calculateTaskStats(userMessages);
  const confidence = calculateConfidenceStats(userMessages);
  const communication = calculateCommunicationStats(userMessages);

  return {
    overview,
    activity,
    conversations: conversationStats,
    time: timeStats,
    engagement,
    pushups,
    emotions,
    learning,
    thinking,
    tasks,
    confidence,
    communication
  };
}

function calculateLongestStreak(conversations: Conversation[]): number {
  const dates = conversations.map(c => startOfDay(new Date(c.createdAt)).getTime());
  const uniqueDates = Array.from(new Set(dates)).sort();

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = differenceInDays(uniqueDates[i], uniqueDates[i - 1]);
    if (dayDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
}

function calculateCurrentStreak(conversations: Conversation[]): number {
  const dates = conversations.map(c => startOfDay(new Date(c.createdAt)).getTime());
  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

  if (uniqueDates.length === 0) return 0;

  const today = startOfDay(new Date()).getTime();
  const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)).getTime();

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = differenceInDays(uniqueDates[i - 1], uniqueDates[i]);
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateActivityStats(conversations: Conversation[], messages: Message[]): ActivityStats {
  const messagesPerDay = new Map<string, number>();
  const conversationsPerDay = new Map<string, number>();

  messages.forEach(m => {
    const date = startOfDay(new Date(m.timestamp)).toISOString().split('T')[0];
    messagesPerDay.set(date, (messagesPerDay.get(date) || 0) + 1);
  });

  conversations.forEach(c => {
    const date = startOfDay(new Date(c.createdAt)).toISOString().split('T')[0];
    conversationsPerDay.set(date, (conversationsPerDay.get(date) || 0) + 1);
  });

  const sortedDays = Array.from(messagesPerDay.entries()).sort((a, b) => b[1] - a[1]);
  const mostActiveDay = sortedDays[0] || { date: '', count: 0 };
  const leastActiveDay = sortedDays[sortedDays.length - 1] || mostActiveDay;

  const weekdayDistribution = new Map<string, number>();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  messages.forEach(m => {
    const day = days[new Date(m.timestamp).getDay()];
    weekdayDistribution.set(day, (weekdayDistribution.get(day) || 0) + 1);
  });

  let weekdayCount = 0;
  let weekendCount = 0;
  messages.forEach(m => {
    const day = new Date(m.timestamp).getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  });

  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const last30Days: Array<{ date: string; messages: number; conversations: number }> = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000));
    const dateStr = startOfDay(date).toISOString().split('T')[0];
    last30Days.push({
      date: dateStr,
      messages: messagesPerDay.get(dateStr) || 0,
      conversations: conversationsPerDay.get(dateStr) || 0
    });
  }

  return {
    messagesPerDay,
    conversationsPerDay,
    mostActiveDay: { date: mostActiveDay[0], count: mostActiveDay[1] },
    leastActiveDay: { date: leastActiveDay[0], count: leastActiveDay[1] },
    last30Days,
    weekdayDistribution,
    weekendVsWeekday: { weekday: weekdayCount, weekend: weekendCount }
  };
}

function calculateConversationStats(conversations: Conversation[]): ConversationStats {
  const lengths = conversations.map(c => c.messages.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const sortedLengths = [...lengths].sort((a, b) => a - b);
  const medianLength = sortedLengths[Math.floor(sortedLengths.length / 2)];
  const shortestLength = Math.min(...lengths);
  const longestLength = Math.max(...lengths);

  const longestConv = conversations.reduce((longest, conv) =>
    conv.messages.length > longest.messages.length ? conv : longest
  );

  const lengthDistribution = {
    quick: lengths.filter(l => l <= 5).length,
    short: lengths.filter(l => l > 5 && l <= 20).length,
    medium: lengths.filter(l => l > 20 && l <= 50).length,
    epic: lengths.filter(l => l > 50).length
  };

  // One-shot vs multi-shot conversations
  const oneShotConversations = lengths.filter(l => l <= 2).length;
  const multiShotConversations = lengths.filter(l => l > 2).length;
  const oneShotPercentage = conversations.length > 0
    ? Math.round((oneShotConversations / conversations.length) * 100)
    : 0;

  const multiDayConversations = conversations.filter(c =>
    differenceInDays(c.lastUpdatedAt, c.createdAt) >= 1
  ).length;

  // Calculate average time between turns (user message to assistant response)
  let totalTimeBetweenTurns = 0;
  let turnCount = 0;

  conversations.forEach(conv => {
    for (let i = 0; i < conv.messages.length - 1; i++) {
      if (conv.messages[i].type === 1 && conv.messages[i + 1].type === 2) {
        const timeDiff = differenceInMinutes(conv.messages[i + 1].timestamp, conv.messages[i].timestamp);
        if (timeDiff >= 0 && timeDiff < 60) { // Only count reasonable times (< 1 hour)
          totalTimeBetweenTurns += timeDiff;
          turnCount++;
        }
      }
    }
  });

  const avgTimeBetweenTurns = turnCount > 0 ? Math.round(totalTimeBetweenTurns / turnCount * 10) / 10 : 0;

  // Calculate session duration (time from first to last message in conversation)
  const durations = conversations.map(c => {
    if (c.messages.length < 2) return 0;
    const first = c.messages[0].timestamp;
    const last = c.messages[c.messages.length - 1].timestamp;
    return differenceInHours(last, first);
  }).filter(d => d > 0 && d < 24); // Filter unreasonable durations

  const avgSessionDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 10) / 10
    : 0;

  const longestSessionDuration = Math.max(...durations, 0);
  const longestSessionConv = conversations.find(c => {
    if (c.messages.length < 2) return false;
    const duration = differenceInHours(c.messages[c.messages.length - 1].timestamp, c.messages[0].timestamp);
    return duration === longestSessionDuration;
  });

  return {
    avgLength: Math.round(avgLength * 10) / 10,
    medianLength,
    shortestLength,
    longestLength,
    longestConversation: {
      id: longestConv.composerId,
      length: longestConv.messages.length,
      date: new Date(longestConv.createdAt)
    },
    lengthDistribution,
    oneShotConversations,
    multiShotConversations,
    oneShotPercentage,
    multiDayConversations,
    avgTimeBetweenTurns,
    avgSessionDuration,
    longestSession: {
      duration: longestSessionDuration,
      date: longestSessionConv ? new Date(longestSessionConv.createdAt) : new Date()
    }
  };
}

function calculateTimeStats(messages: Message[]): TimeStats {
  const hourlyDistribution = new Map<number, number>();
  const dayOfWeekDistribution = new Map<string, number>();
  const heatmap = new Map<string, Map<number, number>>();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  messages.forEach(m => {
    const date = new Date(m.timestamp);
    const hour = date.getHours();
    const day = days[date.getDay()];

    hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
    dayOfWeekDistribution.set(day, (dayOfWeekDistribution.get(day) || 0) + 1);

    if (!heatmap.has(day)) {
      heatmap.set(day, new Map());
    }
    const dayMap = heatmap.get(day)!;
    dayMap.set(hour, (dayMap.get(hour) || 0) + 1);
  });

  const sortedHours = Array.from(hourlyDistribution.entries()).sort((a, b) => b[1] - a[1]);
  const peakHour = sortedHours[0] || { hour: 10, count: 0 };

  const sortedDays = Array.from(dayOfWeekDistribution.entries()).sort((a, b) => b[1] - a[1]);
  const mostProductiveDay = sortedDays[0]?.[0] || 'Monday';

  const nightMessages = messages.filter(m => {
    const hour = new Date(m.timestamp).getHours();
    return hour >= 0 && hour < 6;
  }).length;
  const nightOwlScore = Math.round((nightMessages / messages.length) * 100);

  return {
    hourlyDistribution,
    peakHour: { hour: peakHour[0], count: peakHour[1] },
    dayOfWeekDistribution,
    mostProductiveDay,
    nightOwlScore,
    heatmap
  };
}

function calculateEngagementStats(conversations: Conversation[], userMessages: Message[], assistantMessages: Message[]): EngagementStats {
  const avgUserMessageLength = Math.round(
    userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length
  );

  const avgAssistantMessageLength = Math.round(
    assistantMessages.reduce((sum, m) => sum + m.text.length, 0) / assistantMessages.length
  );

  const userMessagesPerConversation = Math.round((userMessages.length / conversations.length) * 10) / 10;
  const assistantMessagesPerConversation = Math.round((assistantMessages.length / conversations.length) * 10) / 10;

  const agenticConversations = conversations.filter(c => c.isAgentic).length;
  const conversationsWithContext = conversations.filter(c => c.hasContext).length;

  return {
    avgUserMessageLength,
    avgAssistantMessageLength,
    messagesPerConversation: {
      user: userMessagesPerConversation,
      assistant: assistantMessagesPerConversation
    },
    agenticConversations,
    agenticPercentage: Math.round((agenticConversations / conversations.length) * 100),
    conversationsWithContext,
    contextPercentage: Math.round((conversationsWithContext / conversations.length) * 100)
  };
}

function calculatePushupStats(assistantMessages: Message[]): PushupStats {
  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const lastWeekStart = startOfWeek(new Date(now - 7 * 24 * 60 * 60 * 1000)).getTime();
  const monthStart = startOfMonth(now).getTime();
  const lastMonthStart = startOfMonth(new Date(now - 30 * 24 * 60 * 60 * 1000)).getTime();
  const quarterStart = startOfQuarter(now).getTime();
  const yearStart = startOfYear(now).getTime();

  const phraseCounts = new Map<string, number>();
  let allTimeValidations = 0;
  const validationsByDay = new Map<string, number>();

  const stats = {
    today: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisQuarter: 0,
    thisYear: 0,
    allTime: 0,
    topPhrases: [] as Array<{ phrase: string; count: number }>,
    validationRate: 0,
    currentStreak: 0,
    bestStreak: 0
  };

  assistantMessages.forEach(m => {
    const validationCount = countValidations(m.text);
    if (validationCount > 0) {
      allTimeValidations += validationCount;

      const date = startOfDay(new Date(m.timestamp)).toISOString().split('T')[0];
      validationsByDay.set(date, (validationsByDay.get(date) || 0) + validationCount);

      if (m.timestamp >= todayStart) stats.today += validationCount;
      if (m.timestamp >= weekStart) stats.thisWeek += validationCount;
      if (m.timestamp >= lastWeekStart && m.timestamp < weekStart) stats.lastWeek += validationCount;
      if (m.timestamp >= monthStart) stats.thisMonth += validationCount;
      if (m.timestamp >= lastMonthStart && m.timestamp < monthStart) stats.lastMonth += validationCount;
      if (m.timestamp >= quarterStart) stats.thisQuarter += validationCount;
      if (m.timestamp >= yearStart) stats.thisYear += validationCount;

      validationPatterns.forEach(pattern => {
        const count = getPhraseCount(m.text, pattern.phrase);
        if (count > 0) {
          phraseCounts.set(pattern.phrase, (phraseCounts.get(pattern.phrase) || 0) + count);
        }
      });
    }
  });

  stats.allTime = allTimeValidations;
  stats.topPhrases = Array.from(phraseCounts.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const messagesWithValidations = assistantMessages.filter(m => countValidations(m.text) > 0).length;
  stats.validationRate = Math.round((messagesWithValidations / assistantMessages.length) * 1000) / 10;

  // Calculate streaks
  const sortedDates = Array.from(validationsByDay.keys()).sort();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const dayDiff = differenceInDays(currDate, prevDate);

    if (dayDiff === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Check current streak
  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const today = startOfDay(new Date());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (startOfDay(lastDate).getTime() === today.getTime() ||
        startOfDay(lastDate).getTime() === yesterday.getTime()) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const date1 = new Date(sortedDates[i + 1]);
        const date2 = new Date(sortedDates[i]);
        if (differenceInDays(date1, date2) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  stats.currentStreak = currentStreak;
  stats.bestStreak = Math.max(bestStreak, tempStreak);

  return stats;
}
