import React, { createContext, useState, useContext } from 'react';
import { TabType } from '../types';

interface LayoutContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ 
      activeTab, 
      setActiveTab, 
      mobileMenuOpen, 
      setMobileMenuOpen 
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
} 