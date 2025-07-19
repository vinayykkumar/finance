import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Trophy, 
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getFinancialInsights, getSpendingPredictions, detectSpendingAnomalies } from '../../../lib/ai-service';
import type { FinancialInsight, SpendingPrediction, SpendingAnomaly } from '../../../lib/ai-service';

interface AIInsightsPanelProps {
  formatIndianCurrency: (amount: number) => string;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ formatIndianCurrency }) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<SpendingAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'anomalies'>('insights');

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    setLoading(true);
    try {
      const [insightsData, predictionsData, anomaliesData] = await Promise.all([
        getFinancialInsights(),
        getSpendingPredictions(),
        detectSpendingAnomalies()
      ]);
      
      setInsights(insightsData);
      setPredictions(predictionsData);
      setAnomalies(anomaliesData);
    } catch (error) {
      console.error('Failed to load AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-green-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20';
      case 'tip':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'achievement':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default:
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                AI Financial Insights
                <Sparkles className="h-5 w-5 text-purple-500" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by intelligent analysis of your spending patterns
              </p>
            </div>
          </div>
          <motion.button
            onClick={loadAIData}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        {[
          { id: 'insights', label: 'Insights', count: insights.length },
          { id: 'predictions', label: 'Predictions', count: predictions.length },
          { id: 'anomalies', label: 'Anomalies', count: anomalies.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing your financial data...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No insights available yet. Add more transactions to get AI-powered recommendations.</p>
                  </div>
                ) : (
                  insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-xl border ${getInsightColor(insight.type)}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {insight.message}
                          </p>
                          {insight.action_items.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Action Items:
                              </p>
                              {insight.action_items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <ChevronRight className="h-3 w-3 text-gray-400" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority >= 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          insight.priority >= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          Priority {insight.priority}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'predictions' && (
              <motion.div
                key="predictions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {predictions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No predictions available yet. Add more transaction history to get spending forecasts.</p>
                  </div>
                ) : (
                  predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.category_id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTrendIcon(prediction.trend)}
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              Category ID: {prediction.category_id}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              Trend: {prediction.trend}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {formatIndianCurrency(prediction.predicted_amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(prediction.confidence * 100).toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {prediction.recommendation}
                      </p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'anomalies' && (
              <motion.div
                key="anomalies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {anomalies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No spending anomalies detected. Your spending patterns look normal!</p>
                  </div>
                ) : (
                  anomalies.map((anomaly, index) => (
                    <motion.div
                      key={anomaly.category_id}
                      className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                            {anomaly.category_name} - Unusual Spending
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {anomaly.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Average: {formatIndianCurrency(anomaly.average_amount)}</span>
                            <span>Unusual: {formatIndianCurrency(anomaly.unusual_amount)}</span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              +{anomaly.deviation_percentage.toFixed(0)}% above normal
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;