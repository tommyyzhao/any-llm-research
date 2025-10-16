import { ChatOpenAI } from '@langchain/openai';
import { OpenRouterModel } from '@/types/chat';

export function createChatModel(apiKey: string, model: OpenRouterModel) {
  return new ChatOpenAI({
    modelName: model.id,
    openAIApiKey: apiKey,
    streaming: true,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      },
    },
  });
}
