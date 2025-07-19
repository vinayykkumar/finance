import React from 'react';
import { useData } from '../../providers/DataProvider';
import Dashboard from '../../components/features/dashboard/Dashboard';
import AIInsightsPanel from '../../components/features/ai/AIInsightsPanel';

interface DashboardPageProps {
  selectedMonth: Date;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedMonth }) => {
  const { transactions, categories, banks, formatIndianCurrency } = useData();

  return (
    <div className="space-y-8">
      <Dashboard 
        transactions={transactions} 
        categories={categories} 
        banks={banks} 
        selectedMonth={selectedMonth}
        formatIndianCurrency={formatIndianCurrency}
      />
      
      <AIInsightsPanel 
        formatIndianCurrency={formatIndianCurrency}
      />
    </div>
  );
};

export default DashboardPage; 