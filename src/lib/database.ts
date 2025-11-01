import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export interface Message {
  text: string;
  timestamp: number;
  type: number; // 1 = user, 2 = assistant
}

export interface Conversation {
  composerId: string;
  createdAt: number;
  lastUpdatedAt: number;
  messages: Message[];
  isAgentic: boolean;
  hasContext: boolean;
}

interface RawConversation {
  composerId: string;
  createdAt?: number;
  lastUpdatedAt?: number;
  conversation?: Array<{
    type: number;
    text: string;
    timestamp?: string;
  }>;
  fullConversationHeadersOnly?: Array<{
    bubbleId: string;
    type: number;
  }>;
  _v?: number;
  isAgentic?: boolean;
  context?: any;
}

function getCursorDatabasePath(): string {
  const platform = process.platform;

  if (platform === 'darwin') {
    return join(homedir(), 'Library/Application Support/Cursor/User/globalStorage/state.vscdb');
  } else if (platform === 'win32') {
    return join(process.env.APPDATA || '', 'Cursor/User/globalStorage/state.vscdb');
  } else {
    return join(homedir(), '.config/Cursor/User/globalStorage/state.vscdb');
  }
}

function isLegacyConversation(conversation: any): boolean {
  return conversation &&
    typeof conversation.composerId === 'string' &&
    Array.isArray(conversation.conversation) &&
    !conversation._v;
}

function isModernConversation(conversation: any): boolean {
  return conversation &&
    typeof conversation.composerId === 'string' &&
    typeof conversation._v === 'number' &&
    Array.isArray(conversation.fullConversationHeadersOnly);
}

async function openDatabase(): Promise<SqlJsDatabase> {
  const dbPath = getCursorDatabasePath();

  if (!existsSync(dbPath)) {
    throw new Error(`Cursor database not found at: ${dbPath}`);
  }

  const SQL = await initSqlJs();
  const buffer = readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  return db;
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await openDatabase();

  try {
    const query = `
      SELECT value FROM cursorDiskKV
      WHERE key LIKE 'composerData:%'
      AND length(value) > 1000
    `;

    const result = db.exec(query);
    const conversations: Conversation[] = [];

    if (result.length === 0 || !result[0].values) {
      return conversations;
    }

    // result[0].values is an array of rows, each row is an array of column values
    const rows = result[0].values;

    for (const row of rows) {
      try {
        const value = row[0] as string; // First (and only) column is 'value'
        const rawConv = JSON.parse(value) as RawConversation;
        const messages: Message[] = [];
        const conversationTimestamp = rawConv.createdAt || rawConv.lastUpdatedAt || Date.now();

        if (isLegacyConversation(rawConv)) {
          const conversationMessages = rawConv.conversation || [];

          for (const message of conversationMessages) {
            let timestamp: number;

            if (message.timestamp) {
              timestamp = new Date(message.timestamp).getTime();
            } else {
              timestamp = conversationTimestamp;
            }

            messages.push({
              text: message.text,
              timestamp,
              type: message.type
            });
          }
        } else if (isModernConversation(rawConv)) {
          const composerId = rawConv.composerId;
          const headers = rawConv.fullConversationHeadersOnly || [];

          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header.bubbleId) {
              const bubbleKey = `bubbleId:${composerId}:${header.bubbleId}`;

              try {
                const bubbleQuery = `SELECT value FROM cursorDiskKV WHERE key = '${bubbleKey.replace(/'/g, "''")}'`;
                const bubbleResult = db.exec(bubbleQuery);

                if (bubbleResult.length > 0 && bubbleResult[0].values.length > 0) {
                  const bubbleValue = bubbleResult[0].values[0][0] as string;
                  const bubble = JSON.parse(bubbleValue);
                  if (bubble.text) {
                    const createdAt = rawConv.createdAt || conversationTimestamp;
                    const lastUpdatedAt = rawConv.lastUpdatedAt || conversationTimestamp;
                    const duration = lastUpdatedAt - createdAt;

                    let messageTimestamp: number;
                    if (headers.length === 1) {
                      messageTimestamp = createdAt;
                    } else {
                      const progress = i / (headers.length - 1);
                      messageTimestamp = createdAt + (duration * progress);
                    }

                    messages.push({
                      text: bubble.text,
                      timestamp: messageTimestamp,
                      type: header.type
                    });
                  }
                }
              } catch (bubbleError) {
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
      } catch (parseError) {
        continue;
      }
    }

    return conversations;
  } finally {
    db.close();
  }
}

export async function getAssistantMessages(): Promise<Message[]> {
  const conversations = await getAllConversations();
  const messages: Message[] = [];

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.type === 2) {
        messages.push(msg);
      }
    }
  }

  return messages;
}

export async function getUserMessages(): Promise<Message[]> {
  const conversations = await getAllConversations();
  const messages: Message[] = [];

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.type === 1) {
        messages.push(msg);
      }
    }
  }

  return messages;
}
