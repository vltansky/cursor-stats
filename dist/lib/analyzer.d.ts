import { Conversation } from './database.js';
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
    mostActiveDay: {
        date: string;
        count: number;
    };
    leastActiveDay: {
        date: string;
        count: number;
    };
    last30Days: Array<{
        date: string;
        messages: number;
        conversations: number;
    }>;
    weekdayDistribution: Map<string, number>;
    weekendVsWeekday: {
        weekday: number;
        weekend: number;
    };
}
export interface ConversationStats {
    avgLength: number;
    medianLength: number;
    shortestLength: number;
    longestLength: number;
    longestConversation: {
        id: string;
        length: number;
        date: Date;
    };
    lengthDistribution: {
        quick: number;
        short: number;
        medium: number;
        epic: number;
    };
    oneShotConversations: number;
    multiShotConversations: number;
    oneShotPercentage: number;
    multiDayConversations: number;
    avgTimeBetweenTurns: number;
    avgSessionDuration: number;
    longestSession: {
        duration: number;
        date: Date;
    };
}
export interface TimeStats {
    hourlyDistribution: Map<number, number>;
    peakHour: {
        hour: number;
        count: number;
    };
    dayOfWeekDistribution: Map<string, number>;
    mostProductiveDay: string;
    nightOwlScore: number;
    heatmap: Map<string, Map<number, number>>;
}
export interface EngagementStats {
    avgUserMessageLength: number;
    avgAssistantMessageLength: number;
    messagesPerConversation: {
        user: number;
        assistant: number;
    };
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
    topPhrases: Array<{
        phrase: string;
        count: number;
    }>;
    validationRate: number;
    currentStreak: number;
    bestStreak: number;
}
export interface EmotionalStats {
    frustration: number;
    excitement: number;
    confusion: number;
    gratitude: number;
    yelling: number;
    yellingPercentage: number;
    topEmotion: 'frustrated' | 'excited' | 'confused' | 'grateful' | 'neutral';
    emotionalRange: number;
}
export interface LearningStats {
    questionsAsked: number;
    howQuestions: number;
    whyQuestions: number;
    whatQuestions: number;
    teachingBack: number;
    ahaMoments: number;
    questionRate: number;
    curiosityScore: number;
}
export interface ThinkingStats {
    deepThinkingRequests: number;
    carefulRequests: number;
    speedRequests: number;
    experimentalRequests: number;
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
    uncertain: number;
    certain: number;
    exploratory: number;
    confidenceScore: number;
}
export interface CommunicationStats {
    polite: number;
    direct: number;
    collaborative: number;
    politenessScore: number;
    bossMode: number;
    partnerMode: number;
}
export declare function analyzeConversations(conversations: Conversation[]): Stats;
