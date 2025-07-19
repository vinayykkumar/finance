import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { LayoutProvider } from './providers/LayoutProvider';
import { DataProvider } from './providers/DataProvider';
import { AuthProvider } from './providers/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthPage from './components/auth/AuthPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LayoutProvider>
          <DataProvider>
            <ProtectedRoute
              renderAuthPage={() => <AuthPage />}
              renderProtectedContent={() => <MainLayout />}
            />
          </DataProvider>
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;