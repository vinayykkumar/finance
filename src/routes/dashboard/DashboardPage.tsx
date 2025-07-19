import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useData } from '../../providers/DataProvider';
import Dashboard from '../../components/features/dashboard/Dashboard';
import AIInsightsPanel from '../../components/features/ai/AIInsightsPanel';
import SearchBar from '../../components/ui/SearchBar';

interface DashboardPageProps {
  selectedMonth: Date;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedMonth }) => {
  const { transactions, categories, banks, formatIndianCurrency } = useData();
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    // Search across transactions
    const results = transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(query.toLowerCase()) ||
      banks.find(b => b.id === transaction.bank_id)?.name.toLowerCase().includes(query.toLowerCase()) ||
      categories.find(c => c.id === transaction.category_id)?.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Show top 5 results

    setSearchResults(results);
    setShowSearchResults(true);
  };


  return (
    <div className="space-y-8">
      {/* Dashboard Header with Search */}
      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Financial Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of your financial health for {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {/* Dashboard Search */}
          <div className="relative">
            <SearchBar
              placeholder="Search transactions, banks, categories..."
              onSearch={handleSearch}
              className="w-full md:w-80"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-64 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No results found
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                      Recent Transactions
                    </div>
                    {searchResults.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()} • {banks.find(b => b.id === transaction.bank_id)?.name}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatIndianCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

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