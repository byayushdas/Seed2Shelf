import Head from "next/head";
import { LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useChain } from "@/hooks/useChain";
import { useRouter } from "next/router";

export default function Login() {
  const { account, connectWallet } = useChain();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'farmer'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Automatically request wallet connection after successful Web2 Auth
        if (!account) {
          try {
            await connectWallet();
          } catch (walletErr) {
            console.warn("Wallet connection skipped or failed:", walletErr);
          }
        }
        // Redirect to the correct role dashboard
        router.push(`/${formData.role}`);
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Seed2Shelf</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-hero-pattern">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-agri-green p-3 rounded-xl shadow-lg">
                <LogIn className="w-10 h-10 text-agri-gold" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-800">
            Or{' '}
            <Link href="/signup" className="font-medium text-agri-green hover:text-agri-green-800">
              register your organization today
            </Link>
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-white">
            <form className="space-y-6" onSubmit={handleLogin}>
              
              {router.query.signup === 'success' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <p className="text-sm text-green-700">Account verified! Please sign in.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-agri-green focus:border-agri-green sm:text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-agri-green focus:border-agri-green sm:text-sm text-black"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Select Dashboard Type
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-agri-green focus:border-agri-green sm:text-sm rounded-md text-black"
                  >
                    <option value="farmer">Farmer Dashboard</option>
                    <option value="processor">Processor & Grader</option>
                    <option value="distributor">Logistics & Distributor</option>
                    <option value="retailer">Retail Store</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-agri-green focus:ring-agri-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Keep wallet connected
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-agri-green hover:text-agri-green-800">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-agri-green hover:bg-agri-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agri-green transition-colors disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {loading ? 'Authenticating...' : 'Sign in & Load Data'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Secure Web3 Access
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-center text-gray-800 font-mono bg-gray-50 p-2 rounded">
                   Live Network Smart Contracts Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
