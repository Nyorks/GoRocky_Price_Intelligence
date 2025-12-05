import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../api/client';
import type { PriceHistoryPoint } from '../types';

interface Props {
  productId: string;
}

function PriceHistoryChart({ productId }: Props) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [productId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getHistory(productId, 30);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load price history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (history.length === 0) {
    return <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
      No historical data available yet. Run the scraper multiple times to build history.
    </p>;
  }

  // Transform data for Recharts
  // Group by date and create data points
  const groupedByDate = new Map<string, { date: string; [key: string]: any }>();

  history.forEach(point => {
    const dateKey = new Date(point.date).toLocaleDateString();
    
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, { date: dateKey });
    }
    
    const entry = groupedByDate.get(dateKey)!;
    entry[point.competitorName] = point.price;
  });

  const chartData = Array.from(groupedByDate.values());

  // Get unique competitor names for lines
  const competitors = Array.from(new Set(history.map(h => h.competitorName)));

  // Color palette for different competitors
  const colors = ['#4f46e5', '#059669', '#dc2626', '#f59e0b', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          style={{ fontSize: 12 }}
        />
        <YAxis 
          style={{ fontSize: 12 }}
          label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: 13,
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: 13 }}
        />
        {competitors.map((competitor, index) => (
          <Line
            key={competitor}
            type="monotone"
            dataKey={competitor}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceHistoryChart;

