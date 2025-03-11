import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../utils/apiService';

const ProfileSettings = ({ userData, setUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    age: '',
    profilePicture: null
  });
  const [profileImage, setProfileImage] = useState('');
  
  // Add backend URL for image path resolution
  const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  console.log("Current userData:", userData);

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        age: userData.age || '',
        profilePicture: null
      });

      // Handle profile picture path properly
      if (userData.profilePicture) {
        const imageUrl = userData.profilePicture.startsWith('http') 
          ? userData.profilePicture 
          : `${backendBaseUrl}${userData.profilePicture}`;
        
        console.log('Setting profile image to:', imageUrl);
        setProfileImage(imageUrl);
      } else {
        setProfileImage('/api/placeholder/150/150');
      }
    }
  }, [userData, backendBaseUrl]);

  const handleImageError = () => {
    console.log("Image failed to load, using placeholder");
    setProfileImage('/api/placeholder/150/150');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file.name, file.type, file.size);
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB.');
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log("File read successfully");
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('username', formData.username);
      formPayload.append('email', formData.email);
      formPayload.append('age', formData.age);

      // Add profile picture if selected
      if (formData.profilePicture) {
        console.log("Appending profile picture to form data");
        formPayload.append('profilePicture', formData.profilePicture);
      }

      // Log form data for debugging
      console.log('Submitting form data:', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        age: formData.age,
        hasProfilePicture: !!formData.profilePicture
      });

      // Update profile
      const response = await userService.updateProfile(formPayload);
      console.log('Profile update response:', response);

      // Update parent component's state with the new data
      if (response.data) {
        setUserData(prevData => {
          const updatedData = {
            ...prevData,
            ...response.data
          };
          console.log("Updated user data:", updatedData);
          return updatedData;
        });

        // Update the profile image with the new path from the server
        if (response.data.profilePicture) {
          const newImageUrl = response.data.profilePicture.startsWith('http') 
            ? response.data.profilePicture 
            : `${backendBaseUrl}${response.data.profilePicture}`;
          
          console.log("Setting new profile image after update:", newImageUrl);
          setProfileImage(newImageUrl);
        }
      }

      // Reset editing mode
      setIsEditing(false);

      // Show success toast
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <div style={{position: 'relative', width: '100%'}}>
        {/* Header with title and single edit button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 className="text-2xl font-bold text-[#66220B]">Profile Settings</h2>
          
          {/* Only show edit button when not in edit mode */}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: '#F09000',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-picture-section flex flex-col items-center mb-6">
          <div className="profile-picture-container relative mb-4">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-[#F09000]"
              onError={handleImageError}
            />
            
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-[#F09000] text-white p-2 rounded-full cursor-pointer shadow-md">
                <i className="fas fa-camera"></i>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-[#66220B]">
            {formData.name || 'User Name'}
          </h3>
          <p className="text-gray-500">
            @{formData.username || 'username'}
          </p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="profile-info grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 mb-2">Username</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 mb-2">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age} 
                  onChange={handleChange}
                  min="0"
                  max="120"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F09000]"
                />
              </div>
            </div>
            
            {/* Save and Cancel buttons at the bottom */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px'
            }}>
              <button 
                type="button"
                style={{
                  backgroundColor: '#E0E0E0',
                  color: '#333',
                  padding: '10px 24px',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#F09000',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-100">{formData.name}</div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-100">{formData.username}</div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-100">{formData.email}</div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Age</label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-100">{formData.age}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;