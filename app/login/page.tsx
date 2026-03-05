'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-yellow-300 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10">
          <Link
            href="/"
            className="font-black text-sm uppercase tracking-widest border-b-2 border-black hover:bg-yellow-300 transition-colors"
          >
            &larr; Back
          </Link>

          <h1 className="font-black text-4xl sm:text-5xl mt-6 mb-8 leading-none">
            LOG IN
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-black text-sm uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-2 border-black px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold text-base w-full"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-black text-sm uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-2 border-black px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-black font-bold text-base w-full"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border-2 border-black bg-pink-400 px-4 py-3 font-bold text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="border-2 border-black bg-green-400 font-black text-xl px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
