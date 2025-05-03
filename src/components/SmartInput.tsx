import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

interface SmartInputProps {
  onParsed: (data: {
    amount: number;
    description: string;
    category?: string;
    date?: Date;
    type: 'expense' | 'income';
  }) => void;
  categories: Array<{ id: string; name: string; type: string }>;
}

const SmartInput: React.FC<SmartInputProps> = ({ onParsed, categories }) => {
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      parseNaturalLanguage();
    }
  };

  const parseNaturalLanguage = () => {
    const inputText = input.trim().toLowerCase();
    
    // Basic parsing logic
    const amountMatch = inputText.match(/(₹|rs\.?|inr|rs|rupees?)\s*(\d+(\.\d+)?)|(\d+(\.\d+)?)\s*(₹|rs\.?|inr|rs|rupees?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[2] || amountMatch[4]) : 0;
    
    // Check for date
    const dateKeywords = ['yesterday', 'today', 'last week', 'last month'];
    let date = new Date();
    if (inputText.includes('yesterday')) {
      date.setDate(date.getDate() - 1);
    } else if (inputText.includes('last week')) {
      date.setDate(date.getDate() - 7);
    } else if (inputText.includes('last month')) {
      date.setMonth(date.getMonth() - 1);
    }
    
    // Determine transaction type
    const isIncome = /received|earned|salary|income|got paid/i.test(inputText);
    const type = isIncome ? 'income' : 'expense';
    
    // Try to match category
    let matchedCategory = undefined;
    for (const category of categories) {
      if (inputText.includes(category.name.toLowerCase()) && category.type === type) {
        matchedCategory = category.id;
        break;
      }
    }
    
    // Extract description (remove amount and category)
    let description = inputText
      .replace(/(₹|rs\.?|inr|rs|rupees?)\s*(\d+(\.\d+)?)/gi, '')
      .replace(/(\d+(\.\d+)?)\s*(₹|rs\.?|inr|rs|rupees?)/gi, '')
      .replace(/(yesterday|today|last week|last month)/gi, '')
      .trim();
    
    if (description.startsWith('for')) {
      description = description.substring(3).trim();
    }
    
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
    
    onParsed({
      amount,
      description,
      category: matchedCategory,
      date,
      type
    });
    
    setInput('');
  };

  return (
    <div className="relative w-full">
      <Tippy
        content="Try typing: 'Spent ₹400 for groceries yesterday'"
        visible={showTooltip}
        placement="top"
        animation="scale"
        theme="light"
        arrow={true}
        duration={300}
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter transaction in natural language..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
        />
      </Tippy>
      <button
        onClick={parseNaturalLanguage}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-300"
      >
        Add
      </button>
    </div>
  );
};

export default SmartInput;
