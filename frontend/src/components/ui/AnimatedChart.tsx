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
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value?: number;
  color?: string;
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

// Modern, vibrant color palette
const defaultColors = [
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
];

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  type,
  colors = defaultColors,
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
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2,
        ease: "easeOut"
      }
    }
  };

  const darkModeStyles = {
    text: isDarkMode ? '#D1D5DB' : '#4B5563',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    tooltip: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipText: isDarkMode ? '#F9FAFB' : '#111827',
    backdropFilter: 'blur(8px)',
    chartBackground: isDarkMode ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
  };

  // Get gradients for fill colors
  const getGradientOffset = () => {
    return {
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '1',
    };
  };

  // Custom Tooltip for modern look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          p-4 border-0 shadow-xl rounded-xl text-sm
          ${isDarkMode 
            ? 'bg-slate-800/95 text-slate-100 backdrop-blur-lg border-slate-700/50' 
            : 'bg-white/95 text-slate-800 backdrop-blur-lg border-slate-200/50'
          } transform transition-all duration-200 scale-100
        `}>
          <p className="font-semibold text-base mb-2 pb-2 border-b border-slate-700/20 dark:border-slate-200/10">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color || colors[index % colors.length] }}
                  />
                  <span className="font-medium">
                    {entry.name}
                  </span>
                </div>
                <span className="font-bold">
                  {Number(entry.value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute -left-1.5 w-3 h-3 transform rotate-45 
            ${isDarkMode 
              ? 'bg-slate-800/95' 
              : 'bg-white/95'
            }"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className={`w-full ${className} rounded-2xl overflow-hidden backdrop-blur-sm p-4
        ${isDarkMode 
          ? 'bg-slate-800/30 border border-slate-700/30' 
          : 'bg-white/30 border border-slate-200/30'
        }
      `}
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            className="cursor-pointer"
          >
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient 
                  key={`gradient-${key}`} 
                  id={`gradient-${key}`} 
                  {...getGradientOffset()}
                >
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={darkModeStyles.grid} />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: darkModeStyles.text, fontSize: 12 }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
              tickMargin={8}
            />
            <YAxis 
              tick={{ fill: darkModeStyles.text, fontSize: 12 }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
              tickMargin={8}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                stroke: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', 
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }}
            />
            {showLegend && (
              <Legend 
                wrapperStyle={{ 
                  color: darkModeStyles.text, 
                  fontSize: 12,
                  paddingTop: 20
                }} 
                iconType="circle"
                iconSize={8}
              />
            )}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={colors[index % colors.length]}
                fill={`url(#gradient-${key})`}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2, 
                  stroke: isDarkMode ? '#111827' : '#ffffff',
                  fill: colors[index % colors.length],
                  className: "drop-shadow-md"
                }}
                animationDuration={1800}
                animationEasing="ease-in-out"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            barCategoryGap={16}
            className="cursor-pointer"
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkModeStyles.grid} />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: darkModeStyles.text, fontSize: 12 }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
              tickMargin={8}
            />
            <YAxis 
              tick={{ fill: darkModeStyles.text, fontSize: 12 }} 
              tickLine={{ stroke: darkModeStyles.grid }}
              axisLine={{ stroke: darkModeStyles.grid }}
              tickMargin={8}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{
                fill: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(219, 234, 254, 0.8)', 
                radius: 4
              }}
              wrapperStyle={{
                zIndex: 100,
                pointerEvents: 'auto'
              }}
            />
            {showLegend && (
              <Legend 
                wrapperStyle={{ 
                  color: darkModeStyles.text, 
                  fontSize: 12,
                  paddingTop: 20
                }} 
                iconType="circle"
                iconSize={8}
              />
            )}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                animationDuration={1800}
                animationEasing="ease-in-out"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                activeBar={{ 
                  stroke: isDarkMode ? '#ffffff' : '#000000',
                  strokeOpacity: 0.2,
                  strokeWidth: 1,
                  filter: 'brightness(1.2) drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.3))'
                }}
                className="transition-all duration-300"
              >
                {data.map((entry, i) => {
                  const barColor = entry.color || colors[index % colors.length];
                  return (
                    <Cell 
                      key={`cell-${i}`} 
                      fill={barColor}
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </Bar>
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedChart;
