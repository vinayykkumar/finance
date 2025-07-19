import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { LayoutProvider } from './providers/LayoutProvider';
import { DataProvider } from './providers/DataProvider';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default App;