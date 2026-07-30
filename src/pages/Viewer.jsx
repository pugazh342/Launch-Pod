import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function Viewer() {
  const [status, setStatus] = useState('closed'); 
  const [targetUrl, setTargetUrl] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('cyber-wolf-channel');

    channel.bind('launch-event', function(data) {
      if (data.status === 'closed') {
        localStorage.removeItem('launch_completed');
        setStatus('closed');
        setTimeLeft(5);
        setShowCelebration(false);
        return;
      }

      const isCompleted = localStorage.getItem('launch_completed');
      if (data.status === 'countdown' && isCompleted === 'true') {
        window.location.href = data.targetUrl;
        return;
      }

      setStatus(data.status);
      setTargetUrl(data.targetUrl);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (status === 'countdown' && timeLeft > 0) {
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
      
      if (soundEnabled) {
        const launchAudio = document.getElementById('audio-launch');
        if (launchAudio) {
          launchAudio.currentTime = 0;
          launchAudio.play().catch(e => console.log("Launch blocked:", e));
        }
      }
      
      setTimeout(() => {
        localStorage.setItem('launch_completed', 'true');
        window.location.href = targetUrl;
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, showCelebration, targetUrl, soundEnabled]);


  const handleEnableAudio = () => {
    setSoundEnabled(true);
    const tickAudio = document.getElementById('audio-tick');
    if (tickAudio) {
      tickAudio.play().then(() => {
        tickAudio.pause();
        tickAudio.currentTime = 0;
      }).catch(() => {});
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden flex items-center justify-center font-sans selection:bg-blue-500/30">
      
      <audio id="audio-tick" src="/tick.mp3" preload="auto"></audio>
      <audio id="audio-launch" src="/launch.mp3" preload="auto"></audio>

      {/* Premium Background: Deep Navy Radial Gradient & Soft Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      {/* 1. The Closed / Decorated State (Glassmorphism UI) */}
      <AnimatePresence>
        {status === 'closed' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)", transition: { duration: 1.2, ease: "easeInOut" } }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
          >
            {!soundEnabled && (
              <button 
                onClick={handleEnableAudio}
                className="absolute top-10 px-6 py-2 border border-blue-500/50 text-blue-300 rounded-full hover:bg-blue-900/30 hover:border-blue-400 transition-all font-light text-sm tracking-widest backdrop-blur-md z-50 cursor-pointer"
              >
                INITIALIZE AUDIO
              </button>
            )}

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center p-16 rounded-3xl bg-blue-950/10 border border-blue-800/30 backdrop-blur-sm shadow-[0_0_80px_rgba(30,58,138,0.15)]"
            >
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8"></div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-600 tracking-[0.2em] uppercase text-center drop-shadow-sm">
                System Offline
              </h1>
              <p className="mt-6 text-lg text-blue-300/80 uppercase tracking-[0.3em] font-light">
                Awaiting Authorization
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-8"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. The Cinematic Countdown Timer */}
      <AnimatePresence>
        {status === 'countdown' && !showCelebration && (
          <motion.div
            key={timeLeft}
            initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="absolute z-40 text-[18rem] md:text-[24rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-600 drop-shadow-[0_0_60px_rgba(37,99,235,0.6)] tabular-nums leading-none"
          >
            {timeLeft}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Grand Celebration & Premium Logo Reveal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020617]"
          >
            {/* Premium Confetti: Gold, Royal Blue, Sky Blue, Silver */}
            <Confetti 
              width={windowSize.width} 
              height={windowSize.height} 
              recycle={true} 
              numberOfPieces={600} 
              gravity={0.12} 
              colors={['#D4AF37', '#1E3A8A', '#3B82F6', '#F8FAFC', '#94A3B8']} 
            />
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_60%)]"></div>

            <motion.img 
              src="/cyber-wolf-logo.png" 
              alt="Cyber Wolf Logo"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)", y: 50 }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 40, duration: 2 }}
              className="w-72 md:w-[28rem] mb-12 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] z-40" 
            />

            <motion.h1 
              initial={{ opacity: 0, y: 20, letterSpacing: "0em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.1em" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              className="text-4xl md:text-5xl font-bold text-white uppercase z-40 text-center"
            >
              Cyber Wolf is Live
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="mt-6 text-lg text-blue-300 font-light tracking-widest z-40"
            >
              <span className="inline-block animate-pulse mr-2 h-2 w-2 bg-blue-500 rounded-full"></span>
              ESTABLISHING CONNECTION
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}