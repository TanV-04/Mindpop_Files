// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../utils/apiService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childSessions, setChildSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastActive'); // lastActive, name, age, sessions
  const [filterGame, setFilterGame] = useState('all'); // all, seguin, monkey, jigsaw, balloon

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllChildren();
      
      setPlatformStats(data.platformStats || {});
      setChildren(Array.isArray(data.children) ? data.children : []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setPlatformStats({});
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChildClick = async (child) => {
    try {
      setSelectedChild(child);
      // Fetch all sessions for this child
      const sessionsData = await adminService.getChildProgress(child.id, { limit: 100 });
      setChildSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('Error fetching child sessions:', error);
    }
  };

  const closeModal = () => {
    setSelectedChild(null);
    setChildSessions([]);
  };

  // Filter and sort children (defensive checks)
  const filteredChildren = children
    .filter(child => 
      (child.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (child.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'age':
          return (a.age || 0) - (b.age || 0);
        case 'sessions':
          return (b.totalSessions || 0) - (a.totalSessions || 0);
        case 'lastActive':
        default:
          return new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
      }
    });

  // Filter sessions by game (defensive)
  const filteredSessions = (childSessions || []).filter(session => 
    filterGame === 'all' || session?.gameType === filterGame
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameIcon = (gameType) => {
    const icons = {
      seguin: '🔷',
      monkey: '⌨️',
      jigsaw: '🧩',
      balloon: '🎈'
    };
    return icons[gameType] || '🎮';
  };

  const getGameName = (gameType) => {
    const names = {
      seguin: 'Shape Matcher',
      monkey: 'Speed Typer',
      jigsaw: 'Puzzle Master',
      balloon: 'Balloon Pop'
    };
    return names[gameType] || gameType;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F0D0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F09000] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#66220B] font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#F9F0D0' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#66220B] mb-2">Admin Dashboard</h1>
          <p className="text-[#66220B] opacity-75">Platform Overview & Child Management</p>
        </motion.div>

        {/* Platform Stats */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Children"
              value={platformStats.totalChildren || 0}
              icon="👥"
              color="#00C853"
            />
            <StatCard
              title="Total Sessions"
              value={platformStats.totalSessions || 0}
              icon="🎮"
              color="#F09000"
            />
            <StatCard
              title="Avg Sessions/Child"
              value={
                platformStats.totalChildren > 0
                  ? ((platformStats.totalSessions || 0) / platformStats.totalChildren).toFixed(1)
                  : '0.0'
              }
              icon="📊"
              color="#3B82F6"
            />
            <StatCard
              title="Most Popular Game"
              value={platformStats.mostPlayedGame || 'N/A'}
              icon="⭐"
              color="#9C27B0"
            />
          </div>
        )}

        {/* Search and Sort */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md border-2 border-[#F09000]">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-[#FFE5B4] rounded-lg focus:border-[#F09000] focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-[#FFE5B4] rounded-lg focus:border-[#F09000] focus:outline-none"
            >
              <option value="lastActive">Sort by: Last Active</option>
              <option value="name">Sort by: Name</option>
              <option value="age">Sort by: Age</option>
              <option value="sessions">Sort by: Sessions</option>
            </select>
          </div>
        </div>

        {/* Children Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-[#F09000]">
          {filteredChildren.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-2xl text-gray-400 mb-2">📊</p>
              <p className="text-lg font-semibold text-[#66220B] mb-2">No Children Found</p>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'No registered children yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
            <thead className="bg-gradient-to-r from-[#F09000] to-[#FF9F1C]">
              <tr>
                <th className="px-6 py-4 text-left text-white font-bold">Child</th>
                <th className="px-6 py-4 text-left text-white font-bold">Age</th>
                <th className="px-6 py-4 text-left text-white font-bold">Total Sessions</th>
                <th className="px-6 py-4 text-left text-white font-bold">Games Played</th>
                <th className="px-6 py-4 text-left text-white font-bold">Last Active</th>
                <th className="px-6 py-4 text-left text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child, idx) => (
                <motion.tr
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-[#FFE5B4] hover:bg-[#FFF5E6] cursor-pointer"
                  onClick={() => handleChildClick(child)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F09000] to-[#FF9F1C] flex items-center justify-center text-white font-bold">
                        {(child.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#66220B]">{child.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{child.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#66220B]">{child.age || 'N/A'} years</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#F09000] text-white rounded-full font-semibold">
                      {child.totalSessions || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(child.gamesPlayed || []).map(game => (
                        <span key={game} className="text-xl" title={getGameName(game)}>
                          {getGameIcon(game)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(child.lastActive || new Date())}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChildClick(child);
                      }}
                      className="px-4 py-2 bg-[#66220B] text-white rounded-lg hover:bg-[#4A1509] transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Child Details Modal */}
        {selectedChild && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#F09000] to-[#FF9F1C] p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedChild.name || 'Unknown'}</h2>
                    <p className="text-white opacity-90">{selectedChild.email || 'No email'}</p>
                    <p className="text-white opacity-75 text-sm">Age: {selectedChild.age || 'N/A'} years</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter Sessions by Game */}
              <div className="p-6 border-b">
                <label className="block text-sm font-semibold text-[#66220B] mb-2">Filter Sessions by Game:</label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'seguin', 'monkey', 'jigsaw', 'balloon'].map(game => (
                    <button
                      key={game}
                      onClick={() => setFilterGame(game)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        filterGame === game
                          ? 'bg-[#F09000] text-white'
                          : 'bg-gray-100 text-[#66220B] hover:bg-gray-200'
                      }`}
                    >
                      {game === 'all' ? '📋 All Games' : `${getGameIcon(game)} ${getGameName(game)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sessions Timeline */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#66220B] mb-4">
                  Session History ({filteredSessions.length} sessions)
                </h3>
                
                {filteredSessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No sessions found for this filter</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSessions.map((session, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-r from-[#FFF5E6] to-white p-4 rounded-lg border-2 border-[#FFE5B4] hover:border-[#F09000] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getGameIcon(session.gameType)}</span>
                            <div>
                              <p className="font-bold text-[#66220B]">{getGameName(session.gameType)}</p>
                              <p className="text-sm text-gray-600">{formatDate(session.date || new Date())}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {session.completionTime != null && (
                              <p className="text-sm text-[#66220B]">
                                ⏱️ {session.completionTime}s
                              </p>
                            )}
                            {session.accuracy != null && (
                              <p className="text-sm text-[#00C853]">
                                ✓ {session.accuracy}% accuracy
                              </p>
                            )}
                            {session.wpm != null && (
                              <p className="text-sm text-[#F09000]">
                                ⌨️ {session.wpm} WPM
                              </p>
                            )}
                            {session.finalScore != null && (
                              <p className="text-sm text-[#3B82F6]">
                                🎯 {session.finalScore} points
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="bg-white rounded-xl p-6 shadow-md border-2 border-[#FFE5B4] hover:border-[#F09000] transition-all"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-3xl">{icon}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
    </div>
    <p className="text-sm font-semibold text-[#66220B]">{title}</p>
  </motion.div>
);

export default AdminDashboard;