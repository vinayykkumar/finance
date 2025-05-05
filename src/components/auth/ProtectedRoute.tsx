import React, { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';

interface ProtectedRouteProps {
  renderAuthPage: () => React.ReactNode;
  renderProtectedContent: () => React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  renderAuthPage,
  renderProtectedContent,
}) => {
  const { isAuthenticated, session, refreshSession, resetAuthState } = useAuth();
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add debug logging
  useEffect(() => {
    const authState = { 
      isAuthenticated, 
      isLoading: session.isLoading,
      hasUser: !!session.user,
      sessionExists: !!session.session
    };
    
    console.log('ProtectedRoute: Auth state update', authState);
    
    // Check for potential errors
    if (!session.isLoading) {
      if (authState.hasUser && !authState.sessionExists) {
        setErrorMessage("User found but session is missing. Please try refreshing.");
      } else if (!authState.hasUser && authState.sessionExists) {
        setErrorMessage("Session exists but user data is missing. Please try refreshing.");
      }
    }
  }, [isAuthenticated, session]);

  // Show refresh button after 5 seconds and reset button after 10 seconds if still loading
  useEffect(() => {
    let timeoutId: number;
    let intervalId: number;
    
    if (session.isLoading) {
      // Start counting how long we've been loading
      intervalId = window.setInterval(() => {
        setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      // Show refresh button after 5 seconds
      timeoutId = window.setTimeout(() => {
        setShowRefreshButton(true);
        
        // Show reset button after 10 seconds
        window.setTimeout(() => {
          setShowResetButton(true);
        }, 5000);
      }, 5000);
    } else {
      setShowRefreshButton(false);
      setShowResetButton(false);
      setIsRefreshing(false);
    }
    
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [session.isLoading, startTime]);

  const handleManualRefresh = async () => {
    setErrorMessage(null);
    setIsRefreshing(true);
    try {
      await refreshSession();
      
      // Set a timeout to avoid infinite refreshing
      setTimeout(() => {
        if (session.isLoading) {
          setIsRefreshing(false);
          setErrorMessage("Refresh timed out. Try resetting the application.");
        }
      }, 10000);
    } catch (error) {
      console.error('ProtectedRoute: Error during manual refresh:', error);
      setErrorMessage("Error refreshing session: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsRefreshing(false);
    }
  };

  // Auto-refresh when an error is detected but let the user see the error for at least 2 seconds
  useEffect(() => {
    let timeoutId: number;
    
    if (errorMessage && !isRefreshing && !session.isLoading) {
      timeoutId = window.setTimeout(() => {
        handleManualRefresh();
      }, 2000);
    }
    
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage, isRefreshing, session.isLoading]);

  // Show loading state while auth state is being determined
  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Verifying your session...</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 mb-4">Please wait while we load your account.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Loading for {loadingTime} seconds</p>
          
          {showRefreshButton && (
            <div className="mt-6 space-y-4">
              <p className="text-amber-600 dark:text-amber-400 text-sm">
                This is taking longer than expected.
              </p>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isRefreshing ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                    <span>Refreshing Session...</span>
                  </>
                ) : (
                  'Refresh Session'
                )}
              </button>
              
              {showResetButton && (
                <>
                  <p className="text-red-500 dark:text-red-400 text-sm mt-4">
                    Still having trouble? Try resetting the app state.
                  </p>
                  <button
                    onClick={resetAuthState}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Reset & Reload App
                  </button>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This will clear your local session data and reload the page. You'll need to sign in again.
                  </p>
                </>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can also try:
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside mt-2 text-left">
                  <li>Clearing your browser cookies</li>
                  <li>Using incognito/private browsing mode</li>
                  <li>Trying a different browser</li>
                  <li>Checking your internet connection</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If there's an error with the authentication state but we're not loading
  if (errorMessage && !session.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{errorMessage}</p>
          
          <div className="space-y-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>
            
            <button
              onClick={resetAuthState}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Reset & Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render based on authentication state
  return isAuthenticated ? renderProtectedContent() : renderAuthPage();
};

export default ProtectedRoute; 