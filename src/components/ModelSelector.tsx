import { useEffect, useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { ChatSidebar } from './ChatSidebar';
import { fetchModels, supportsToolCalling } from '@/lib/openrouter';
import { OpenRouterModel } from '@/types/chat';

interface ModelSelectorProps {
  apiKey: string;
  onModelSelected: (model: OpenRouterModel) => void;
  onThreadSelect: (threadId: string, modelId: string) => void;
}

export function ModelSelector({ apiKey, onModelSelected, onThreadSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    setError('');

    try {
      const fetchedModels = await fetchModels(apiKey);
      const sortedModels = fetchedModels.sort((a, b) => a.name.localeCompare(b.name));
      setModels(sortedModels);

      if (sortedModels.length > 0) {
        setSelectedModelId(sortedModels[0].id);
      }
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    const model = models.find(m => m.id === selectedModelId);
    if (model) {
      onModelSelected(model);
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);
  const hasToolSupport = selectedModel ? supportsToolCalling(selectedModel) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-600">Loading models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadModels}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <ChatSidebar
        currentThreadId=""
        onThreadSelect={onThreadSelect}
        onNewChat={() => {}}
      />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Select a Model</h1>
            <p className="text-sm text-slate-600 mt-2 text-center">
              Choose an AI model to start your conversation
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Model
              </label>
              <Select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </Select>
            </div>

            {selectedModel && (
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Context Length:</span>
                  <span className="font-medium text-slate-900">
                    {selectedModel.context_length.toLocaleString()} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Prompt:</span>
                  <span className="font-medium text-slate-900">
                    ${selectedModel.pricing.prompt}/M tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completion:</span>
                  <span className="font-medium text-slate-900">
                    ${selectedModel.pricing.completion}/M tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Web Search:</span>
                  <span className={`font-medium ${hasToolSupport ? 'text-green-600' : 'text-slate-400'}`}>
                    {hasToolSupport ? 'Supported' : 'Not supported'}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartChat}
              disabled={!selectedModelId}
              className="w-full"
            >
              Start Chat
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
