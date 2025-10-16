export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: ReasoningStep[];
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
  cost?: number;
  timestamp: number;
}

export interface ReasoningStep {
  id: string;
  type: 'thinking' | 'search' | 'result';
  content: string;
  status: 'pending' | 'active' | 'complete';
  metadata?: {
    searchQuery?: string;
    searchResults?: SearchResult[];
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  totalCost: number;
}

export type SupportedParameter =
  | 'temperature'
  | 'top_p'
  | 'top_k'
  | 'min_p'
  | 'top_a'
  | 'frequency_penalty'
  | 'presence_penalty'
  | 'repetition_penalty'
  | 'max_tokens'
  | 'logit_bias'
  | 'logprobs'
  | 'top_logprobs'
  | 'seed'
  | 'response_format'
  | 'structured_outputs'
  | 'stop'
  | 'tools'
  | 'tool_choice'
  | 'parallel_tool_calls'
  | 'include_reasoning'
  | 'reasoning'
  | 'web_search_options'
  | 'verbosity';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  supported_parameters?: SupportedParameter[];
  supported_features?: string[];
}
