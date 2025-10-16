import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { searchTavily } from './search';

export const webSearchTool = new DynamicStructuredTool({
  name: 'web_search',
  description: 'Search the web for current information. Use this when you need up-to-date information about current events, weather, news, or any topic that requires recent data.',
  schema: z.object({
    query: z.string().describe('The search query to look up'),
  }),
  func: async ({ query }) => {
    const results = await searchTavily(query);

    if (results.length === 0) {
      return 'No search results found.';
    }

    return results
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`)
      .join('\n\n');
  },
});

export const availableTools = [webSearchTool];
