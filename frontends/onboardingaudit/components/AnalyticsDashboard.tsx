import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  period: string;
  summary: {
    totalVisits: number;
    totalUniqueVisitors: number;
    totalSubmissions: number;
    conversionRate: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;
    visitsGrowth: number;
  };
  dailyStats: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  devices: Record<string, number>;
}

interface AnalyticsDashboardProps {
  projectId: string;
}

export default function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Usar URL del dominio principal para analytics
      const response = await fetch('https://uaylabs.web.app/onboardingaudit/api/admin/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          period,
          userId: 'luisdaniel883@gmail.com_onboardingaudit'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        setError('Error loading analytics data.');
      }
    } catch (error) {
      setError('Failed to load analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period, projectId]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-300">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de período */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {['1d', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {p === '1d' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {formatNumber(analyticsData.summary.totalVisits)}
          </div>
          <div className="text-sm text-gray-300">Total Visits</div>
          <div className={`text-xs mt-1 ${getGrowthColor(analyticsData.summary.visitsGrowth)}`}>
            {getGrowthIcon(analyticsData.summary.visitsGrowth)} {formatPercentage(analyticsData.summary.visitsGrowth)}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {formatNumber(analyticsData.summary.totalUniqueVisitors)}
          </div>
          <div className="text-sm text-gray-300">Unique Visitors</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {formatNumber(analyticsData.summary.totalSubmissions)}
          </div>
          <div className="text-sm text-gray-300">Submissions</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {formatPercentage(analyticsData.summary.conversionRate)}
          </div>
          <div className="text-sm text-gray-300">Conversion Rate</div>
        </div>
      </div>

      {/* Métricas de engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Avg. Time on Page</span>
              <span className="text-white font-medium">
                {formatTime(analyticsData.summary.avgTimeOnPage)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg. Scroll Depth</span>
              <span className="text-white font-medium">
                {formatPercentage(analyticsData.summary.avgScrollDepth)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Top Referrers</h3>
          <div className="space-y-2">
            {analyticsData.topReferrers.map((referrer, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm truncate flex-1">
                  {referrer.referrer === 'direct' ? 'Direct Traffic' : referrer.referrer}
                </span>
                <span className="text-white font-medium ml-2">
                  {formatNumber(referrer.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispositivos */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(analyticsData.devices).map(([device, count]) => (
            <div key={device} className="text-center">
              <div className="text-lg font-bold text-white">
                {formatNumber(count)}
              </div>
              <div className="text-sm text-gray-300 capitalize">
                {device}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de visitas diarias */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Visits</h3>
        <div className="space-y-2">
          {analyticsData.dailyStats.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-300">
                {new Date(day.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex-1">
                <div className="bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((day.visits / Math.max(...analyticsData.dailyStats.map(d => d.visits))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-white font-medium">
                {formatNumber(day.visits)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de refresh */}
      <div className="text-center">
        <button
          onClick={loadAnalytics}
          className="btn-secondary"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
} 