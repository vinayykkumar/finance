import React from 'react';
import { useData } from '../../providers/DataProvider';
import GoalsSection from '../../components/features/goals/GoalsSection';

const GoalsPage: React.FC = () => {
  const { formatIndianCurrency } = useData();

  return (
    <GoalsSection
      formatIndianCurrency={formatIndianCurrency}
    />
  );
};

export default GoalsPage; 