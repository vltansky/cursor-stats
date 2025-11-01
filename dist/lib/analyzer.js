import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
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
function countValidations(text) {
    let count = 0;
    for (const pattern of validationPatterns) {
        const matches = text.match(pattern.regex);
        if (matches) {
            count += matches.length;
        }
    }
    return count;
}
function getPhraseCount(text, phrase) {
    const pattern = validationPatterns.find(p => p.phrase === phrase);
    if (!pattern)
        return 0;
    const matches = text.match(pattern.regex);
    return matches ? matches.length : 0;
}
export function analyzeConversations(conversations) {
    const allMessages = conversations.flatMap(c => c.messages);
    const userMessages = allMessages.filter(m => m.type === 1);
    const assistantMessages = allMessages.filter(m => m.type === 2);
    const timestamps = conversations.map(c => c.createdAt).filter(Boolean).sort((a, b) => a - b);
    const oldestDate = new Date(timestamps[0]);
    const newestDate = new Date(timestamps[timestamps.length - 1]);
    const timeSpanDays = differenceInDays(newestDate, oldestDate) || 1;
    // Overview
    const overview = {
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
    return {
        overview,
        activity,
        conversations: conversationStats,
        time: timeStats,
        engagement,
        pushups
    };
}
function calculateLongestStreak(conversations) {
    const dates = conversations.map(c => startOfDay(new Date(c.createdAt)).getTime());
    const uniqueDates = Array.from(new Set(dates)).sort();
    let longestStreak = 0;
    let currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const dayDiff = differenceInDays(uniqueDates[i], uniqueDates[i - 1]);
        if (dayDiff === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        }
        else {
            currentStreak = 1;
        }
    }
    return Math.max(longestStreak, currentStreak);
}
function calculateCurrentStreak(conversations) {
    const dates = conversations.map(c => startOfDay(new Date(c.createdAt)).getTime());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);
    if (uniqueDates.length === 0)
        return 0;
    const today = startOfDay(new Date()).getTime();
    const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)).getTime();
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday)
        return 0;
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const dayDiff = differenceInDays(uniqueDates[i - 1], uniqueDates[i]);
        if (dayDiff === 1) {
            streak++;
        }
        else {
            break;
        }
    }
    return streak;
}
function calculateActivityStats(conversations, messages) {
    const messagesPerDay = new Map();
    const conversationsPerDay = new Map();
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
    const weekdayDistribution = new Map();
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
        }
        else {
            weekdayCount++;
        }
    });
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const last30Days = [];
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
function calculateConversationStats(conversations) {
    const lengths = conversations.map(c => c.messages.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const sortedLengths = [...lengths].sort((a, b) => a - b);
    const medianLength = sortedLengths[Math.floor(sortedLengths.length / 2)];
    const shortestLength = Math.min(...lengths);
    const longestLength = Math.max(...lengths);
    const longestConv = conversations.reduce((longest, conv) => conv.messages.length > longest.messages.length ? conv : longest);
    const lengthDistribution = {
        quick: lengths.filter(l => l <= 5).length,
        short: lengths.filter(l => l > 5 && l <= 20).length,
        medium: lengths.filter(l => l > 20 && l <= 50).length,
        epic: lengths.filter(l => l > 50).length
    };
    const multiDayConversations = conversations.filter(c => differenceInDays(c.lastUpdatedAt, c.createdAt) >= 1).length;
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
        if (c.messages.length < 2)
            return 0;
        const first = c.messages[0].timestamp;
        const last = c.messages[c.messages.length - 1].timestamp;
        return differenceInHours(last, first);
    }).filter(d => d > 0 && d < 24); // Filter unreasonable durations
    const avgSessionDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 10) / 10
        : 0;
    const longestSessionDuration = Math.max(...durations, 0);
    const longestSessionConv = conversations.find(c => {
        if (c.messages.length < 2)
            return false;
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
        multiDayConversations,
        avgTimeBetweenTurns,
        avgSessionDuration,
        longestSession: {
            duration: longestSessionDuration,
            date: longestSessionConv ? new Date(longestSessionConv.createdAt) : new Date()
        }
    };
}
function calculateTimeStats(messages) {
    const hourlyDistribution = new Map();
    const dayOfWeekDistribution = new Map();
    const heatmap = new Map();
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
        const dayMap = heatmap.get(day);
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
function calculateEngagementStats(conversations, userMessages, assistantMessages) {
    const avgUserMessageLength = Math.round(userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length);
    const avgAssistantMessageLength = Math.round(assistantMessages.reduce((sum, m) => sum + m.text.length, 0) / assistantMessages.length);
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
function calculatePushupStats(assistantMessages) {
    const now = Date.now();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now).getTime();
    const lastWeekStart = startOfWeek(new Date(now - 7 * 24 * 60 * 60 * 1000)).getTime();
    const monthStart = startOfMonth(now).getTime();
    const lastMonthStart = startOfMonth(new Date(now - 30 * 24 * 60 * 60 * 1000)).getTime();
    const quarterStart = startOfQuarter(now).getTime();
    const yearStart = startOfYear(now).getTime();
    const phraseCounts = new Map();
    let allTimeValidations = 0;
    const validationsByDay = new Map();
    const stats = {
        today: 0,
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisQuarter: 0,
        thisYear: 0,
        allTime: 0,
        topPhrases: [],
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
            if (m.timestamp >= todayStart)
                stats.today += validationCount;
            if (m.timestamp >= weekStart)
                stats.thisWeek += validationCount;
            if (m.timestamp >= lastWeekStart && m.timestamp < weekStart)
                stats.lastWeek += validationCount;
            if (m.timestamp >= monthStart)
                stats.thisMonth += validationCount;
            if (m.timestamp >= lastMonthStart && m.timestamp < monthStart)
                stats.lastMonth += validationCount;
            if (m.timestamp >= quarterStart)
                stats.thisQuarter += validationCount;
            if (m.timestamp >= yearStart)
                stats.thisYear += validationCount;
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
        }
        else {
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
                }
                else {
                    break;
                }
            }
        }
    }
    stats.currentStreak = currentStreak;
    stats.bestStreak = Math.max(bestStreak, tempStreak);
    return stats;
}
