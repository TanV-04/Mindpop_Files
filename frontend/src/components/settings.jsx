// frontend/src/components/settings.jsx
// Removed: Analysis tab (dyslexia & autism modules removed from scope)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileSettings from './settings/ProfileSettings';
import ProgressSettings from './settings/ProgressSettings';
import SecuritySettings from './settings/SecuritySettings';
import HelpSupport from './settings/HelpSupport';
import { userService } from '../utils/apiService';
import '../styles/Settings.css';

const TABS = [
  { tab: 'profile', icon: 'fa-user', label: 'Profile' },
  { tab: 'progress', icon: 'fa-chart-line', label: 'Progress' },
  { tab: 'security', icon: 'fa-shield-alt', label: 'Security & Privacy' },
  { tab: 'help', icon: 'fa-question-circle', label: 'Help & Support' },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to access settings');
          navigate('/sign-in');
          return;
        }
        const response = await userService.getCurrentUser();
        const data = response.data || response;
        if (!data) throw new Error('No user data received');
        setUserData(data);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/sign-in');
        } else {
          toast.error('Failed to fetch user data. Please try again.');
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="settings-container flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Settings</h2>
          <p className="text-gray-600 mb-6">Please try logging out and back in.</p>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/sign-in'); }}
            className="bg-[#F09000] text-white py-2 px-4 rounded-full hover:bg-[#D87D00]">
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container pt-28 px-4 md:px-8" style={{ backgroundColor: 'rgb(249, 240, 208)' }}>
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="settings-sidebar w-full md:w-64 bg-[#F5F5F5] p-4">
            <h2 className="text-xl font-bold text-[#66220B] mb-6">Settings</h2>
            <nav className="settings-nav">
              {TABS.map(({ tab, icon, label }) => (
                <button
                  key={tab}
                  className={`settings-nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <i className={`fa ${icon} mr-2`} /> {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="settings-content flex-1 p-6">
            {activeTab === 'profile' && <ProfileSettings userData={userData} setUserData={setUserData} />}
            {activeTab === 'progress' && <ProgressSettings userData={userData} />}
            {activeTab === 'security' && <SecuritySettings userData={userData} />}
            {activeTab === 'help' && <HelpSupport />}
          </div>
        </div>
      </div>
    </div>

  );
};

export default Settings;
