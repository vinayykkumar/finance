import React from 'react';
import { useData } from '../../providers/DataProvider';
import BudgetSection from '../../components/features/budgets/BudgetSection';

interface BudgetsPageProps {
  selectedMonth: Date;
}

const BudgetsPage: React.FC<BudgetsPageProps> = ({ selectedMonth }) => {
  const { categories, formatIndianCurrency } = useData();

  return (
    <BudgetSection
      categories={categories}
      selectedMonth={selectedMonth}
      formatIndianCurrency={formatIndianCurrency}
    />
  );
};

export default BudgetsPage; 