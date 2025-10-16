import { SearchResult } from '@/types/chat';

export async function searchTavily(query: string): Promise<SearchResult[]> {
  try {
    const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
    if (!apiKey) {
      console.error('Tavily API key not found');
      return [];
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: 'basic',
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((result: any) => ({
      title: result.title || 'Result',
      url: result.url || '',
      snippet: result.content || '',
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(url);
    const data = await response.json();

    const results: SearchResult[] = [];

    if (data.AbstractURL && data.AbstractText) {
      results.push({
        title: data.Heading || 'DuckDuckGo Result',
        url: data.AbstractURL,
        snippet: data.AbstractText,
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Result',
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    return results.slice(0, 5);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
