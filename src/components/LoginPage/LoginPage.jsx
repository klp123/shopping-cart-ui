import React, { useState } from 'react';
import { login } from '../../api/authApi';

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('user@example.com');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      // axiosInstance interceptor unwraps response.data → { token }
      const token = data?.token ?? data;
      localStorage.setItem('poc_token', token);
      onLogin(token);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🛍</span>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900">ShopPOC</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg
                       hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo hint */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Demo credentials:&nbsp;
          <code className="bg-gray-100 px-1 rounded">user@example.com</code>
          &nbsp;/&nbsp;
          <code className="bg-gray-100 px-1 rounded">secure-password</code>
        </p>
      </div>
    </div>
  );
}
