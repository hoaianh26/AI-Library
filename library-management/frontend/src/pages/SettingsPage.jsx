import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, uploadAvatar } from '../services/authService';
import Layout from '../layouts/Layout';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Lock, Shield, Crown } from 'lucide-react';

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
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-8"
        >
            {/* Animated background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
                        Account Settings
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">Manage your profile and preferences</p>
                </div>

                {/* Message Alerts */}
                {message && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-300 text-center backdrop-blur-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl text-red-300 text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Avatar Section */}
                    <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:border-purple-500/50 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 group-hover:border-purple-500/60 shadow-xl transition-all duration-300">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                                            <User size={64} className="text-gray-300" />
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
                                        className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        title="Change avatar"
                                    >
                                        <Camera size={32} className="text-white" />
                                    </button>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile Picture</h2>
                                <p className="text-gray-400 text-sm mb-4">Upload a new avatar to personalize your account</p>
                                {selectedAvatar && (
                                    <p className="text-purple-400 text-sm mb-3 font-medium">✓ {selectedAvatar.name}</p>
                                )}
                                <button
                                    onClick={handleAvatarSubmit}
                                    disabled={!selectedAvatar}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    Upload Avatar
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Profile Update Section */}
                    <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                                <User size={20} className="text-blue-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Update Profile</h2>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="group">
                                <label htmlFor="name" className="block text-gray-300 text-sm font-semibold mb-2">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="group">
                                <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleProfileSubmit}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/50"
                            >
                                Save Changes
                            </button>
                        </div>
                    </section>

                    {/* Password Change Section */}
                    <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:border-amber-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                                <Shield size={20} className="text-amber-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Change Password</h2>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="group">
                                <label htmlFor="currentPassword" className="block text-gray-300 text-sm font-semibold mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={password.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white placeholder-gray-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="group">
                                <label htmlFor="newPassword" className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={password.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white placeholder-gray-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="group">
                                <label htmlFor="confirmNewPassword" className="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        type="password"
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        value={password.confirmNewPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white placeholder-gray-500 transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handlePasswordSubmit}
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/50"
                            >
                                Update Password
                            </button>
                        </div>
                    </section>

                    {/* Membership Section */}
                    <section className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl hover:border-purple-500/60 transition-all duration-300">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full mb-4">
                                <Crown size={32} className="text-purple-300" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Membership Status</h2>
                            <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full mb-6">
                                <p className="text-purple-300 font-semibold">{user?.membership || 'Free'} Member</p>
                            </div>
                            <p className="text-gray-300 mb-6 text-sm sm:text-base">Unlock premium features and exclusive benefits</p>
                            <button
                                onClick={() => window.location.href = '/membership'}
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                            >
                                Manage Membership
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;