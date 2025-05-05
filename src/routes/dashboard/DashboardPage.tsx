import React from 'react';
import { useData } from '../../providers/DataProvider';
import Dashboard from '../../components/features/dashboard/Dashboard';

interface DashboardPageProps {
  selectedMonth: Date;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedMonth }) => {
  const { transactions, categories, banks, formatIndianCurrency } = useData();

  return (
    <Dashboard 
      transactions={transactions} 
      categories={categories} 
      banks={banks} 
      selectedMonth={selectedMonth}
      formatIndianCurrency={formatIndianCurrency}
    />
  );
};

export default DashboardPage; 