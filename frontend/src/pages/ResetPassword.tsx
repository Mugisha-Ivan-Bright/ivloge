import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import toast, { Toaster } from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await AuthService.resetPassword(token, newPassword);
            toast.success('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212] relative overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e1e1e',
                        color: '#fff',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Particle Background */}
            <Particles
                id="tsparticles-reset"
                init={particlesInit}
                options={{
                    fullScreen: { enable: false },
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 80, density: { enable: true, area: 800 } },
                        color: { value: ['#8b5cf6', '#f97316', '#3b82f6', '#10b981'] },
                        shape: { type: 'circle' },
                        opacity: {
                            value: 0.5,
                            random: true,
                            animation: { enable: true, speed: 1, minimumValue: 0.1 }
                        },
                        size: {
                            value: 3,
                            random: true,
                            animation: { enable: true, speed: 2, minimumValue: 0.5 }
                        },
                        links: {
                            enable: true,
                            distance: 150,
                            color: '#f97316',
                            opacity: 0.2,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 1,
                            direction: 'none',
                            random: false,
                            straight: false,
                            outModes: { default: 'bounce' }
                        }
                    },
                    interactivity: {
                        detectsOn: 'canvas',
                        events: {
                            onHover: { enable: true, mode: 'grab' },
                            resize: true
                        },
                        modes: {
                            grab: { distance: 140, links: { opacity: 0.5 } }
                        }
                    },
                    detectRetina: true
                }}
                className="absolute inset-0 z-0"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-6">
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-gray-400 mt-1 text-sm text-center">Create a new, strong password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="New Password"
                            required
                            className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 opacity-50" />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            required
                            className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="squircle-btn-sm mx-auto mt-6"
                    >
                        <div className="chevron"></div>
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-gray-400 hover:text-chat-orange transition-colors flex items-center justify-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
