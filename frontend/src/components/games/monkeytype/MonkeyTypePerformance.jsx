import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, 
  ComposedChart, Area
} from 'recharts';
import { progressService } from '../../utils/apiService';

// This is a section to add to your ProgressSettings.jsx component

const MonkeyTypePerformance = ({ progressData, hasRealData }) => {
  // Sample data for demo in case real data isn't available
  const sampleMonkeyData = [
    { date: 'Week 1', wpm: 25, accuracy: 72, targetWpm: 40 },
    { date: 'Week 2', wpm: 31, accuracy: 78, targetWpm: 40 },
    { date: 'Week 3', wpm: 36, accuracy: 85, targetWpm: 40 },
    { date: 'Week 4', wpm: 42, accuracy: 88, targetWpm: 40 },
    { date: 'Week 5', wpm: 45, accuracy: 92, targetWpm: 40 },
  ];

  // Format data for Monkey Type chart
  const formatMonkeyChartData = () => {
    // If we have real time series data, format it for the chart
    if (progressData?.timeSeriesData && progressData.timeSeriesData.length > 0) {
      return progressData.timeSeriesData.map(entry => {
        // Extract typing speed and accuracy
        // The raw data might store typing speed as completionTime for the monkey game
        // We may need to convert this to WPM
        
        const wpm = entry.wpm || 
                   (entry.monkey && typeof entry.monkey === 'number' ? entry.monkey : 0);
        
        // Get accuracy or default to 80%
        const accuracy = entry.accuracy || 
                        (entry.monkeyAccuracy ? entry.monkeyAccuracy : 80);
        
        // Standard target WPM
        const targetWpm = progressData.benchmarks?.monkey?.targetWpm || 40;
        
        return {
          date: entry.date || 'Unknown',
          wpm: wpm,
          accuracy: accuracy,
          targetWpm: targetWpm
        };
      });
    }
    
    // If no real data, return sample data
    return sampleMonkeyData;
  };

  // Get chart data
  const monkeyChartData = formatMonkeyChartData();
  
  return (
    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#66220B] mb-4">Monkey Type Performance</h3>
      <p className="text-gray-500 mb-4">
        This chart shows your typing speed (higher is better) and accuracy over time.
      </p>
      {!hasRealData && (
        <p className="text-xs text-gray-500 mb-2 italic">
          Showing sample data. Play games to see your real statistics.
        </p>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={monkeyChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="left" 
              label={{ value: 'WPM', angle: -90, position: 'insideLeft' }} 
              domain={[0, 'dataMax + 10']}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: 'Accuracy %', angle: 90, position: 'insideRight' }} 
              domain={[0, 100]}
            />
            <Tooltip />
            <Legend />
            
            {/* WPM Line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="wpm" 
              stroke="#FF8042" 
              name="Your Speed (WPM)" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            
            {/* Target WPM Line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="targetWpm" 
              stroke="#0088FE" 
              name="Target Speed" 
              strokeDasharray="5 5" 
            />
            
            {/* Accuracy Area */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              fill="#82ca9d"
              stroke="#28a745"
              name="Accuracy %"
              fillOpacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonkeyTypePerformance;