// frontend/src/components/settings/ProgressSettings.jsx
// Comprehensive progress dashboard with per-game charts and cognitive skill radar
import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { progressService } from '../../utils/apiService';

// ─── Constants ────────────────────────────────────────────────────────
const COLORS = {
  seguin:  '#F09000',
  monkey:  '#4ECDC4',
  jigsaw:  '#66220B',
  balloon: '#FF6B6B',
};

const GAME_LABELS = {
  seguin:  '🔷 Shape Matcher',
  monkey:  '⌨️ Speed Typer',
  jigsaw:  '🧩 Puzzle Master',
  balloon: '🎈 Balloon Pop',
};

const CHART_PIE_COLORS = ['#F09000', '#4ECDC4', '#66220B', '#FF6B6B', '#8884d8'];

// ─── Custom Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '2px solid #F09000', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <p style={{ fontWeight: 700, color: '#66220B', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          {p.unit || ''}
        </p>
      ))}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = '#F09000', emoji }) => (
  <div style={{
    background: 'white', borderRadius: 14, padding: '1rem 1.25rem',
    boxShadow: '0 2px 8px rgba(102,34,11,0.1)', borderLeft: `5px solid ${color}`,
    minWidth: 130,
  }}>
    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: '1rem' }}>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#66220B', margin: 0 }}>{title}</h3>
    {sub && <p style={{ fontSize: '0.82rem', color: '#888', margin: '2px 0 0' }}>{sub}</p>}
  </div>
);

// ─── No data placeholder ──────────────────────────────────────────────
const NoDataPlaceholder = ({ game }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: '#bbb', background: '#fafafa', borderRadius: 12 }}>
    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📊</div>
    <p style={{ margin: 0 }}>Play {GAME_LABELS[game] || 'more games'} to see your progress here!</p>
  </div>
);

