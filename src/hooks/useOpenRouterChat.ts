import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ReasoningStep, OpenRouterModel, TokenUsage } from '@/types/chat';
import { calculateCost, supportsToolCalling } from '@/lib/openrouter';
import { createChatModel } from '@/lib/langchain-chat';
import { availableTools } from '@/lib/tools';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { storage } from '@/lib/storage';

interface UseOpenRouterChatProps {
  apiKey: string;
  model: OpenRouterModel;
  threadId: string;
  onMessageUpdate?: (messages: ChatMessage[]) => void;
}

export function useOpenRouterChat({ apiKey, model, threadId, onMessageUpdate }: UseOpenRouterChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (threadId) {
        const loadedMessages = await storage.getThreadMessages(threadId);
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [threadId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const userMessageId = await storage.addMessage(threadId, userMessage);
    if (!userMessageId) {
      setError('Failed to save message');
      return;
    }

    const fullUserMessage: ChatMessage = { ...userMessage, id: userMessageId };
    const newMessages = [...messages, fullUserMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const chatModel = createChatModel(apiKey, model);
      const useTools = supportsToolCalling(model) && availableTools.length > 0;
      const modelWithTools = useTools ? chatModel.bindTools(availableTools) : chatModel;

      const last6Messages = newMessages.slice(-6);
      const langchainMessages = last6Messages.map(msg =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      let assistantMessage: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: '',
        reasoning: [],
        timestamp: Date.now(),
      };

      let fullContent = '';
      const reasoningSteps: ReasoningStep[] = [];
      const accumulatedToolCalls: Map<number, any> = new Map();

      const stream = await modelWithTools.stream(langchainMessages);

      for await (const chunk of stream) {
        if (chunk.content) {
          fullContent += chunk.content;
          assistantMessage.content = fullContent;
          setMessages([...newMessages, { ...assistantMessage, id: 'temp-assistant' }]);
        }

        if (chunk.tool_call_chunks && chunk.tool_call_chunks.length > 0) {
          for (const toolCallChunk of chunk.tool_call_chunks) {
            const index = toolCallChunk.index ?? 0;

            if (!accumulatedToolCalls.has(index)) {
              accumulatedToolCalls.set(index, {
                name: '',
                argsString: '',
                id: '',
                type: 'tool_call'
              });
            }

            const accumulated = accumulatedToolCalls.get(index)!;

            if (toolCallChunk.name) {
              accumulated.name = toolCallChunk.name;
            }
            if (toolCallChunk.id) {
              accumulated.id = toolCallChunk.id;
            }
            if (toolCallChunk.args) {
              accumulated.argsString += toolCallChunk.args;
            }
          }

          const currentToolCalls = Array.from(accumulatedToolCalls.values());
          if (currentToolCalls.length > 0 && currentToolCalls[0].name && reasoningSteps.length === 0) {
            for (const toolCall of currentToolCalls) {
              const searchStep: ReasoningStep = {
                id: `search-${Date.now()}-${toolCall.name}`,
                type: 'search',
                content: `Searching...`,
                status: 'active',
              };
              reasoningSteps.push(searchStep);
            }
            assistantMessage.reasoning = reasoningSteps;
            setMessages([...newMessages, { ...assistantMessage, id: 'temp-assistant' }]);
          }
        }
      }

      const currentToolCalls = Array.from(accumulatedToolCalls.values());

      if (currentToolCalls.length > 0 && useTools) {
        for (const toolCall of currentToolCalls) {
          if (!toolCall.name || !toolCall.argsString) {
            console.warn('Incomplete tool call:', toolCall);
            continue;
          }

          const tool = availableTools.find(t => t.name === toolCall.name);
          if (tool) {
            try {
              let toolInput;
              try {
                toolInput = JSON.parse(toolCall.argsString);
              } catch (parseError) {
                console.error('Failed to parse tool args:', toolCall.argsString);
                throw parseError;
              }

              const toolResult = await tool.invoke(toolInput);

              let searchResults;
              if (toolCall.name === 'web_search' && typeof toolResult === 'string') {
                searchResults = [];
                const resultLines = toolResult.split('\n\n');
                for (const line of resultLines) {
                  const urlMatch = line.match(/URL: (https?:\/\/[^\s]+)/);
                  const titleMatch = line.match(/\[\d+\] (.+)/);
                  if (urlMatch && titleMatch) {
                    searchResults.push({
                      url: urlMatch[1],
                      title: titleMatch[1].split('\nURL:')[0],
                      snippet: line.split('\n').slice(2).join('\n')
                    });
                  }
                }
              }

              const searchIndex = reasoningSteps.findIndex(s => s.status === 'active');
              if (searchIndex !== -1) {
                reasoningSteps[searchIndex] = {
                  ...reasoningSteps[searchIndex],
                  content: toolInput.query || 'Search completed',
                  status: 'complete',
                  metadata: searchResults ? { searchResults } : undefined,
                };
              }
              assistantMessage.reasoning = reasoningSteps;
              setMessages([...newMessages, { ...assistantMessage, id: 'temp-assistant' }]);

              const properToolCall = {
                name: toolCall.name,
                args: toolInput,
                id: toolCall.id,
                type: 'tool_call' as const
              };

              const toolMessages = [
                ...langchainMessages,
                new AIMessage({ content: '', tool_calls: [properToolCall] }),
                {
                  role: 'tool' as const,
                  content: toolResult,
                  tool_call_id: toolCall.id,
                },
              ];

              fullContent = '';
              assistantMessage.content = '';
              const finalStream = await chatModel.stream(toolMessages as any);

              for await (const finalChunk of finalStream) {
                if (finalChunk.content) {
                  fullContent += finalChunk.content;
                  assistantMessage.content = fullContent;
                  setMessages([...newMessages, { ...assistantMessage, id: 'temp-assistant' }]);
                }
              }
            } catch (toolError) {
              console.error('Tool execution error:', toolError);
              console.error('Tool call details:', toolCall);
              assistantMessage.content = 'I encountered an error while searching. Please try again.';
            }
          }
        }
      }

      const estimatedPromptTokens = langchainMessages.reduce(
        (sum, msg) => sum + Math.ceil(msg.content.toString().length / 4),
        0
      );
      const estimatedCompletionTokens = Math.ceil(assistantMessage.content.length / 4);

      const usage: TokenUsage = {
        promptTokens: estimatedPromptTokens,
        completionTokens: estimatedCompletionTokens,
        totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
      };

      assistantMessage.usage = usage;
      assistantMessage.cost = calculateCost(
        estimatedPromptTokens,
        estimatedCompletionTokens,
        model
      );

      const assistantMessageId = await storage.addMessage(threadId, assistantMessage);
      if (!assistantMessageId) {
        setError('Failed to save assistant response');
        return;
      }

      const fullAssistantMessage: ChatMessage = { ...assistantMessage, id: assistantMessageId };
      const finalMessages = [...newMessages, fullAssistantMessage];
      setMessages(finalMessages);

      const totalCost = finalMessages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
      await storage.updateChatThread(threadId, {
        totalCost,
        title: newMessages.find(m => m.role === 'user')?.content.slice(0, 50) || 'New Chat',
      });

      onMessageUpdate?.(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, apiKey, model, threadId, onMessageUpdate]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
