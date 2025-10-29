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

        console.log("Progress Data Received:", progress);
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

  // Format Seguin data (real only)
  const formatSeguinChartData = () => {
    if (!progressData?.timeSeriesData?.length) return [];
    return progressData.timeSeriesData
      .filter(entry => entry.seguin !== null && entry.seguin !== undefined)
      .map(entry => ({
        date: entry.date || "Unknown",
        time: entry.seguin,
        standardTime: progressData.benchmarks?.seguin?.standardTime || 80,
      }));
  };

  // Format Monkey Type data (real only)
  const formatMonkeyChartData = () => {
    if (!progressData?.timeSeriesData?.length) return [];
    return progressData.timeSeriesData
      .filter(entry => entry.monkey !== null && entry.monkey !== undefined)
      .map(entry => ({
        date: entry.date || "Unknown",
        wpm: entry.monkey || 0,
        accuracy: entry.monkeyAccuracy || 80,
        targetWpm: progressData.benchmarks?.monkey?.targetWpm || 40,
      }));
  };

  // Format Jigsaw data (real only)
  const formatJigsawChartData = () => {
    if (!progressData?.timeSeriesData?.length) return [];
    return progressData.timeSeriesData.map(entry => ({
      date: entry.date || "Unknown",
      time: entry.jigsaw || entry.jigsawTime || 0,
      pieces: entry.jigsawPieces || 16,
      standardTime: progressData.benchmarks?.jigsaw?.standardTime || 180,
    }));
  };

  const hasSeguinData =
    progressData?.gameDistribution?.seguin > 0 ||
    formatSeguinChartData().length > 0;
  const hasMonkeyData =
    progressData?.gameDistribution?.monkey > 0 ||
    formatMonkeyChartData().length > 0;
  const hasJigsawData =
    progressData?.gameDistribution?.jigsaw > 0 ||
    formatJigsawChartData().length > 0;

  const hasAnyGameData = hasSeguinData || hasMonkeyData || hasJigsawData;
  const hasRealData = progressData?.totalSessions > 0;

  // Game distribution
  const getGameDistributionData = () => {
    if (!progressData?.gameDistribution) return [];
    const dist = [];
    if (progressData.gameDistribution.seguin > 0)
      dist.push({
        name: "Seguin Form Board",
        percentage: progressData.gameDistribution.seguin,
      });
    if (progressData.gameDistribution.monkey > 0)
      dist.push({
        name: "Monkey Time",
        percentage: progressData.gameDistribution.monkey,
      });
    if (progressData.gameDistribution.jigsaw > 0)
      dist.push({
        name: "Jigsaw Puzzle",
        percentage: progressData.gameDistribution.jigsaw,
      });
    return dist;
  };

  const seguinChartData = formatSeguinChartData();
  const monkeyChartData = formatMonkeyChartData();
  const jigsawChartData = formatJigsawChartData();
  const gameDistributionData = getGameDistributionData();

  const showSeguinChart =
    (selectedGame === "all" || selectedGame === "seguin") && hasSeguinData;
  const showMonkeyChart =
    (selectedGame === "all" || selectedGame === "monkey") && hasMonkeyData;
  const showJigsawChart =
    (selectedGame === "all" || selectedGame === "jigsaw") && hasJigsawData;
  const showGameUsageChart = gameDistributionData.length > 0;

  // LOADING
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]"></div>
      </div>
    );
  }

  // ERROR
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

  // NO DATA
  if (!hasRealData || !hasAnyGameData) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold text-[#66220B] mb-4">
          No Progress Data Yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven’t played any games yet or there’s no data for this period.
        </p>
        <a
          href="/games"
          className="bg-[#F09000] text-white py-2 px-6 rounded-full hover:bg-[#D87D00]"
        >
          Go to Games
        </a>
      </div>
    );
  }

  return (
    <div className="progress-settings">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#66220B]">Progress Tracking</h2>
        <div className="flex space-x-2">
          <select
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
          >
            <option value="all">All Games</option>
            {hasSeguinData && <option value="seguin">Seguin Form Board</option>}
            {hasMonkeyData && <option value="monkey">Monkey Time</option>}
            {hasJigsawData && <option value="jigsaw">Jigsaw Puzzle</option>}
          </select>
          <select
            value={timeFrame}
            onChange={e => setTimeFrame(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Game Usage */}
      {showGameUsageChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Game Usage
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={gameDistributionData}
                cx="50%"
                cy="50%"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                dataKey="percentage"
              >
                {gameDistributionData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Seguin Chart */}
      {showSeguinChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Seguin Form Board Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={seguinChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "Time (s)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="time" stroke="#FF8042" name="Your Time" />
              <Line type="monotone" dataKey="standardTime" stroke="#0088FE" name="Standard Time" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monkey Chart */}
      {showMonkeyChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Monkey Type Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monkeyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: "WPM", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Accuracy %", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" dataKey="wpm" stroke="#FF8042" name="Your Speed" strokeWidth={2} />
              <Line yAxisId="left" dataKey="targetWpm" stroke="#0088FE" name="Target Speed" strokeDasharray="5 5" />
              <Area yAxisId="right" dataKey="accuracy" stroke="#28a745" fillOpacity={0.3} name="Accuracy %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Jigsaw Chart */}
      {showJigsawChart && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Jigsaw Puzzle Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={jigsawChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: "Time (s)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Pieces", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" dataKey="time" stroke="#FF8042" name="Your Time" />
              <Line yAxisId="left" dataKey="standardTime" stroke="#0088FE" name="Standard Time" strokeDasharray="5 5" />
              <Bar yAxisId="right" dataKey="pieces" fill="#82ca9d" name="Pieces" barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cognitive Skills */}
      {progressData?.cognitiveSkills?.length > 0 && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#66220B] mb-4">
            Cognitive Skills Analysis
          </h3>
          <ResponsiveContainer width="100%" height={250}>
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
      )}

      {/* Behavior Analysis */}
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
              <AnalysisResults key={analysis._id || index} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSettings;