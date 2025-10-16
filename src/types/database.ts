export interface Database {
  public: {
    Tables: {
      chat_threads: {
        Row: {
          id: string;
          title: string;
          model_id: string;
          created_at: string;
          updated_at: string;
          total_cost: number;
          api_key_hash: string;
        };
        Insert: {
          id?: string;
          title?: string;
          model_id: string;
          created_at?: string;
          updated_at?: string;
          total_cost?: number;
          api_key_hash: string;
        };
        Update: {
          id?: string;
          title?: string;
          model_id?: string;
          created_at?: string;
          updated_at?: string;
          total_cost?: number;
          api_key_hash?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          reasoning: any;
          tool_calls: any;
          usage: any;
          cost: number;
          timestamp: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          role: 'user' | 'assistant' | 'system';
          content?: string;
          reasoning?: any;
          tool_calls?: any;
          usage?: any;
          cost?: number;
          timestamp: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          reasoning?: any;
          tool_calls?: any;
          usage?: any;
          cost?: number;
          timestamp?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'chat_threads';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
