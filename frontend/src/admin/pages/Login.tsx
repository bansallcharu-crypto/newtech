import React, { useState } from 'react';
import { Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-ink via-brand-900 to-ink p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-display font-bold text-lg text-white mb-3">
            N
          </div>
          <h1 className="text-xl font-display font-bold text-white">NexTech Owner Console</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your business</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="owner"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2">
              <Lock size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="flex items-start gap-2 rounded-lg bg-brand-50 text-brand-800 text-xs px-3 py-2">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <span>Demo credentials: <strong>owner</strong> / <strong>NexTech@2026</strong></span>
          </div>
        </form>
      </div>
    </div>
  );
}
