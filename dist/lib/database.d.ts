export interface Message {
    text: string;
    timestamp: number;
    type: number;
}
export interface Conversation {
    composerId: string;
    createdAt: number;
    lastUpdatedAt: number;
    messages: Message[];
    isAgentic: boolean;
    hasContext: boolean;
}
export declare function getAllConversations(): Promise<Conversation[]>;
export declare function getAssistantMessages(): Promise<Message[]>;
export declare function getUserMessages(): Promise<Message[]>;
