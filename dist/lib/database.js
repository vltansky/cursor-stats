import initSqlJs from 'sql.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
function getCursorDatabasePath() {
    const platform = process.platform;
    if (platform === 'darwin') {
        return join(homedir(), 'Library/Application Support/Cursor/User/globalStorage/state.vscdb');
    }
    else if (platform === 'win32') {
        return join(process.env.APPDATA || '', 'Cursor/User/globalStorage/state.vscdb');
    }
    else {
        return join(homedir(), '.config/Cursor/User/globalStorage/state.vscdb');
    }
}
function isLegacyConversation(conversation) {
    return conversation &&
        typeof conversation.composerId === 'string' &&
        Array.isArray(conversation.conversation) &&
        !conversation._v;
}
function isModernConversation(conversation) {
    return conversation &&
        typeof conversation.composerId === 'string' &&
        typeof conversation._v === 'number' &&
        Array.isArray(conversation.fullConversationHeadersOnly);
}
async function openDatabase() {
    const dbPath = getCursorDatabasePath();
    if (!existsSync(dbPath)) {
        throw new Error(`Cursor database not found at: ${dbPath}`);
    }
    const SQL = await initSqlJs();
    const buffer = readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    return db;
}
export async function getAllConversations() {
    const db = await openDatabase();
    try {
        const query = `
      SELECT value FROM cursorDiskKV
      WHERE key LIKE 'composerData:%'
      AND length(value) > 1000
    `;
        const result = db.exec(query);
        const conversations = [];
        if (result.length === 0 || !result[0].values) {
            return conversations;
        }
        // result[0].values is an array of rows, each row is an array of column values
        const rows = result[0].values;
        for (const row of rows) {
            try {
                const value = row[0]; // First (and only) column is 'value'
                const rawConv = JSON.parse(value);
                const messages = [];
                const conversationTimestamp = rawConv.createdAt || rawConv.lastUpdatedAt || Date.now();
                if (isLegacyConversation(rawConv)) {
                    const conversationMessages = rawConv.conversation || [];
                    for (const message of conversationMessages) {
                        let timestamp;
                        if (message.timestamp) {
                            timestamp = new Date(message.timestamp).getTime();
                        }
                        else {
                            timestamp = conversationTimestamp;
                        }
                        messages.push({
                            text: message.text,
                            timestamp,
                            type: message.type
                        });
                    }
                }
                else if (isModernConversation(rawConv)) {
                    const composerId = rawConv.composerId;
                    const headers = rawConv.fullConversationHeadersOnly || [];
                    for (const header of headers) {
                        if (header.bubbleId) {
                            const bubbleKey = `bubbleId:${composerId}:${header.bubbleId}`;
                            try {
                                const bubbleQuery = `SELECT value FROM cursorDiskKV WHERE key = '${bubbleKey.replace(/'/g, "''")}'`;
                                const bubbleResult = db.exec(bubbleQuery);
                                if (bubbleResult.length > 0 && bubbleResult[0].values.length > 0) {
                                    const bubbleValue = bubbleResult[0].values[0][0];
                                    const bubble = JSON.parse(bubbleValue);
                                    if (bubble.text) {
                                        messages.push({
                                            text: bubble.text,
                                            timestamp: conversationTimestamp,
                                            type: header.type
                                        });
                                    }
                                }
                            }
                            catch (bubbleError) {
                                continue;
                            }
                        }
                    }
                }
                if (messages.length > 0) {
                    conversations.push({
                        composerId: rawConv.composerId,
                        createdAt: rawConv.createdAt || conversationTimestamp,
                        lastUpdatedAt: rawConv.lastUpdatedAt || conversationTimestamp,
                        messages,
                        isAgentic: rawConv.isAgentic || false,
                        hasContext: !!(rawConv.context)
                    });
                }
            }
            catch (parseError) {
                continue;
            }
        }
        return conversations;
    }
    finally {
        db.close();
    }
}
export async function getAssistantMessages() {
    const conversations = await getAllConversations();
    const messages = [];
    for (const conv of conversations) {
        for (const msg of conv.messages) {
            if (msg.type === 2) {
                messages.push(msg);
            }
        }
    }
    return messages;
}
export async function getUserMessages() {
    const conversations = await getAllConversations();
    const messages = [];
    for (const conv of conversations) {
        for (const msg of conv.messages) {
            if (msg.type === 1) {
                messages.push(msg);
            }
        }
    }
    return messages;
}
