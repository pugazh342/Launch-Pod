import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your actual UUID from your Supabase table
const EVENT_ID = 'd5fcc130-f480-46c4-a720-27e203342115'; 

export default function Viewer() {
  const [status, setStatus] = useState('loading'); 
  const [targetUrl, setTargetUrl] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Handle window resizing for confetti
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Database Listener & One-Time Play Check
  useEffect(() => {
    const fetchInitialState = async () => {
      const { data } = await supabase.from('launch_config').select('status, target_url').eq('id', EVENT_ID).single();
      if (data) {
        // Check if this browser has already seen the launch
        const isCompleted = localStorage.getItem('launch_completed');
        
        if (data.status === 'countdown' && isCompleted === 'true') {
          // They already saw it, instantly redirect them back to the site
          window.location.href = data.target_url;
          return;
        }

        setStatus(data.status);
        setTargetUrl(data.target_url);
      }
    };
    
    fetchInitialState();

    const channel = supabase.channel('launch-listener')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'launch_config', filter: `id=eq.${EVENT_ID}` },
        (payload) => {
          // If the Admin resets the system to closed, erase the stamp for testing
          if (payload.new.status === 'closed') {
            localStorage.removeItem('launch_completed');
          }
          
          setStatus(payload.new.status);
          setTargetUrl(payload.new.target_url);
        }
      ).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Timer, Audio Logic, & Redirect
  useEffect(() => {
    let timer;
    if (status === 'countdown' && timeLeft > 0) {
      
      // Play tick sound via DOM
      if (soundEnabled) {
        const tickAudio = document.getElementById('audio-tick');
        if (tickAudio) {
          tickAudio.currentTime = 0;
          tickAudio.play().catch(e => console.log("Tick blocked:", e));
        }
      }
      
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      
    } else if (status === 'countdown' && timeLeft === 0 && !showCelebration) {
      setShowCelebration(true);
      
      // Play launch sound via DOM
      if (soundEnabled) {
        const launchAudio = document.getElementById('audio-launch');
        if (launchAudio) {
          launchAudio.currentTime = 0;
          launchAudio.play().catch(e => console.log("Launch blocked:", e));
        }
      }
      
      // Apply stamp and redirect after 6 seconds
      setTimeout(() => {
        localStorage.setItem('launch_completed', 'true');
        window.location.href = targetUrl;
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, showCelebration, targetUrl, soundEnabled]);


  // Audio Unlock Sequence
  const handleEnableAudio = () => {
    setSoundEnabled(true);
    // Silent play to unlock the browser's audio context
    const tickAudio = document.getElementById('audio-tick');
    if (tickAudio) {
      tickAudio.play().then(() => {
        tickAudio.pause();
        tickAudio.currentTime = 0;
      }).catch(() => {});
    }
  };

  if (status === 'loading') return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-cyan-500 font-mono">Connecting to Terminal...</div>;

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center font-sans">
      
      {/* Hidden HTML5 Audio Tags */}
      <audio id="audio-tick" src="/tick.mp3" preload="auto"></audio>
      <audio id="audio-launch" src="/launch.mp3" preload="auto"></audio>

      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* 1. The Closed / Decorated State */}
      <AnimatePresence>
        {status === 'closed' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ y: '-100vh', opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm"
          >
            {!soundEnabled && (
              <button 
                onClick={handleEnableAudio}
                className="absolute top-10 px-6 py-2 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-900 transition-all font-mono animate-pulse z-50 cursor-pointer"
              >
                [Click to Enable Terminal Audio]
              </button>
            )}

            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.8)]"></div>
            
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase text-center mt-12 drop-shadow-lg">
              System Locked
            </h1>
            <p className="mt-6 text-xl text-cyan-800 uppercase tracking-widest font-mono">
              Awaiting Launch Command
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. The Countdown Timer */}
      <AnimatePresence>
        {status === 'countdown' && !showCelebration && (
          <motion.div
            key={timeLeft}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute z-40 text-[18rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,1)]"
          >
            {timeLeft}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Grand Celebration & Logo Reveal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black"
          >
            {/* Custom Confetti Colors: Cyber Cyan, Deep Blue, White, Silver */}
            <Confetti width={windowSize.width} height={windowSize.height} recycle={true} numberOfPieces={800} gravity={0.15} colors={['#22d3ee', '#1e3a8a', '#ffffff', '#94a3b8']} />
            
            {/* Epic Logo Reveal */}
            <motion.img 
              src="/cyber-wolf-logo.jpg" 
              alt="Cyber Wolf Logo"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 60, duration: 1.5 }}
              className="w-64 md:w-96 mb-8 drop-shadow-[0_0_35px_rgba(34,211,238,0.8)] z-40" 
            />

            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-4 z-40 text-center"
            >
              Cyber Wolf is Live
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xl text-cyan-400 animate-pulse font-mono z-40"
            >
              Establishing secure connection...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}