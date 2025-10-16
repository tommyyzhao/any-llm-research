import { useState, useRef, useEffect } from 'react';
import { Send, LogOut, Loader2, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ChatMessage } from './ChatMessage';
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat';
import { OpenRouterModel } from '@/types/chat';
import { supportsToolCalling } from '@/lib/openrouter';
import { availableTools } from '@/lib/tools';

interface ChatProps {
  apiKey: string;
  model: OpenRouterModel;
  threadId: string;
  onLogout: () => void;
}

export function Chat({ apiKey, model, threadId, onLogout }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage } = useOpenRouterChat({
    apiKey,
    model,
    threadId,
  });

  const hasToolSupport = supportsToolCalling(model);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const totalCost = messages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
  const totalTokens = messages.reduce((sum, msg) => sum + (msg.usage?.totalTokens || 0), 0);
  const totalCostCents = totalCost * 100;

  return (
    <div className="flex flex-col flex-1 h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{model.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span>{totalTokens.toLocaleString()} tokens</span>
            <span>{totalCostCents.toFixed(4)}¢</span>
            {hasToolSupport && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Wrench className="w-3 h-3" />
                Tools: {availableTools.map(t => t.name).join(', ')}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">Start a conversation...</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                  <p className="text-sm text-slate-400">Thinking...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              placeholder="Type your message... (Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 max-h-32 resize-none"
              rows={1}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
