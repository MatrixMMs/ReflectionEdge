import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProcessedChartData, ChartYAxisMetric, ChartXAxisMetric } from '../../types';
import { DEFAULT_CHART_COLOR, COMPARISON_CHART_COLOR } from '../../constants';

interface LineChartRendererProps {
  data: ProcessedChartData | null;
  comparisonData?: ProcessedChartData | null;
  yAxisMetric: ChartYAxisMetric;
  xAxisMetric: ChartXAxisMetric;
}

export const LineChartRenderer: React.FC<LineChartRendererProps> = ({ data, comparisonData, yAxisMetric, xAxisMetric }) => {
  
  if (!data || data.data.length === 0) {
    return <p className="text-center text-gray-500 py-10">No data available for the selected criteria. Adjust filters or add trades.</p>;
  }

  const yAxisLabel = yAxisMetric;
  let xAxisDataKey = "xValue";
  
  // Determine X-axis label based on metric
  let xAxisLabel = "";
  if (xAxisMetric === ChartXAxisMetric.TRADE_SEQUENCE) {
    xAxisLabel = "Trade Sequence";
  } else if (xAxisMetric === ChartXAxisMetric.TIME) {
    xAxisLabel = "Time";
  }

  // Combine data for comparison if available
  let combinedData: any[] = [...data.data];
  let allSeriesKeys = [...data.seriesKeys];

  if (comparisonData && comparisonData.data.length > 0) {
    const comparisonSeriesWithSuffix = comparisonData.seriesKeys.map(sk => ({
      ...sk,
      key: `${sk.key}_comp`,
      name: `${sk.name} (Compare)`,
      color: COMPARISON_CHART_COLOR // Or derive a different color
    }));
    allSeriesKeys = [...allSeriesKeys, ...comparisonSeriesWithSuffix];

    // Need to merge data carefully if X-axis values might overlap
    // For simplicity, assume comparison data is a separate set to plot alongside
    // This might need more sophisticated merging if xValues are shared
    // For now, if xValues are trade sequence, they will likely be different ranges or need alignment
    // If xValues are dates, they might align.
    
    // A simple approach if X values are numbers (like trade sequence):
    // This is tricky. For now, let's assume we just render both sets of lines.
    // Recharts handles multiple lines with potentially different x-value sets if they are all numeric/categorical.
    // If xValue is time, it's easier.

    // The current `processChartData` creates series. If `selectedTagsForChart` is empty, it makes one 'Overall P&L' series.
    // If tags are selected, it makes one series per tag.
    // The `comparisonData` will also have its own set of series.
    
    // If both `data` and `comparisonData` are for 'Overall P&L', we need to make their keys distinct.
    // The `processChartData` already adds `_comp` suffix to series keys in `comparisonData`.
    
    // We need to ensure that the `data` array passed to Recharts has all necessary keys.
    // Merge strategy: Create a union of all xValues and populate yValues.
    const allXValues = new Set([...data.data.map(d => d.xValue), ...comparisonData.data.map(d => d.xValue)]);
    const sortedXValues = Array.from(allXValues).sort((a,b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b)));

    combinedData = sortedXValues.map(x => {
        const basePoint = data.data.find(d => d.xValue === x) || {};
        const compPoint: {[key: string]: any} = comparisonData.data.find(d => d.xValue === x) || {};
        
        // Rename comparison point keys
        const renamedCompPoint: {[key: string]: any} = {};
        for(const key in compPoint) {
            if (key !== 'xValue') {
                // Check if key already has _comp suffix to avoid double suffix
                const newKey = key.endsWith('_comp') ? key : `${key}_comp`;
                renamedCompPoint[newKey] = compPoint[key];
            }
        }
        return { xValue: x, ...basePoint, ...renamedCompPoint };
    });
  }


  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis 
          dataKey={xAxisDataKey} 
          stroke="#9CA3AF" 
          tick={{ fontSize: 12 }}
          label={{ value: xAxisLabel, position: 'insideBottom', offset: -15, fill: '#9CA3AF', fontSize: 14 }}
        />
        <YAxis 
          stroke="#9CA3AF" 
          tick={{ fontSize: 12 }}
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 14, dx: -10 }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
          itemStyle={{ color: '#D1D5DB' }}
        />
        <Legend wrapperStyle={{paddingTop: '15px'}} formatter={(value, entry) => <span style={{color: entry.color}}>{value}</span>}/>
        {allSeriesKeys.map((series) => (
          <Line
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.name}
            stroke={series.color || DEFAULT_CHART_COLOR}
            strokeWidth={2}
            dot={{ r: 3, fill: series.color || DEFAULT_CHART_COLOR, strokeWidth: 1, stroke: '#1A202C' }}
            activeDot={{ r: 6, fill: series.color || DEFAULT_CHART_COLOR, strokeWidth: 2, stroke: '#CBD5E0' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
    