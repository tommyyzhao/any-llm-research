import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { validateApiKey } from '@/lib/openrouter';

interface LoginProps {
  onLogin: (apiKey: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsValidating(true);

    try {
      const isValid = await validateApiKey(apiKey.trim());
      if (isValid) {
        onLogin(apiKey.trim());
      } else {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome to AnyLLM Research</h1>
            <p className="text-sm text-slate-600 mt-2 text-center">
              Enter your OpenRouter API key to begin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isValidating}
                className="w-full"
              />
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? 'Validating...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">
              <strong className="text-slate-900">Privacy Notice:</strong> Your API key is stored locally in your browser and never sent to any server except OpenRouter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
