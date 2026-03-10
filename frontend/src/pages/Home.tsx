import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import Lottie from 'lottie-react';
import coffeeAnimation from '../../public/Hot Smiling Coffee _ Good Morning.json';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Text animation variants (motionflow.dev inspired)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212] font-chat relative overflow-hidden">
      {/* Large Coffee Watermark in Center */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="w-[700px] h-[700px] opacity-[0.03]">
          <Lottie animationData={coffeeAnimation} loop={true} />
        </div>
      </div>

      {/* Particle Background */}
      <Particles
        id="tsparticles"
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
              color: '#8b5cf6',
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl">
        {/* Left: Hero Content */}
        <div className="flex flex-col items-start justify-center space-y-6 sm:space-y-8 pt-4 sm:pt-0">
          {/* Brand Name with Coffee as "I" */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-0"
          >
            <div className="h-[1.25rem] w-[1.25rem]">
              <Lottie animationData={coffeeAnimation} loop={true} />
            </div>
            <span className="text-chat-purple text-xl font-bold tracking-wider leading-none">
              VLOGE
            </span>
          </motion.div>

          {/* Animated Heading with word-by-word reveal */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            {['A', 'new', 'way', 'to', 'connect', 'with', 'your', 'friends'].map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-2 sm:mr-3 lg:mr-4"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            transition={{ delay: 1 }}
            className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md"
          >
            Experience the next generation of real-time communication. Secure, fast, and encrypted.
          </motion.p>

          <button
            onClick={() => navigate('/login')}
            className="squircle-btn"
          >
            <div className="chevron"></div>
          </button>
        </div>

        {/* Right: Rotating Orbit Animation */}
        <div className="flex items-center justify-center">
          <motion.div
            className="relative w-96 h-96 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Rotating Orbits */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-full h-full border border-gray-800 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[280px] h-[280px] border border-gray-700/50 rounded-full"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[180px] h-[180px] border border-gray-600/30 rounded-full"
            />

            {/* Orbiting Avatars */}
            {[
              { angle: 0, color: 'bg-red-500', duration: 8 },
              { angle: 60, color: 'bg-purple-500', duration: 10 },
              { angle: 120, color: 'bg-yellow-500', duration: 12 },
              { angle: 180, color: 'bg-blue-500', duration: 9 },
              { angle: 240, color: 'bg-green-500', duration: 11 },
              { angle: 300, color: 'bg-orange-500', duration: 7 }
            ].map((avatar, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  rotate: 360
                }}
                transition={{
                  scale: { delay: i * 0.1, duration: 0.5 },
                  rotate: { duration: avatar.duration, repeat: Infinity, ease: 'linear' }
                }}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${avatar.angle}deg)` }}
              >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 ${avatar.color} rounded-full border-4 border-[#121212] shadow-xl`} />
              </motion.div>
            ))}

            {/* Center Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-chat-purple rounded-full flex items-center justify-center shadow-2xl border-2 border-white/10 overflow-hidden z-10"
            >
              <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="Me" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
