import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
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
export function getAllConversations() {
    const dbPath = getCursorDatabasePath();
    if (!existsSync(dbPath)) {
        throw new Error(`Cursor database not found at: ${dbPath}`);
    }
    const db = new Database(dbPath, { readonly: true });
    try {
        const query = db.prepare(`
      SELECT value FROM cursorDiskKV
      WHERE key LIKE 'composerData:%'
      AND length(value) > 1000
    `);
        const rows = query.all();
        const conversations = [];
        for (const row of rows) {
            try {
                const rawConv = JSON.parse(row.value);
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
                                const bubbleQuery = db.prepare('SELECT value FROM cursorDiskKV WHERE key = ?');
                                const bubbleRow = bubbleQuery.get(bubbleKey);
                                if (bubbleRow) {
                                    const bubble = JSON.parse(bubbleRow.value);
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
export function getAssistantMessages() {
    const conversations = getAllConversations();
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
export function getUserMessages() {
    const conversations = getAllConversations();
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
