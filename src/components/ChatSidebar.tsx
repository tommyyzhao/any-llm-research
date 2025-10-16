import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { ChatThread } from '@/types/chat';
import { storage } from '@/lib/storage';

interface ChatSidebarProps {
  currentThreadId: string;
  onThreadSelect: (threadId: string, modelId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ currentThreadId, onThreadSelect, onNewChat }: ChatSidebarProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadThreads = async () => {
    setIsLoading(true);
    const loadedThreads = await storage.getChatThreads();
    setThreads(loadedThreads);
    setIsLoading(false);
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;

    setDeletingId(threadId);
    await storage.deleteChatThread(threadId);
    await loadThreads();
    setDeletingId(null);

    if (currentThreadId === threadId) {
      onNewChat();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-200">
        <Button
          onClick={onNewChat}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No chats yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onThreadSelect(thread.id, thread.modelId)}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group ${
                  currentThreadId === thread.id ? 'bg-slate-100' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {thread.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(thread.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    disabled={deletingId === thread.id}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity"
                  >
                    {deletingId === thread.id ? (
                      <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 text-slate-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 truncate">
                    {thread.messages.length} messages
                  </span>
                  {thread.totalCost > 0 && (
                    <span className="text-xs text-slate-400">
                      {(thread.totalCost * 100).toFixed(2)}¢
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
