import React from 'react';
import {
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

const MonkeyTypePerformance = ({ progressData, hasRealData }) => {
  const sampleMonkeyData = [
    { date: 'Week 1', wpm: 25, accuracy: 72, targetWpm: 40 },
    { date: 'Week 2', wpm: 31, accuracy: 78, targetWpm: 40 },
    { date: 'Week 3', wpm: 36, accuracy: 85, targetWpm: 40 },
    { date: 'Week 4', wpm: 42, accuracy: 88, targetWpm: 40 },
    { date: 'Week 5', wpm: 45, accuracy: 92, targetWpm: 40 },
  ];

  const formatMonkeyChartData = () => {
    if (progressData?.timeSeriesData && progressData.timeSeriesData.length > 0) {
      return progressData.timeSeriesData.map(entry => {
        const wpm = entry.wpm ||
          (entry.monkey && typeof entry.monkey === 'number' ? entry.monkey : 0);
        const accuracy = entry.accuracy ||
          (entry.monkeyAccuracy ? entry.monkeyAccuracy : 80);
        const targetWpm = progressData.benchmarks?.monkey?.targetWpm || 40;

        return {
          date: entry.date || 'Unknown',
          wpm,
          accuracy,
          targetWpm
        };
      });
    }

    return sampleMonkeyData;
  };

  const monkeyChartData = formatMonkeyChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-md text-xs sm:text-sm border border-gray-200">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Accuracy') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-lg mb-4 sm:mb-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-semibold text-[#66220B] mb-2 sm:mb-4">
        Monkey Type Performance
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
        This chart shows your typing speed (higher is better) and accuracy over time.
      </p>
      {!hasRealData && (
        <p className="text-xs text-gray-500 mb-2 italic">
          Showing sample data. Play games to see your real statistics.
        </p>
      )}

      <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={monkeyChartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: '0.7rem' }}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              label={{
                value: 'WPM',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: '0.7rem' },
                dx: -10
              }}
              domain={[0, 'dataMax + 10']}
              tick={{ fontSize: '0.7rem' }}
              width={25}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: 'Accuracy %',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: '0.7rem' },
                dx: 10
              }}
              domain={[0, 100]}
              tick={{ fontSize: '0.7rem' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.7rem', paddingTop: '8px' }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              stroke="#FF8042"
              name="Your Speed (WPM)"
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="targetWpm"
              stroke="#0088FE"
              name="Target Speed"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
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

      <div className="mt-2 text-xs text-gray-500 hidden sm:block">
        <ul className="flex flex-wrap gap-4">
          <li className="flex items-center">
            <div className="w-3 h-3 bg-[#FF8042] mr-1"></div> Your typing speed
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 bg-[#0088FE] mr-1"></div> Target speed
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 bg-[#82ca9d] mr-1"></div> Your accuracy
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MonkeyTypePerformance;
