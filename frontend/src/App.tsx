import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { LayoutProvider } from './providers/LayoutProvider';
import { DataProvider } from './providers/DataProvider';
import { ToastProvider } from './components/ui/ToastContainer';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LayoutProvider>
          <DataProvider>
            <MainLayout />
          </DataProvider>
        </LayoutProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;