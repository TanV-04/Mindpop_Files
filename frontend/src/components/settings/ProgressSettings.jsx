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

  // Sample data for when no real data is available
  const sampleSeguinData = [
    { date: "Week 1", time: 120, standardTime: 80 },
    { date: "Week 2", time: 100, standardTime: 80 },
    { date: "Week 3", time: 85, standardTime: 80 },
    { date: "Week 4", time: 75, standardTime: 80 },
    { date: "Week 5", time: 65, standardTime: 80 },
  ];

  const sampleMonkeyData = [
    { date: "Week 1", wpm: 25, accuracy: 72, targetWpm: 40 },
    { date: "Week 2", wpm: 31, accuracy: 78, targetWpm: 40 },
    { date: "Week 3", wpm: 36, accuracy: 85, targetWpm: 40 },
    { date: "Week 4", wpm: 42, accuracy: 88, targetWpm: 40 },
    { date: "Week 5", wpm: 45, accuracy: 92, targetWpm: 40 },
  ];

  const sampleJigsawData = [
    { date: "Week 1", time: 240, standardTime: 180, pieces: 12 },
    { date: "Week 2", time: 210, standardTime: 180, pieces: 12 },
    { date: "Week 3", time: 190, standardTime: 180, pieces: 16 },
    { date: "Week 4", time: 165, standardTime: 180, pieces: 16 },
    { date: "Week 5", time: 150, standardTime: 180, pieces: 24 },
  ];

  const sampleSkills = [
    { name: "Pattern Recognition", value: 85 },
    { name: "Hand-Eye Coordination", value: 70 },
    { name: "Visual Processing", value: 75 },
    { name: "Spatial Awareness", value: 80 },
    { name: "Focus", value: 65 },
  ];

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

  // Format data for Seguin chart
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

  // Format data for Monkey Type chart
  const formatMonkeyChartData = () => {
    if (progressData?.timeSeriesData?.length) {
      return progressData.timeSeriesData.map((entry) => {
        const wpm = entry.wpm || (typeof entry.monkey === "number" ? entry.monkey : 0);
        const accuracy = entry.accuracy || entry.monkeyAccuracy || 80;
        const targetWpm = progressData.benchmarks?.monkey?.targetWpm || 40;

        return {
          date: entry.date || "Unknown",
          wpm,
          accuracy,
          targetWpm,
        };
      });
    }
    return sampleMonkeyData;
  };

  // Format data for Jigsaw chart
  const formatJigsawChartData = () => {
    if (progressData?.timeSeriesData?.length) {
      return progressData.timeSeriesData.map((entry) => {
        const time = entry.jigsaw || entry.jigsawTime || 0;
        const pieces = entry.jigsawPieces || 16;
        const standardTime = progressData.benchmarks?.jigsaw?.standardTime || 180;

        return {
          date: entry.date || "Unknown",
          time,
          standardTime,
          pieces,
        };
      });
    }
    return sampleJigsawData;
  };

  // Check if we have real data
  const hasRealData =
    progressData &&
    (progressData.timeSeriesData?.length ||
      progressData.gameDistribution?.seguin ||
      progressData.gameDistribution?.monkey ||
      progressData.gameDistribution?.jigsaw);

  // Format game distribution data
  const gameDistributionData = [
    {
      name: "Seguin Form Board",
      percentage: progressData?.gameDistribution?.seguin || 45,
    },
    { name: "Monkey Time", percentage: progressData?.gameDistribution?.monkey || 30 },
    { name: "Jigsaw", percentage: progressData?.gameDistribution?.jigsaw || 25 },
  ];

  // Get chart data
  const seguinChartData = formatSeguinChartData();
  const monkeyChartData = formatMonkeyChartData();
  const jigsawChartData = formatJigsawChartData();

  // Determine which charts to show
  const showSeguinChart = selectedGame === "all" || selectedGame === "seguin";
  const showMonkeyChart = selectedGame === "all" || selectedGame === "monkey";
  const showJigsawChart = selectedGame === "all" || selectedGame === "jigsaw";

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
  if (!progressData?.totalSessions && !hasRealData) {
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
              <option value="jigsaw">Jigsaw</option>
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
            <option value="seguin">Seguin Form Board</option>
            <option value="monkey">Monkey Time</option>
            <option value="jigsaw">Jigsaw</option>
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

      {/* Game Usage Overview */}
      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Game Usage</h3>
        {!hasRealData && (
          <p className="text-xs text-gray-500 mb-2 italic">
            Showing sample data. Play games to see your real statistics.
          </p>
        )}
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
                fill="#8884d8"
                dataKey="percentage"
              >
                {gameDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seguin Form Board Performance */}
      {showSeguinChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">Seguin Form Board Performance</h3>
          <p className="text-gray-500 mb-4">
            This chart shows your completion time (lower is better) over time compared to standard performance.
          </p>
          {!hasRealData && (
            <p className="text-xs text-gray-500 mb-2 italic">
              Showing sample data. Play games to see your real statistics.
            </p>
          )}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={seguinChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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

      {/* Monkey Type Performance */}
      {showMonkeyChart && (
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
                  fill="#82ca9d"
                  stroke="#28a745"
                  name="Accuracy %"
                  fillOpacity={0.3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Jigsaw Performance */}
      {showJigsawChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">Jigsaw Performance</h3>
          <p className="text-gray-500 mb-4">
            This chart shows your jigsaw completion time (lower is better) compared to standard performance.
          </p>
          {!hasRealData && (
            <p className="text-xs text-gray-500 mb-2 italic">
              Showing sample data. Play games to see your real statistics.
            </p>
          )}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={jigsawChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  label={{ value: "Time (seconds)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Pieces", angle: 90, position: "insideRight" }}
                  domain={[0, "dataMax + 5"]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="time"
                  stroke="#FF8042"
                  name="Your Time"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="standardTime"
                  stroke="#0088FE"
                  name="Standard Time"
                  strokeDasharray="5 5"
                />
                <Bar
                  yAxisId="right"
                  dataKey="pieces"
                  fill="#82ca9d"
                  name="Puzzle Pieces"
                  barSize={20}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cognitive Skills Analysis */}
      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Cognitive Skills Analysis</h3>
        <p className="text-gray-500 mb-4">
          Based on your game performance, we've analyzed your cognitive abilities across different areas.
        </p>
        {!hasRealData && (
          <p className="text-xs text-gray-500 mb-2 italic">
            Showing sample data. Play games to see your real statistics.
          </p>
        )}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData?.cognitiveSkills || sampleSkills}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Skill Level" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      {/* Performance Summary */}
      <div className="bg-white p-6 rounded-lg mt-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Performance Summary</h3>
        {!hasRealData && (
          <p className="text-xs text-gray-500 mb-2 italic">
            Showing sample data. Play games to see your real statistics.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">Improvement</h4>
            <p className="text-3xl font-bold text-[#66220B]">
              {progressData?.improvementMetrics?.seguin || 45}%
            </p>
            <p className="text-sm text-gray-500">Since first assessment</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">Sessions</h4>
            <p className="text-3xl font-bold text-[#66220B]">{progressData?.totalSessions || 28}</p>
            <p className="text-sm text-gray-500">Total completed</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
            <h4 className="text-[#F09000] text-lg font-semibold mb-2">Percentile</h4>
            <p className="text-3xl font-bold text-[#66220B]">75th</p>
            <p className="text-sm text-gray-500">Among your age group</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSettings;