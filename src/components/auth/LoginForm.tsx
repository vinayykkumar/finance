import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onForgotPassword }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsNetworkError(false);

    try {
      console.log('LoginForm: Attempting to sign in with email:', email);
      const { user, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error('LoginForm: Sign in error:', signInError);
        
        // Handle network errors specifically
        if (signInError.message && (
          signInError.message.includes('Failed to fetch') || 
          signInError.message.includes('NetworkError') ||
          signInError.message.includes('network') ||
          signInError.message.includes('connect')
        )) {
          setIsNetworkError(true);
          throw new Error('Unable to connect to the authentication server. Please check your internet connection and try again.');
        }
        
        throw new Error(signInError.message || 'Failed to sign in. Please check your credentials.');
      }
      
      if (!user) {
        throw new Error('No user returned after sign in.');
      }
      
      console.log('LoginForm: Sign in successful');
      // Successful login will be handled by the AuthProvider redirecting to the dashboard
    } catch (err: any) {
      console.error('LoginForm: Exception during sign in:', err);
      setError(err.message || 'An error occurred during sign in.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsNetworkError(false);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to access your finances</p>
      </div>

      {error && !isNetworkError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {isNetworkError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
        >
          <div className="flex items-start gap-3 mb-3">
            <WifiOff className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {error || "Network connection issue. Cannot reach authentication server."}
            </p>
          </div>
          <div className="mt-3 pl-8">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              Please check your internet connection and try these steps:
            </p>
            <ul className="text-xs text-amber-600 dark:text-amber-400 list-disc pl-4 space-y-1">
              <li>Verify your internet connection is working</li>
              <li>Make sure you're not blocking API requests in your browser</li>
              <li>Try disabling any VPN or proxy services</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
            <button
              onClick={handleRetry}
              className="mt-3 text-sm px-3 py-1.5 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Sign in</span>
            </>
          )}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm; 