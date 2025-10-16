import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { ModelSelector } from './components/ModelSelector';
import { Chat } from './components/Chat';
import { ChatSidebar } from './components/ChatSidebar';
import { storage } from './lib/storage';
import { OpenRouterModel } from './types/chat';
import { fetchModels } from './lib/openrouter';

type AppState = 'login' | 'model-select' | 'chat';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useState<AppState>('login');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<OpenRouterModel | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string>('');

  useEffect(() => {
    const storedKey = storage.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setState('model-select');
    }
    setIsInitialized(true);
  }, []);

  const handleLogin = (key: string) => {
    storage.setApiKey(key);
    setApiKey(key);
    setState('model-select');
  };

  const handleModelSelected = async (model: OpenRouterModel) => {
    setSelectedModel(model);

    const threadId = await storage.addChatThread({
      title: 'New Chat',
      modelId: model.id,
      messages: [],
      totalCost: 0,
    });

    if (threadId) {
      storage.setActiveThreadId(threadId);
      setCurrentThreadId(threadId);
      setState('chat');
    }
  };

  const handleThreadSelect = async (threadId: string, modelId: string) => {
    storage.setActiveThreadId(threadId);
    setCurrentThreadId(threadId);

    if (!selectedModel || selectedModel.id !== modelId) {
      const models = await fetchModels(apiKey);
      const model = models.find(m => m.id === modelId);
      if (model) {
        setSelectedModel(model);
      }
    }

    setState('chat');
  };

  const handleNewChat = () => {
    setSelectedModel(null);
    setCurrentThreadId('');
    setState('model-select');
  };

  const handleLogout = () => {
    storage.clearApiKey();
    setApiKey('');
    setSelectedModel(null);
    setState('login');
  };

  if (!isInitialized) {
    return null;
  }

  if (state === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (state === 'model-select') {
    return <ModelSelector apiKey={apiKey} onModelSelected={handleModelSelected} onThreadSelect={handleThreadSelect} />;
  }

  if (state === 'chat' && selectedModel) {
    return (
      <div className="flex h-screen">
        <ChatSidebar
          currentThreadId={currentThreadId}
          onThreadSelect={handleThreadSelect}
          onNewChat={handleNewChat}
        />
        <Chat
          apiKey={apiKey}
          model={selectedModel}
          threadId={currentThreadId}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return null;
}

export default App;
