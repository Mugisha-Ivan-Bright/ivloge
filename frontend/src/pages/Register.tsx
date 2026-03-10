import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../services/auth.service';
import { Mail, Lock, User } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';
import Lottie from 'lottie-react';
import orangeSkatingAnimation from '../../public/Orange skating.json';
import coffeeAnimation from '../../public/Hot Smiling Coffee _ Good Morning.json';
import toast, { Toaster } from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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

      {/* Mobile Logo - Top Left */}
      <div className="lg:hidden absolute top-4 left-4 z-20">
        <Link to="/">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-0 cursor-pointer"
          >
            <div className="h-[1.5rem] w-[1.5rem]">
              <Lottie animationData={coffeeAnimation} loop={true} />
            </div>
            <span className="text-chat-orange text-2xl font-bold tracking-wider hover:text-[#fb923c] transition-colors leading-none">
              VLOGE
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Large Coffee Watermark in Center */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="w-[600px] h-[600px] opacity-[0.03]">
          <Lottie animationData={coffeeAnimation} loop={true} />
        </div>
      </div>

      {/* Particle Background */}
      <Particles
        id="tsparticles-register"
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

      {/* Two Column Layout */}
      <div className="container mx-auto px-6 lg:px-12 z-10 grid lg:grid-cols-2 gap-12 items-center max-w-6xl relative">
        {/* Left: Register Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
            <p className="text-gray-400 mt-1 text-sm">Join our secure chat community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 opacity-50" />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-8 pr-4 focus:outline-none focus:border-chat-orange transition-colors placeholder:text-gray-500"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-chat-orange font-bold hover:underline">Sign In</Link>
          </p>
        </motion.div>

        {/* Right: Orange Skating Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:flex flex-col items-start justify-center space-y-8"
        >
          {/* Vloge Logo with Coffee as "I" */}
          <Link to="/">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-0 cursor-pointer"
            >
              <div className="h-[2.5rem] w-[2.5rem]">
                <Lottie animationData={coffeeAnimation} loop={true} />
              </div>
              <span className="text-chat-orange text-4xl font-bold tracking-wider hover:text-[#fb923c] transition-colors leading-none">
                VLOGE
              </span>
            </motion.div>
          </Link>

          <div className="w-full max-w-md">
            <Lottie animationData={orangeSkatingAnimation} loop={true} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