// ─── Improvement badge ────────────────────────────────────────────────
const ImprovementBadge = ({ value, invertPositive = false }) => {
  if (value === null || value === undefined) return null;
  // invertPositive: for time-based games, lower is better (negative delta = improvement)
  const improved = invertPositive ? value > 0 : value < 0;
  const display  = Math.abs(value);
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '0.78rem', fontWeight: 700,
      background: improved ? '#d4f7e0' : '#fee2e2',
      color: improved ? '#166534' : '#991b1b',
    }}>
      {improved ? '↑ Improving' : '↓ Needs work'} {display}%
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
const ProgressSettings = ({ userData }) => {
  const [progressData, setProgressData] = useState(null);
  const [gameStats,    setGameStats]    = useState({});
  const [selectedGame, setSelectedGame] = useState('all');
  const [timeFrame,    setTimeFrame]    = useState('month');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const progress = await progressService.getProgressData(selectedGame, timeFrame);
        setProgressData(progress);

        // Fetch per-game stats for games that have data
        const gameTypes = ['seguin', 'monkey', 'jigsaw', 'balloon'];
        const statsResults = await Promise.allSettled(
          gameTypes.map((g) => progressService.getGameStatistics(g))
        );
        const stats = {};
        gameTypes.forEach((g, i) => {
          if (statsResults[i].status === 'fulfilled') stats[g] = statsResults[i].value;
        });
        setGameStats(stats);
      } catch (err) {
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selectedGame, timeFrame]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
        <div style={{ width: 48, height: 48, border: '4px solid #F09000', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#c33' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ background: '#F09000', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!progressData || progressData.totalSessions === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎮</div>
        <h3 style={{ color: '#66220B', fontWeight: 700 }}>No progress data yet!</h3>
        <p style={{ color: '#888' }}>Play some games to start tracking your progress.</p>
        <Link to="/games" style={{ display: 'inline-block', background: '#F09000', color: 'white', padding: '0.6rem 2rem', borderRadius: 30, textDecoration: 'none', fontWeight: 600, marginTop: 16 }}>
          Go to Games
        </Link>
      </div>
    );
  }

  const { gameDistribution, cognitiveSkills, averageCompletionTimes, averageWpm, averageScore, averageAccuracy, improvementMetrics, recentSessions = [], timeSeriesData = [], benchmarks } = progressData;
  const hasSeguin  = (gameDistribution?.seguin  || 0) > 0;
  const hasMonkey  = (gameDistribution?.monkey  || 0) > 0;
  const hasJigsaw  = (gameDistribution?.jigsaw  || 0) > 0;
  const hasBalloon = (gameDistribution?.balloon || 0) > 0;

  // ── Chart data prep ─────────────────────────────────────────────
  const seguinChartData = timeSeriesData
    .filter((e) => e.seguin !== null)
    .map((e) => ({ date: e.date?.slice(5), time: e.seguin, benchmark: benchmarks?.seguin?.standardTime || 80 }));

  const monkeyChartData = timeSeriesData
    .filter((e) => e.monkey !== null)
    .map((e) => ({ date: e.date?.slice(5), wpm: e.monkey, accuracy: e.monkeyAccuracy, targetWpm: benchmarks?.monkey?.targetWpm || 40 }));

  const jigsawChartData = timeSeriesData
    .filter((e) => e.jigsaw !== null)
    .map((e) => ({ date: e.date?.slice(5), time: e.jigsaw, benchmark: benchmarks?.jigsaw?.standardTime || 300 }));

  const balloonChartData = timeSeriesData
    .filter((e) => e.balloon !== null)
    .map((e) => ({ date: e.date?.slice(5), score: e.balloon, accuracy: e.balloonAccuracy }));

  const distributionData = Object.entries(gameDistribution || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: GAME_LABELS[key] || key, value }));

  const radarData = (cognitiveSkills || []).map((s) => ({ skill: s.name, score: s.value }));

  const chartSectionStyle = {
    background: 'white', borderRadius: 16, padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(102,34,11,0.08)', marginBottom: '1.5rem',
  };

  return (
    <div style={{ fontFamily: "'Quicksand', sans-serif" }}>
      {/* ── Header + Filters ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#66220B', margin: 0 }}>📊 Progress Tracking</h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>
            Total sessions: <strong style={{ color: '#F09000' }}>{progressData.totalSessions}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} style={selectStyle}>
            <option value="all">All Games</option>
            {hasSeguin  && <option value="seguin">Shape Matcher</option>}
            {hasMonkey  && <option value="monkey">Speed Typer</option>}
            {hasJigsaw  && <option value="jigsaw">Puzzle Master</option>}
            {hasBalloon && <option value="balloon">Balloon Pop</option>}
          </select>
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)} style={selectStyle}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* ── Summary Stat Cards ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {hasSeguin && (
          <StatCard emoji="🔷" label="Avg Shape Time" value={averageCompletionTimes?.seguin ? `${averageCompletionTimes.seguin}s` : '—'} color={COLORS.seguin}
            sub={<ImprovementBadge value={improvementMetrics?.seguin} invertPositive />} />
        )}
        {hasMonkey && (
          <StatCard emoji="⌨️" label="Avg WPM" value={averageWpm?.monkey ?? '—'} color={COLORS.monkey}
            sub={<ImprovementBadge value={improvementMetrics?.monkey} />} />
        )}
        {hasJigsaw && (
          <StatCard emoji="🧩" label="Avg Puzzle Time" value={averageCompletionTimes?.jigsaw ? `${averageCompletionTimes.jigsaw}s` : '—'} color={COLORS.jigsaw}
            sub={<ImprovementBadge value={improvementMetrics?.jigsaw} invertPositive />} />
        )}
        {hasBalloon && (
          <StatCard emoji="🎈" label="Avg Score" value={averageScore?.balloon ?? '—'} color={COLORS.balloon}
            sub={<ImprovementBadge value={improvementMetrics?.balloon} />} />
        )}
      </div>

      {/* ── Game Distribution Pie ────────────────────────────────── */}
      {distributionData.length > 1 && (
        <div style={chartSectionStyle}>
          <SectionHeader title="🎮 Game Activity Distribution" sub="How often you play each game" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, value }) => `${value}%`}>
                {distributionData.map((_, i) => <Cell key={i} fill={CHART_PIE_COLORS[i % CHART_PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Seguin Charts ────────────────────────────────────────── */}
      {(selectedGame === 'all' || selectedGame === 'seguin') && hasSeguin && (
        <div style={chartSectionStyle}>
          <SectionHeader
            title="🔷 Shape Matcher – Completion Times"
            sub="Lower is better! Orange line = your time, dashed = benchmark (80s)"
          />
          {seguinChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={seguinChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="time" stroke={COLORS.seguin} strokeWidth={2.5} name="Your Time (s)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="benchmark" stroke="#ccc" strokeDasharray="5 5" name="Benchmark (80s)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder game="seguin" />}

          {/* Per-game stats bar */}
          {gameStats.seguin?.totalSessions > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <StatCard emoji="🏆" label="Best Time" value={`${gameStats.seguin.bestTime}s`} color={COLORS.seguin} />
              <StatCard emoji="📊" label="Sessions" value={gameStats.seguin.totalSessions} color={COLORS.seguin} />
              <StatCard emoji="🎯" label="Avg Accuracy" value={gameStats.seguin.avgAccuracy ? `${gameStats.seguin.avgAccuracy}%` : '—'} color={COLORS.seguin} />
            </div>
          )}
        </div>
      )}

      {/* ── Monkey Type Charts ───────────────────────────────────── */}
      {(selectedGame === 'all' || selectedGame === 'monkey') && hasMonkey && (
        <div style={chartSectionStyle}>
          <SectionHeader
            title="⌨️ Speed Typer – WPM & Accuracy"
            sub="Higher WPM and higher accuracy = better! Target: 40 WPM"
          />
          {monkeyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monkeyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="wpm" label={{ value: 'WPM', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <YAxis yAxisId="acc" orientation="right" domain={[0, 100]} label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="wpm" type="monotone" dataKey="wpm" stroke={COLORS.monkey} strokeWidth={2.5} name="WPM" dot={{ r: 4 }} />
                <Line yAxisId="wpm" type="monotone" dataKey="targetWpm" stroke="#ccc" strokeDasharray="5 5" name="Target (40 WPM)" dot={false} />
                <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} name="Accuracy %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder game="monkey" />}

          {gameStats.monkey?.totalSessions > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <StatCard emoji="⚡" label="Best WPM" value={gameStats.monkey.bestWpm ?? '—'} color={COLORS.monkey} />
              <StatCard emoji="🎯" label="Avg Accuracy" value={gameStats.monkey.avgAccuracy ? `${gameStats.monkey.avgAccuracy}%` : '—'} color={COLORS.monkey} />
              <StatCard emoji="📊" label="Sessions" value={gameStats.monkey.totalSessions} color={COLORS.monkey} />
            </div>
          )}
        </div>
      )}

      {/* ── Jigsaw Charts ────────────────────────────────────────── */}
      {(selectedGame === 'all' || selectedGame === 'jigsaw') && hasJigsaw && (
        <div style={chartSectionStyle}>
          <SectionHeader
            title="🧩 Puzzle Master – Completion Times"
            sub="Lower is better! Track how fast you complete puzzles over time"
          />
          {jigsawChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={jigsawChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="time" fill={COLORS.jigsaw} name="Completion Time (s)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="benchmark" stroke="#ccc" strokeDasharray="5 5" name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder game="jigsaw" />}

          {gameStats.jigsaw?.totalSessions > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <StatCard emoji="🏆" label="Best Time" value={`${gameStats.jigsaw.bestTime}s`} color={COLORS.jigsaw} />
              <StatCard emoji="📊" label="Sessions" value={gameStats.jigsaw.totalSessions} color={COLORS.jigsaw} />
              <StatCard emoji="⏱️" label="Avg Time" value={`${gameStats.jigsaw.averageTime}s`} color={COLORS.jigsaw} />
            </div>
          )}
        </div>
      )}

      {/* ── Balloon Pop Charts ───────────────────────────────────── */}
      {(selectedGame === 'all' || selectedGame === 'balloon') && hasBalloon && (
        <div style={chartSectionStyle}>
          <SectionHeader
            title="🎈 Balloon Pop – Score & Accuracy"
            sub="Higher score and accuracy = better hand-eye coordination!"
          />
          {balloonChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={balloonChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="score" label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <YAxis yAxisId="acc" orientation="right" domain={[0, 100]} label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="score" type="monotone" dataKey="score" stroke={COLORS.balloon} strokeWidth={2.5} name="Score" dot={{ r: 4 }} />
                <Line yAxisId="acc"   type="monotone" dataKey="accuracy" stroke="#F09000" strokeWidth={2} name="Accuracy %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <NoDataPlaceholder game="balloon" />}

          {gameStats.balloon?.totalSessions > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <StatCard emoji="🏆" label="Best Score" value={gameStats.balloon.bestScore ?? '—'} color={COLORS.balloon} />
              <StatCard emoji="🔥" label="Best Combo" value={gameStats.balloon.bestCombo ? `x${gameStats.balloon.bestCombo}` : '—'} color={COLORS.balloon} />
              <StatCard emoji="🎯" label="Avg Accuracy" value={gameStats.balloon.avgAccuracy ? `${gameStats.balloon.avgAccuracy}%` : '—'} color={COLORS.balloon} />
              <StatCard emoji="📊" label="Sessions" value={gameStats.balloon.totalSessions} color={COLORS.balloon} />
            </div>
          )}
        </div>
      )}

      {/* ── Cognitive Skills Radar ───────────────────────────────── */}
      {radarData.length >= 3 && (
        <div style={chartSectionStyle}>
          <SectionHeader
            title="🧠 Cognitive Skills Profile"
            sub="Derived from your actual game performance across all games"
          />
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: '#66220B' }} />
              <Radar name="You" dataKey="score" stroke="#F09000" fill="#F09000" fillOpacity={0.35} />
              <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent Sessions Table ─────────────────────────────────── */}
      {recentSessions.length > 0 && (
        <div style={chartSectionStyle}>
          <SectionHeader title="📋 Recent Sessions" sub="Your last 20 game sessions" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fff8f0' }}>
                  {['Game', 'Date', 'Time', 'Score/WPM', 'Accuracy'].map((h) => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#66220B', fontWeight: 700, borderBottom: '2px solid #F09000' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5e6d0', background: i % 2 === 0 ? 'white' : '#fffaf5' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{GAME_LABELS[s.gameType] || s.gameType}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#888' }}>{new Date(s.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{s.completionTime}s</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: COLORS[s.gameType] || '#333' }}>
                      {s.gameType === 'monkey'  ? `${s.wpm ?? '—'} WPM` :
                       s.gameType === 'balloon' ? (s.finalScore ?? '—') :
                       `${s.completionTime}s`}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {s.gameType === 'balloon'
                        ? `${s.sessionAccuracy ?? s.accuracy ?? '—'}%`
                        : `${s.accuracy ?? '—'}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Shared select style ──────────────────────────────────────────────
const selectStyle = {
  padding: '0.5rem 0.75rem',
  border: '2px solid #F09000',
  borderRadius: 10,
  fontFamily: "'Quicksand', sans-serif",
  fontSize: '0.875rem',
  color: '#66220B',
  background: 'white',
  cursor: 'pointer',
};

export default ProgressSettings;
