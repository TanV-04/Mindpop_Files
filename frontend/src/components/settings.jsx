import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProfileSettings from './settings/ProfileSettings';
import ProgressSettings from './settings/ProgressSettings';
import SecuritySettings from './settings/SecuritySettings';
import HelpSupport from './settings/HelpSupport';
import { userService } from '../utils/apiService';
import '../styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Please log in to access settings');
          navigate('/sign-in');
          return;
        }
        
        try {
          const response = await userService.getCurrentUser();
          
          // Comprehensive logging
          console.group('User Data Fetch');
          console.log('Raw Response:', response);
          console.log('User Data:', response.data || response);
          console.groupEnd();
          
          // Determine the correct data path
          const userData = response.data ? response.data : response;
          
          if (!userData) {
            throw new Error('No user data received');
          }
          
          setUserData(userData);
          setError(null);
        } catch (fetchError) {
          console.error('Detailed Fetch Error:', fetchError);
          
          // More specific error handling
          if (fetchError.response) {
            // The request was made and the server responded with a status code
            const status = fetchError.response.status;
            switch (status) {
              case 401:
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/sign-in');
                break;
              case 403:
                toast.error('You are not authorized to access this page.');
                break;
              default:
                toast.error('Failed to fetch user data. Please try again.');
            }
          } else if (fetchError.request) {
            // The request was made but no response was received
            toast.error('No response from server. Please check your connection.');
          } else {
            // Something happened in setting up the request
            toast.error('Error fetching user data. Please try again.');
          }
          
          setError(fetchError);
        }
      } catch (generalError) {
        console.error('General Error:', generalError);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  // Loading state
  if (loading) {
    return (
      <div className="settings-container flex justify-center items-center h-screen">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="settings-container flex justify-center items-center h-screen">
        <div className="error-container text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Failed to Load Settings
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t retrieve your profile information. 
            Please try logging out and logging back in.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/sign-in');
            }}
            className="bg-[#F09000] text-white py-2 px-4 rounded-full hover:bg-[#D87D00]"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="settings-container pt-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="settings-sidebar w-full md:w-64 bg-[#F5F5F5] p-4">
            <h2 className="text-xl font-bold text-[#66220B] mb-6">Settings</h2>
            
            <nav className="settings-nav">
              {[
                { tab: 'profile', icon: 'fa-user', label: 'Profile' },
                { tab: 'progress', icon: 'fa-chart-line', label: 'Progress' },
                { tab: 'security', icon: 'fa-shield-alt', label: 'Security & Privacy' },
                { tab: 'help', icon: 'fa-question-circle', label: 'Help & Support' }
              ].map(({ tab, icon, label }) => (
                <button
                  key={tab}
                  className={`settings-nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <i className={`fa ${icon} mr-2`}></i> {label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Main content */}
          <div className="settings-content flex-1 p-6">
            {activeTab === 'profile' && (
              <ProfileSettings 
                userData={userData} 
                setUserData={setUserData} 
              />
            )}
            {activeTab === 'progress' && (
              <ProgressSettings 
                userData={userData} 
              />
            )}
            {activeTab === 'security' && (
              <SecuritySettings 
                userData={userData} 
              />
            )}
            {activeTab === 'help' && <HelpSupport />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;