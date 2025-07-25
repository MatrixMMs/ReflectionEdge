import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface PieChartRendererProps {
  data: PieChartDataPoint[];
  height?: number;
  outerRadius?: number;
}

export const PieChartRenderer: React.FC<PieChartRendererProps> = ({ data, height = 300, outerRadius = 80 }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-10">No tag data to display for pie chart.</p>;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = typeof value === 'number' ? `$${value.toFixed(2)}` : value;
      return (
        <div className="bg-gray-800 text-white p-2 border border-gray-600 rounded">
          <p className="label">{`${payload[0].name} : ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Basic label
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
          itemStyle={{ color: '#D1D5DB' }}
          content={CustomTooltip}
        />
        <Legend 
          formatter={(value, entry) => <span style={{color: entry.color}}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
    