import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

interface AnimatedChartProps {
  data: ChartData[];
  type: 'area' | 'bar';
  colors?: string[];
  height?: number;
  dataKeys?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  isDarkMode?: boolean;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type,
  colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'],
  height = 300,
  dataKeys = ['value'],
  showLegend = true,
  showGrid = true,
  className = '',
  isDarkMode = false,
}) => {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const darkModeStyles = {
    text: isDarkMode ? '#D1D5DB' : '#4B5563',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltip: isDarkMode ? '#1F2937' : '#FFFFFF',
    tooltipText: isDarkMode ? '#F9FAFB' : '#111827',
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={darkModeStyles.grid} />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: darkModeStyles.text }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
            />
            <YAxis 
              tick={{ fill: darkModeStyles.text }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkModeStyles.tooltip,
                borderColor: darkModeStyles.grid,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: darkModeStyles.tooltipText
              }} 
            />
            {showLegend && <Legend wrapperStyle={{ color: darkModeStyles.text }} />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={`${colors[index % colors.length]}33`}
                activeDot={{ r: 8 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={darkModeStyles.grid} />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: darkModeStyles.text }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
            />
            <YAxis 
              tick={{ fill: darkModeStyles.text }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkModeStyles.tooltip,
                borderColor: darkModeStyles.grid,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: darkModeStyles.tooltipText
              }} 
            />
            {showLegend && <Legend wrapperStyle={{ color: darkModeStyles.text }} />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                animationDuration={1500}
                animationEasing="ease-out"
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedChart;
