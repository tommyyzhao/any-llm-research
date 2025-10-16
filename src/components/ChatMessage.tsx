import { Bot, User, Search } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from './ai-elements/chain-of-thought';
import { Markdown } from './Markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasReasoning = message.reasoning && message.reasoning.length > 0;

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className="space-y-3">
          {isUser ? (
            <div className="bg-slate-900 text-white rounded-lg px-4 py-3 inline-block">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          ) : (
            <>
              {hasReasoning && (
                <ChainOfThought defaultOpen>
                  <ChainOfThoughtHeader />
                  <ChainOfThoughtContent>
                    {message.reasoning?.map((step) => (
                      <ChainOfThoughtStep
                        key={step.id}
                        icon={step.type === 'search' ? Search : undefined}
                        label={step.content}
                        status={step.status}
                      >
                        {step.metadata?.searchResults && (
                          <ChainOfThoughtSearchResults>
                            {step.metadata.searchResults.map((result, idx) => {
                              const hostname = new URL(result.url).hostname;
                              return (
                                <ChainOfThoughtSearchResult key={idx}>
                                  <img
                                    alt=""
                                    className="size-4"
                                    height={16}
                                    src={`https://img.logo.dev/${hostname}?token=${import.meta.env.VITE_LOGO_DEV_TOKEN}`}
                                    width={16}
                                  />
                                  {hostname}
                                </ChainOfThoughtSearchResult>
                              );
                            })}
                          </ChainOfThoughtSearchResults>
                        )}
                      </ChainOfThoughtStep>
                    ))}
                  </ChainOfThoughtContent>
                </ChainOfThought>
              )}

              {message.content && (
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                  <Markdown content={message.content} className="text-sm text-slate-900" />
                </div>
              )}

              {message.usage && (
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{message.usage.totalTokens.toLocaleString()} tokens</span>
                  {message.cost !== undefined && (
                    <span>{(message.cost * 100).toFixed(4)}¢</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-600" />
        </div>
      )}
    </div>
  );
}
