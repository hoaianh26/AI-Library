import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, uploadAvatar } from '../services/authService';
import Layout from '../layouts/Layout';
import { motion } from 'framer-motion';
import { User, Camera } from 'lucide-react';

const SettingsPage = () => {
    const { user, token, logout, refreshUser } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setProfile({ name: user.name, email: user.email });
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    useEffect(() => {
        if (selectedAvatar) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(selectedAvatar);
        } else if (user && user.avatar) {
            setAvatarPreview(user.avatar);
        } else {
            setAvatarPreview(null);
        }
    }, [selectedAvatar, user]);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedAvatar(e.target.files[0]);
            setMessage('');
            setError('');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await updateProfile(profile.name, profile.email, token);
            setMessage('Profile updated successfully!');
            refreshUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (password.newPassword !== password.confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }
        try {
            const res = await changePassword(password.currentPassword, password.newPassword, token);
            setMessage('Password changed successfully!');
            setPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password.');
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!selectedAvatar) {
            setError('Please select an avatar to upload.');
            return;
        }
        try {
            const res = await uploadAvatar(selectedAvatar, token);
            setMessage('Avatar updated successfully!');
            setSelectedAvatar(null);
            refreshUser();
        } catch (err) {
            setError(err.response?.data?.message || 'Avatar upload failed.');
        }
    };

    const pageVariants = {
        initial: { opacity: 0, x: -100 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 100 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    return (
        <Layout>
            <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white"
            >
                <div className="max-w-4xl mx-auto bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-8 border border-gray-700">
                    <h1 className="text-4xl font-extrabold text-white text-center mb-10 drop-shadow-lg">Account Settings</h1>

                    {message && <div className="bg-green-500/20 text-green-300 p-4 rounded-lg text-center">{message}</div>}
                    {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg text-center">{error}</div>}

                    {/* Avatar Upload Section */}
                    <section className="bg-gray-900/50 p-6 rounded-lg shadow-inner border border-gray-700 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Avatar</h2>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-500 shadow-lg">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                                    <User size={64} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                                title="Change avatar"
                            >
                                <Camera size={32} className="text-white" />
                            </button>
                        </div>
                        {selectedAvatar && (
                            <p className="text-gray-300 text-sm mb-4">Selected file: {selectedAvatar.name}</p>
                        )}
                        <button
                            onClick={handleAvatarSubmit}
                            disabled={!selectedAvatar}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload Avatar
                        </button>
                    </section>

                    {/* Profile Update Section */}
                    <section className="bg-gray-900/50 p-6 rounded-lg shadow-inner border border-gray-700">
                        <h2 className="text-3xl font-bold text-white mb-6">Update Profile</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-gray-300 text-sm font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                            >
                                Update Profile
                            </button>
                        </form>
                    </section>

                    {/* Password Change Section */}
                    <section className="bg-gray-900/50 p-6 rounded-lg shadow-inner border border-gray-700">
                        <h2 className="text-3xl font-bold text-white mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-gray-300 text-sm font-semibold mb-2">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={password.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={password.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={password.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                            >
                                Change Password
                            </button>
                        </form>
                    </section>

                    {/* Membership Section */}
                    <section className="bg-gray-900/50 p-6 rounded-lg shadow-inner border border-gray-700 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Manage Membership</h2>
                        <p className="text-gray-300 mb-4">Your current membership status: <span className="font-semibold text-purple-400">{user?.membership || 'Free'}</span></p>
                        <button
                            onClick={() => window.location.href = '/membership'}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                            Manage or Upgrade Membership
                        </button>
                    </section>
                </div>
            </motion.div>
        </Layout>
    );
};

export default SettingsPage;