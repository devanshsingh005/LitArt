import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { User, Edit, LogOut, Camera } from 'lucide-react';
import SignIn from '../components/SignIn';
import Register from '../components/Register';
import { useLocation, useNavigate } from 'react-router-dom';
import { setupStoragePolicies } from '../utils/setupStorage';

interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar_url: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setupStoragePolicies().then(() => {
      if (user) {
        fetchProfile();
      }
    });

    const urlParams = new URLSearchParams(location.search);
    const errorMessage = urlParams.get('error');
    const successMessage = urlParams.get('success');

    if (errorMessage) setError(errorMessage);
    if (successMessage) setSuccess(successMessage);
  }, [user, location]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData) {
        throw new Error('Failed to get public URL for the image');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      setEditedProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      setSuccess('Profile picture updated successfully');
    } catch (error) {
      console.error('Error in image upload process:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editedProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editedProfile.name,
          bio: editedProfile.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Sign In or Register</h2>
        <SignIn />
        <div className="mt-4">
          <Register />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {profile ? (
        <div>
          <div className="mb-4 relative">
            <img
              src={profile.avatar_url || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
              <Camera size={24} />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedProfile?.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block mb-1">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={editedProfile?.bio || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Bio:</strong> {profile.bio}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Edit className="mr-2" /> Edit Profile
              </button>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <LogOut className="mr-2" /> Sign Out
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;