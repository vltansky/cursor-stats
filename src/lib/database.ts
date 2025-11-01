import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

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

export function getAllConversations(): Conversation[] {
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

    const rows = query.all() as Array<{ value: string }>;
    const conversations: Conversation[] = [];

    for (const row of rows) {
      try {
        const rawConv = JSON.parse(row.value) as RawConversation;
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

          for (const header of headers) {
            if (header.bubbleId) {
              const bubbleKey = `bubbleId:${composerId}:${header.bubbleId}`;

              try {
                const bubbleQuery = db.prepare('SELECT value FROM cursorDiskKV WHERE key = ?');
                const bubbleRow = bubbleQuery.get(bubbleKey) as { value: string } | undefined;

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

export function getAssistantMessages(): Message[] {
  const conversations = getAllConversations();
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

export function getUserMessages(): Message[] {
  const conversations = getAllConversations();
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
