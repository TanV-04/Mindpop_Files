import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { userService, authService } from '../../utils/apiService';

const SecuritySettings = ({ userData }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareProgressWithTeachers: userData?.privacySettings?.shareProgressWithTeachers || false,
    allowActivityTracking: userData?.privacySettings?.allowActivityTracking || true,
    receiveEmails: userData?.privacySettings?.receiveEmails || true
  });
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const validatePasswordForm = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the userService instead of direct fetch
      await userService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Use the userService instead of direct fetch
      await userService.updatePrivacySettings(privacySettings);
      
      toast.success('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to log out from all devices?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the authService instead of direct fetch
      await authService.logoutAll();
      
      // Redirect to login page
      window.location.href = '/sign-in';
      
      toast.success('Logged out from all devices');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out from all devices');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="security-settings">
      <h2 className="text-2xl font-bold text-[#66220B] mb-6">Security & Privacy</h2>
      
      {/* Password Change Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-gray-700 mb-2">New Password</label>
            <input 
              type="password" 
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be at least 8 characters and include a mix of letters, numbers, and symbols.
            </p>
          </div>
          
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-[#F09000] text-white py-2 px-4 rounded-lg hover:bg-[#D87D00] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Privacy Settings Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Privacy Settings</h3>
        
        <form onSubmit={handlePrivacySubmit} className="space-y-4">
          <div className="form-group flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Share Progress with Teachers</h4>
              <p className="text-sm text-gray-500">Allow your teachers to view your game progress and performance</p>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                name="shareProgressWithTeachers"
                checked={privacySettings.shareProgressWithTeachers}
                onChange={handlePrivacyChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="form-group flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Activity Tracking</h4>
              <p className="text-sm text-gray-500">Allow us to collect usage data to improve your experience</p>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                name="allowActivityTracking"
                checked={privacySettings.allowActivityTracking}
                onChange={handlePrivacyChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="form-group flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive emails about your progress, tips, and platform updates</p>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                name="receiveEmails"
                checked={privacySettings.receiveEmails}
                onChange={handlePrivacyChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-[#F09000] text-white py-2 px-4 rounded-lg hover:bg-[#D87D00] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Account Security Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[#66220B] mb-4">Account Security</h3>
        
        <div className="space-y-4">
          <div className="form-group flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button 
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading} // Future implementation
            >
              Set Up
            </button>
          </div>
          
          <div className="form-group flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Active Sessions</h4>
              <p className="text-sm text-gray-500">Log out from all devices except this one</p>
            </div>
            <button 
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              onClick={handleLogoutAllDevices}
              disabled={loading}
            >
              Log Out All Devices
            </button>
          </div>
          
          <div className="form-group flex items-center justify-between py-2">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button 
              className="border border-red-500 text-red-500 py-2 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              disabled={loading} // Future implementation
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;