import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts";

import { progressService, analysisService } from "../../utils/apiService";
import AnalysisResults from "./AnalysisResults"; // Your component for analysis cards

const ProgressSettings = ({ userData }) => {
  const [progressData, setProgressData] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState("all");
  const [timeFrame, setTimeFrame] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [progress, analysis] = await Promise.all([
          progressService.getProgressData(selectedGame, timeFrame),
          analysisService.getAnalysisHistory(),
        ]);

        setProgressData(progress);
        setAnalysisHistory(analysis);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load progress or analysis data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedGame, timeFrame]);

  const sampleSeguinData = [
    /* ... */
  ]; // Same as before
  const sampleMonkeyData = [
    /* ... */
  ]; // Same as before
  const sampleSkills = [
    /* ... */
  ]; // Same as before

  const formatSeguinChartData = () => {
    if (progressData?.timeSeriesData?.length) {
      return progressData.timeSeriesData.map((entry) => ({
        date: entry.date || "Unknown",
        time: entry.seguin || entry.time || 0,
        standardTime:
          entry.standardTime ||
          progressData.benchmarks?.seguin?.standardTime ||
          80,
      }));
    }
    return sampleSeguinData;
  };

  const formatMonkeyChartData = () => {
    if (progressData?.timeSeriesData?.length) {
      return progressData.timeSeriesData.map((entry) => ({
        date: entry.date || "Unknown",
        wpm: entry.wpm || entry.monkey || 0,
        accuracy: entry.accuracy || entry.monkeyAccuracy || 80,
        targetWpm: progressData.benchmarks?.monkey?.targetWpm || 40,
      }));
    }
    return sampleMonkeyData;
  };

  const hasRealData =
    progressData &&
    (progressData.timeSeriesData?.length ||
      progressData.gameDistribution?.seguin ||
      progressData.gameDistribution?.monkey);

  const gameDistributionData = [
    {
      name: "Seguin Form Board",
      percentage: progressData?.gameDistribution?.seguin || 65,
    },
    {
      name: "Monkey Time",
      percentage: progressData?.gameDistribution?.monkey || 35,
    },
  ];

  const seguinChartData = formatSeguinChartData();
  const monkeyChartData = formatMonkeyChartData();

  const showSeguinChart = selectedGame === "all" || selectedGame === "seguin";
  const showMonkeyChart = selectedGame === "all" || selectedGame === "monkey";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#F09000] text-white py-2 px-4 rounded hover:bg-[#D87D00]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="progress-settings">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#66220B]">Progress Tracking</h2>
        <div className="flex space-x-2">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
          >
            <option value="all">All Games</option>
            <option value="seguin">Seguin Form Board</option>
            <option value="monkey">Monkey Time</option>
          </select>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Game Usage Pie Chart */}
      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">
          Game Usage
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gameDistributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                dataKey="percentage"
              >
                {gameDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      {showSeguinChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Seguin Form Board Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seguinChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  label={{
                    value: "Time (s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#FF8042"
                  name="Your Time"
                />
                <Line
                  type="monotone"
                  dataKey="standardTime"
                  stroke="#0088FE"
                  name="Standard Time"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showMonkeyChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Monkey Type Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monkeyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  label={{ value: "WPM", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Accuracy %",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#FF8042"
                  name="WPM"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="targetWpm"
                  stroke="#0088FE"
                  strokeDasharray="5 5"
                  name="Target WPM"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#28a745"
                  fill="#82ca9d"
                  name="Accuracy %"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cognitive Skills */}
      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">
          Cognitive Skills Analysis
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData?.cognitiveSkills || sampleSkills}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Skill Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavior Analysis Results */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">
          Behavior Analysis Results
        </h3>
        {analysisHistory.length === 0 ? (
          <p className="text-gray-500">
            No analysis results yet. Upload a video to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {analysisHistory.slice(0, 3).map((analysis, index) => (
              <AnalysisResults
                key={analysis._id || index}
                analysis={analysis}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg mt-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">
              Improvement
            </h4>
            <p className="text-3xl font-bold text-[#66220B]">
              {progressData?.improvementMetrics?.seguin || 45}%
            </p>
            <p className="text-sm text-gray-500">Since first assessment</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">
              Sessions
            </h4>
            <p className="text-3xl font-bold text-[#66220B]">
              {progressData?.totalSessions || 28}
            </p>
            <p className="text-sm text-gray-500">Total completed</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">
              Percentile
            </h4>
            <p className="text-3xl font-bold text-[#66220B]">75th</p>
            <p className="text-sm text-gray-500">Among your age group</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSettings;
