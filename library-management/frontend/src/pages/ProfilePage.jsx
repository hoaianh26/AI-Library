import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Award, UserRound, Home, Phone, Calendar, Fingerprint, Clock, Heart, BookOpen, CheckCircle, XCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (loading) {
    return <div className="text-center py-8 text-white">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-8 text-gray-500">No profile data available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">User Profile</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-8 max-w-2xl mx-auto flex flex-col items-center border border-gray-700">
        {/* Avatar */}
        <div className="mb-6 relative">
          <img
            src={profile.avatar || "https://via.placeholder.com/150/6366f1/FFFFFF?text=User"}
            alt="User Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
          />
          {profile.status === 'active' ? (
            <CheckCircle className="absolute bottom-0 right-0 w-8 h-8 text-green-400 bg-gray-900 rounded-full p-1 border-2 border-gray-800" />
          ) : (
            <XCircle className="absolute bottom-0 right-0 w-8 h-8 text-red-400 bg-gray-900 rounded-full p-1 border-2 border-gray-800" />
          )}
        </div>

        {/* User Name */}
        <h2 className="text-white text-3xl font-bold mb-2">{profile.name}</h2>
        <p className="text-gray-400 text-lg mb-6 capitalize">{profile.membershipType} Member</p>

        {/* User Details Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-400" />
            <span className="text-gray-300">Email:</span>
            <span className="text-white font-medium ml-auto">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-gray-300">Role:</span>
            <span className="text-white font-medium ml-auto capitalize">{profile.role}</span>
          </div>
          {profile.gender && (
            <div className="flex items-center gap-3">
              <UserRound className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Gender:</span>
              <span className="text-white font-medium ml-auto capitalize">{profile.gender}</span>
            </div>
          )}
          {profile.address && (
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Address:</span>
              <span className="text-white font-medium ml-auto">{profile.address}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Phone:</span>
              <span className="text-white font-medium ml-auto">{profile.phoneNumber}</span>
            </div>
          )}
          {profile.dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Date of Birth:</span>
              <span className="text-white font-medium ml-auto">{formatDate(profile.dateOfBirth)}</span>
            </div>
          )}
          {profile.libraryId && (
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Library ID:</span>
              <span className="text-white font-medium ml-auto">{profile.libraryId}</span>
            </div>
          )}
          {profile.createdAt && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Member Since:</span>
              <span className="text-white font-medium ml-auto">{formatDate(profile.createdAt)}</span>
            </div>
          )}
          {profile.status && (
            <div className="flex items-center gap-3">
              {profile.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-gray-300">Account Status:</span>
              <span className="text-white font-medium ml-auto capitalize">{profile.status}</span>
            </div>
          )}
          {profile.viewHistory && (
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Books Viewed:</span>
              <span className="text-white font-medium ml-auto">{profile.viewHistory.length}</span>
            </div>
          )}
          {/* Membership Expiration Date - Placeholder as it's not in the model yet */}
          {/* {profile.membershipExpirationDate && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="text-gray-300">Membership Expires:</span>
              <span className="text-white font-medium ml-auto">{formatDate(profile.membershipExpirationDate)}</span>
            </div>
          )} */}
        </div>

        {profile.favoriteCategories && profile.favoriteCategories.length > 0 && (
          <div className="w-full mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-400" /> Favorite Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteCategories.map((category, index) => (
                <span key={index} className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;