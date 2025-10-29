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
import AnalysisResults from "./AnalysisResults";

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

        console.log('Progress Data Received:', progress); // Debug log
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

  // Format data for Seguin chart - ONLY REAL DATA
  const formatSeguinChartData = () => {
    if (!progressData?.timeSeriesData?.length) return [];
    
    return progressData.timeSeriesData
      .filter(entry => entry.seguin !== null && entry.seguin !== undefined)
      .map((entry) => ({
        date: entry.date || "Unknown",
        time: entry.seguin,
        standardTime: progressData.benchmarks?.seguin?.standardTime || 80,
      }));
  };

  // Format data for Monkey Type chart - ONLY REAL DATA
  const formatMonkeyChartData = () => {
    if (!progressData?.timeSeriesData?.length) return [];
    
    return progressData.timeSeriesData
      .filter(entry => entry.monkey !== null && entry.monkey !== undefined)
      .map((entry) => {
        const wpm = entry.monkey || 0;
        const accuracy = entry.monkeyAccuracy || 80;
        const targetWpm = progressData.benchmarks?.monkey?.targetWpm || 40;

        return {
          date: entry.date || "Unknown",
          wpm,
          accuracy,
          targetWpm,
        };
      });
  };

  // Check if we have real data for specific games
  const hasSeguinData = progressData?.gameDistribution?.seguin > 0 || formatSeguinChartData().length > 0;
  const hasMonkeyData = progressData?.gameDistribution?.monkey > 0 || formatMonkeyChartData().length > 0;
  const hasJigsawData = progressData?.gameDistribution?.jigsaw > 0;
  
  const hasAnyGameData = hasSeguinData || hasMonkeyData || hasJigsawData;
  const hasRealData = progressData?.totalSessions > 0;

  // Format game distribution data - ONLY REAL GAMES
  const getGameDistributionData = () => {
    if (!progressData?.gameDistribution) return [];
    
    const distribution = [];
    
    if (progressData.gameDistribution.seguin > 0) {
      distribution.push({
        name: "Seguin Form Board",
        percentage: progressData.gameDistribution.seguin,
      });
    }
    
    if (progressData.gameDistribution.monkey > 0) {
      distribution.push({
        name: "Monkey Time",
        percentage: progressData.gameDistribution.monkey,
      });
    }
    
    if (progressData.gameDistribution.jigsaw > 0) {
      distribution.push({
        name: "Jigsaw Puzzle",
        percentage: progressData.gameDistribution.jigsaw,
      });
    }
    
    return distribution;
  };

  const seguinChartData = formatSeguinChartData();
  const monkeyChartData = formatMonkeyChartData();
  const gameDistributionData = getGameDistributionData();

  // Determine which charts to show based on REAL data
  const showSeguinChart = (selectedGame === "all" || selectedGame === "seguin") && hasSeguinData;
  const showMonkeyChart = (selectedGame === "all" || selectedGame === "monkey") && hasMonkeyData;
  const showGameUsageChart = gameDistributionData.length > 0;

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]"></div>
      </div>
    );
  }

  // Render error state
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

  // Show message if no data
  if (!hasRealData || !hasAnyGameData) {
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
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold text-[#66220B] mb-4">No Progress Data Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't played any games yet or there's no data for the selected time period.
            Play some games to start tracking your progress!
          </p>
          <div className="flex justify-center">
            <a
              href="/games"
              className="bg-[#F09000] text-white py-2 px-6 rounded-full hover:bg-[#D87D00] transition-colors"
            >
              Go to Games
            </a>
          </div>
        </div>
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
            {hasSeguinData && <option value="seguin">Seguin Form Board</option>}
            {hasMonkeyData && <option value="monkey">Monkey Time</option>}
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

      {/* Game Usage Pie Chart - ONLY if we have distribution data */}
      {showGameUsageChart && (
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
      )}

      {/* Seguin Form Board Performance - ONLY if data exists */}
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
                <YAxis label={{ value: "Time (seconds)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#FF8042"
                  name="Your Time"
                  activeDot={{ r: 8 }}
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

      {/* Monkey Type Performance - ONLY if data exists */}
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
                  domain={[0, "dataMax + 10"]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Accuracy %", angle: 90, position: "insideRight" }}
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#FF8042"
                  name="Your Speed (WPM)"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="targetWpm"
                  stroke="#0088FE"
                  name="Target Speed"
                  strokeDasharray="5 5"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#28a745"
                  name="Accuracy %"
                  fillOpacity={0.3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cognitive Skills Analysis - ONLY if real data exists */}
      {progressData?.cognitiveSkills?.length > 0 && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">Cognitive Skills Analysis</h3>
          <p className="text-gray-500 mb-4">
            Based on your game performance, we've analyzed your cognitive abilities across different areas.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData.cognitiveSkills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Skill Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Behavior Analysis Results */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Behavior Analysis Results</h3>
        {analysisHistory.length === 0 ? (
          <p className="text-gray-500">No analysis results yet. Upload a video to get started.</p>
        ) : (
          <div className="space-y-6">
            {analysisHistory.slice(0, 3).map((analysis, index) => (
              <AnalysisResults key={analysis._id || index} analysis={analysis} />
            ))}
          </div>
        )}
      </div>

      {/* Performance Summary - ONLY show real metrics */}
      {hasRealData && (
        <div className="bg-white p-6 rounded-lg mt-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-[#F09000] text-lg font-semibold mb-2">
                Improvement
              </h4>
              <p className="text-3xl font-bold text-[#66220B]">
                {progressData?.improvementMetrics?.seguin || progressData?.improvementMetrics?.monkey || 0}%
              </p>
              <p className="text-sm text-gray-500">Since first assessment</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
              <h4 className="text-[#F09000] text-lg font-semibold mb-2">Sessions</h4>
              <p className="text-3xl font-bold text-[#66220B]">{progressData?.totalSessions || 0}</p>
              <p className="text-sm text-gray-500">Total completed</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
              <h4 className="text-[#F09000] text-lg font-semibold mb-2">Games Played</h4>
              <p className="text-3xl font-bold text-[#66220B]">
                {[hasSeguinData, hasMonkeyData, hasJigsawData].filter(Boolean).length}
              </p>
              <p className="text-sm text-gray-500">Different games</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressSettings;