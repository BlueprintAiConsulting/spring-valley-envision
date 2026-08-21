import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Home } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B131E] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-[#162333] rounded-2xl flex items-center justify-center shadow-lg border border-[#223448]">
            <Home className="w-8 h-8 text-[#83C248]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#9BA8B8]">
          Spring Valley Envision Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#162333] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#223448]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[#9BA8B8]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#223448] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#83C248] focus:border-[#83C248] sm:text-sm bg-[#0B131E] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9BA8B8]">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-[#223448] rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#83C248] focus:border-[#83C248] sm:text-sm bg-[#0B131E] text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#0B131E] bg-[#83C248] hover:bg-[#72A83E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#83C248] disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
