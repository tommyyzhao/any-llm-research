import { OpenRouterModel } from '@/types/chat';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
  const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }

  const data = await response.json();
  return data.data || [];
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await fetchModels(apiKey);
    return true;
  } catch {
    return false;
  }
}

export function supportsToolCalling(model: OpenRouterModel): boolean {
  return model.supported_parameters?.includes('tools') || false;
}

export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model: OpenRouterModel
): number {
  const promptCost = (promptTokens / 1_000_000) * parseFloat(model.pricing.prompt);
  const completionCost = (completionTokens / 1_000_000) * parseFloat(model.pricing.completion);
  return promptCost + completionCost;
}
