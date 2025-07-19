import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search transactions...", 
  onSearch,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`relative flex items-center transition-all duration-300 ${
        isFocused 
          ? 'ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/10' 
          : 'shadow-sm'
      }`}>
        <Search className="absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
                   border border-gray-200/50 dark:border-gray-700/50 rounded-xl
                   text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:border-sky-500 transition-all duration-300"
        />
        {query && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.form>
  );
};

export default SearchBar;