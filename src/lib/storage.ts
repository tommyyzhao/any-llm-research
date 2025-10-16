import { ChatThread, ChatMessage } from '@/types/chat';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  API_KEY: 'openrouter_api_key',
  ACTIVE_THREAD_ID: 'active_thread_id',
} as const;

function hashApiKey(apiKey: string): string {
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const storage = {
  getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  getApiKeyHash(): string {
    const apiKey = this.getApiKey();
    return apiKey ? hashApiKey(apiKey) : '';
  },

  async getChatThreads(): Promise<ChatThread[]> {
    const apiKeyHash = this.getApiKeyHash();
    if (!apiKeyHash) return [];

    const { data, error } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('api_key_hash', apiKeyHash)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      return [];
    }

    const threads: ChatThread[] = [];
    for (const thread of data || []) {
      const messages = await this.getThreadMessages(thread.id);
      threads.push({
        id: thread.id,
        title: thread.title,
        modelId: thread.model_id,
        messages,
        createdAt: new Date(thread.created_at).getTime(),
        updatedAt: new Date(thread.updated_at).getTime(),
        totalCost: thread.total_cost,
      });
    }

    return threads;
  },

  async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      reasoning: msg.reasoning || [],
      toolCalls: msg.tool_calls || [],
      usage: msg.usage || undefined,
      cost: msg.cost || 0,
      timestamp: msg.timestamp,
    }));
  },

  async saveChatThreads(_threads: ChatThread[]): Promise<void> {
  },

  async addChatThread(thread: Omit<ChatThread, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    const apiKeyHash = this.getApiKeyHash();
    if (!apiKeyHash) return null;

    const { data, error } = await supabase.from('chat_threads').insert({
      title: thread.title,
      model_id: thread.modelId,
      total_cost: thread.totalCost,
      api_key_hash: apiKeyHash,
    }).select('id').single();

    if (error) {
      console.error('Error adding thread:', error);
      return null;
    }

    return data?.id || null;
  },

  async updateChatThread(threadId: string, updates: Partial<ChatThread>): Promise<void> {
    const updateData: any = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.modelId) updateData.model_id = updates.modelId;
    if (updates.totalCost !== undefined) updateData.total_cost = updates.totalCost;

    const { error } = await supabase
      .from('chat_threads')
      .update(updateData)
      .eq('id', threadId);

    if (error) {
      console.error('Error updating thread:', error);
    }
  },

  async addMessage(threadId: string, message: Omit<ChatMessage, 'id'>): Promise<string | null> {
    const { data, error } = await supabase.from('chat_messages').insert({
      thread_id: threadId,
      role: message.role,
      content: message.content,
      reasoning: message.reasoning || [],
      tool_calls: message.toolCalls || [],
      usage: message.usage || {},
      cost: message.cost || 0,
      timestamp: message.timestamp,
    }).select('id').single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return data?.id || null;
  },

  async deleteChatThread(threadId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      console.error('Error deleting thread:', error);
    }
  },

  getActiveThreadId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_THREAD_ID);
  },

  setActiveThreadId(threadId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_THREAD_ID, threadId);
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
