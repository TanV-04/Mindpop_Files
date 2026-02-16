// frontend/src/pages/admin/AdminDashboard.jsx
// Admin-only view: performance metrics for all registered children
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const GAME_LABELS = {
  seguin:  '🔷 Shape Matcher',
  monkey:  '⌨️ Speed Typer',
  jigsaw:  '🧩 Puzzle Master',
  balloon: '🎈 Balloon Pop',
};

const GAME_COLORS = {
  seguin:  '#F09000',
  monkey:  '#4ECDC4',
  jigsaw:  '#66220B',
  balloon: '#FF6B6B',
};

const PIE_COLORS = ['#F09000', '#4ECDC4', '#66220B', '#FF6B6B'];

// ─── Helper: metric display ───────────────────────────────────────────
const formatMetric = (gameType, stats) => {
  if (!stats) return '—';
  if (gameType === 'monkey')  return stats.avgWpm    ? `${stats.avgWpm} WPM`  : '—';
  if (gameType === 'balloon') return stats.avgScore  ? `${stats.avgScore} pts` : '—';
  return stats.avgTime ? `${stats.avgTime}s` : '—';
};

// ─── Child Row in expandable table ───────────────────────────────────
const ChildRow = ({ child, onSelect }) => {
  const { child: info, totalSessions, recentActivity, lastActive, gameBreakdown } = child;
  const gamesPlayed = Object.keys(gameBreakdown).length;

  return (
    <tr
      style={{ borderBottom: '1px solid #f5e6d0', cursor: 'pointer', transition: 'background 0.2s' }}
      onClick={() => onSelect(child)}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#fff8f0')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F09000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            {(info.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#66220B' }}>{info.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>@{info.username}</div>
          </div>
        </div>
      </td>
      <td style={tdStyle}>{info.age ?? '—'}</td>
      <td style={tdStyle}><span style={badgeStyle}>{totalSessions}</span></td>
      <td style={tdStyle}><span style={{ ...badgeStyle, background: recentActivity > 0 ? '#d4f7e0' : '#f5f5f5', color: recentActivity > 0 ? '#166534' : '#888' }}>{recentActivity} this week</span></td>
      <td style={tdStyle}>{gamesPlayed} / 4</td>
      <td style={tdStyle}>{lastActive ? new Date(lastActive).toLocaleDateString() : 'Never'}</td>
      <td style={tdStyle}><span style={{ color: '#F09000', fontWeight: 600 }}>View →</span></td>
    </tr>
  );
};

