import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsNetworkError(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('SignupForm: Attempting to sign up with email:', email);
      const { user, error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        console.error('SignupForm: Sign up error:', signUpError);
        
        // Handle network errors specifically
        if (signUpError.message && (
          signUpError.message.includes('Failed to fetch') || 
          signUpError.message.includes('NetworkError') ||
          signUpError.message.includes('network') ||
          signUpError.message.includes('connect')
        )) {
          setIsNetworkError(true);
          throw new Error('Unable to connect to the authentication server. Please check your internet connection and try again.');
        }
        
        throw new Error(signUpError.message || 'Failed to create account. Please try again.');
      }
      
      if (!user) {
        throw new Error('No user returned after sign up.');
      }
      
      console.log('SignupForm: Sign up successful');
      // Successful signup will be handled by the AuthProvider redirecting to the dashboard
    } catch (err: any) {
      console.error('SignupForm: Exception during sign up:', err);
      setError(err.message || 'An error occurred during sign up.');
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Start managing your finances today</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="pl-10 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Must be at least 8 characters long.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`pl-10 w-full py-2 px-4 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <div className="mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Create account</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default SignupForm; 