// ─── Child Detail Modal ───────────────────────────────────────────────
const ChildDetailModal = ({ child, onClose }) => {
  const { child: info, totalSessions, gameBreakdown } = child;

  const gameKeys = Object.keys(gameBreakdown);

  const barData = gameKeys.map((g) => ({
    game: GAME_LABELS[g] || g,
    sessions: gameBreakdown[g].totalSessions,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 680, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#66220B', fontWeight: 800, margin: 0 }}>{info.name}</h2>
            <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.9rem' }}>Age {info.age} · @{info.username} · {totalSessions} total sessions</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '2px solid #F09000', borderRadius: 50, width: 36, height: 36, cursor: 'pointer', color: '#F09000', fontWeight: 700, fontSize: '1rem' }}>✕</button>
        </div>

        {/* Per-game metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {gameKeys.map((g) => {
            const s = gameBreakdown[g];
            const color = GAME_COLORS[g] || '#888';
            return (
              <div key={g} style={{ background: '#fff8f0', borderRadius: 12, padding: '1rem', borderLeft: `4px solid ${color}` }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{GAME_LABELS[g]?.split(' ')[0]}</div>
                <div style={{ fontWeight: 700, color, fontSize: '1.3rem' }}>{formatMetric(g, s)}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>{s.totalSessions} sessions</div>
                {s.bestTime && <div style={{ fontSize: '0.72rem', color: '#aaa' }}>Best: {s.bestTime}s</div>}
                {s.bestScore && <div style={{ fontSize: '0.72rem', color: '#aaa' }}>Best: {s.bestScore} pts</div>}
              </div>
            );
          })}
        </div>

        {/* Sessions bar chart */}
        {barData.length > 0 && (
          <div>
            <h4 style={{ color: '#66220B', fontWeight: 700, marginBottom: 12 }}>Sessions per Game</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#F09000" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/progress/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/games', { replace: true });
        } else {
          setError('Failed to load admin data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/sign-in');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F0D0' }}>
        <div style={{ width: 52, height: 52, border: '5px solid #F09000', borderTop: '5px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F0D0' }}>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 32px rgba(102,34,11,0.15)' }}>
          <p style={{ color: '#c33', fontWeight: 600 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, background: '#F09000', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { platformStats, children = [] } = data;
  const filteredChildren = children.filter((c) =>
    c.child.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.child.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Platform-level pie chart
  const pieData = Object.entries(platformStats?.gameBreakdown || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: GAME_LABELS[key] || key, value }));

  return (
    <div style={{ minHeight: '100vh', background: '#F9F0D0', paddingTop: 80, paddingBottom: '3rem', paddingInline: '1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Admin Header ──────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#66220B', margin: 0 }}>
              👩‍💼 Admin Dashboard
            </h1>
            <p style={{ color: '#888', marginTop: 6 }}>MindPop Children Performance Overview</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#66220B', color: 'white', padding: '0.6rem 1.5rem', border: 'none', borderRadius: 30, cursor: 'pointer', fontFamily: "'Quicksand', sans-serif", fontWeight: 600 }}>
            Log Out
          </button>
        </div>

        {/* ── Platform Stats ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { emoji: '👧', label: 'Total Children', value: platformStats?.totalChildren ?? 0 },
            { emoji: '🎮', label: 'Total Sessions', value: platformStats?.totalSessions ?? 0 },
            ...Object.entries(platformStats?.gameBreakdown || {}).map(([g, v]) => ({
              emoji: GAME_LABELS[g]?.split(' ')[0] ?? '🎯',
              label: `${GAME_LABELS[g]?.slice(2) ?? g} Sessions`,
              value: v,
            })),
          ].map(({ emoji, label, value }, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '1.25rem', boxShadow: '0 2px 8px rgba(102,34,11,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem' }}>{emoji}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F09000', lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Platform Game Distribution ────────────────────────── */}
        {pieData.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(102,34,11,0.08)' }}>
            <h3 style={{ color: '#66220B', fontWeight: 700, marginBottom: '1rem' }}>🎮 Platform-Wide Game Usage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Children Table ────────────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(102,34,11,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ color: '#66220B', fontWeight: 700, margin: 0 }}>👧 Children ({filteredChildren.length})</h3>
            <input
              type="text"
              placeholder="Search by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem', border: '2px solid #F09000', borderRadius: 30, outline: 'none', fontFamily: "'Quicksand', sans-serif", fontSize: '0.875rem', width: 260 }}
            />
          </div>

          {filteredChildren.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👧</div>
              <p>{search ? 'No children match your search.' : 'No children have registered yet.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#fff8f0' }}>
                    {['Child', 'Age', 'Sessions', 'Activity', 'Games Played', 'Last Active', ''].map((h) => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', color: '#66220B', fontWeight: 700, borderBottom: '2px solid #F09000', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child, i) => (
                    <ChildRow key={i} child={child} onSelect={setSelected} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Child Detail Modal ─────────────────────────────────── */}
      {selected && (
        <ChildDetailModal child={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

const tdStyle = { padding: '0.7rem 0.75rem', verticalAlign: 'middle' };
const badgeStyle = { background: '#fff8f0', color: '#F09000', padding: '3px 10px', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem' };

export default AdminDashboard;
