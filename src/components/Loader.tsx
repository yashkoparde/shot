import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  // Stages: 'cinematic' | 'running'
  const [stage, setStage] = useState<'cinematic' | 'running'>('cinematic');

  useEffect(() => {
    // Stage 1: The Netflix/HBO dynamic bloody techy logo zoom (2.5 seconds)
    const introTimer = setTimeout(() => {
      setStage('running');
    }, 2500);

    // Stage 2: The minimal runner screen (3.8 seconds of walking to talent)
    const completionTimer = setTimeout(() => {
      onComplete();
    }, 6300); // 2.5s intro + 3.8s runner = 6.3s total loading

    return () => {
      clearTimeout(introTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#000000] z-50 flex items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Cinematic & Glitch Custom Keyframes */}
      <style>{`
        /* Netflix-style dramatic pulse & scale */
        @keyframes netflix-zoom {
          0% {
            transform: scale(0.65) letter-spacing(0.1em);
            filter: blur(20px) brightness(0.2);
            opacity: 0;
          }
          10% {
            transform: scale(1);
            filter: blur(0px) brightness(1.5);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 35px rgba(239, 68, 68, 0.8));
          }
          90% {
            transform: scale(1.4);
            filter: blur(8px) brightness(2);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            filter: blur(40px) brightness(0);
            opacity: 0;
          }
        }

        /* Ambient scanline static flicker */
        @keyframes screen-flicker {
          0%, 100% { opacity: 0.95; }
          45% { opacity: 0.9; }
          50% { opacity: 0.6; }
          55% { opacity: 0.85; }
          70% { opacity: 0.5; }
          72% { opacity: 0.95; }
          90% { opacity: 0.8; }
        }

        /* Chromatic glitch offset */
        @keyframes text-glitch {
          0%, 100% { text-shadow: 2px -1px 0 rgba(239,68,68,0.5), -2px 1px 0 rgba(34,211,238,0.5); }
          20% { text-shadow: -3px 2px 0 rgba(239,68,68,0.6), 3px -2px 0 rgba(34,211,238,0.6); }
          40% { text-shadow: 3px 3px 0 rgba(239,68,68,0.4), -3px -3px 0 rgba(34,211,238,0.4); }
          60% { text-shadow: -1px -2px 0 rgba(239,68,68,0.7), 1px 2px 0 rgba(34,211,238,0.7); }
          80% { text-shadow: 4px -1px 0 rgba(239,68,68,0.5), -4px 1px 0 rgba(34,211,238,0.5); }
        }

        /* Horizonal slice noise */
        @keyframes horizontal-noise {
          0%, 100% { transform: translateY(0) scaleY(1); }
          10% { transform: translateY(1px) scaleY(1.02); }
          50% { transform: translateY(-1px) scaleY(0.98); }
          85% { transform: translateY(2px) scaleY(1.01); }
        }

        /* Runner cycle keyframes */
        @keyframes runner-bounce {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes left-leg-swing {
          0%, 100% { transform: rotate(-38deg); }
          50% { transform: rotate(45deg); }
        }
        @keyframes right-leg-swing {
          0%, 100% { transform: rotate(45deg); }
          50% { transform: rotate(-38deg); }
        }
        @keyframes left-arm-swing {
          0%, 100% { transform: rotate(45deg); }
          50% { transform: rotate(-50deg); }
        }
        @keyframes right-arm-swing {
          0%, 100% { transform: rotate(-50deg); }
          50% { transform: rotate(45deg); }
        }

        .animate-cinematic-zoom {
          animation: netflix-zoom 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-glitch-text {
          animation: text-glitch 0.3s infinite linear;
        }
        .animate-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.06), 
            rgba(0, 255, 0, 0.02), 
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 4px, 6px 100%;
          animation: screen-flicker 0.15s infinite;
        }
        .animate-slice-noise {
          animation: horizontal-noise 1.5s infinite ease-in-out;
        }
        .animate-runner-body { animation: runner-bounce 0.45s infinite ease-in-out; }
        .animate-left-leg { animation: left-leg-swing 0.45s infinite ease-in-out; transform-origin: 20px 32px; }
        .animate-right-leg { animation: right-leg-swing 0.45s infinite ease-in-out; transform-origin: 20px 32px; }
        .animate-left-arm { animation: left-arm-swing 0.45s infinite ease-in-out; transform-origin: 20px 18px; }
        .animate-right-arm { animation: right-arm-swing 0.45s infinite ease-in-out; transform-origin: 20px 18px; }
      `}</style>

      {/* BACKGROUND ANALOG FILM STATIC SCANLINES */}
      <div className="absolute inset-0 animate-scanlines pointer-events-none z-40 opacity-70" />

      <AnimatePresence mode="wait">
        
        {/* ==========================================
            STAGE 1: NETFLIX / HBO CINEMATIC "BLOODY" GLITCH INTRO
            ========================================== */}
        {stage === 'cinematic' ? (
          <motion.div
            key="cinematic-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#000]"
          >
            {/* Ambient Bloody Red Backing Aura */}
            <div className="absolute w-[450px] h-[450px] bg-red-900/15 rounded-full filter blur-[110px] pointer-events-none animate-pulse" />

            {/* Cinematic Centerpiece Accent */}
            <div className="text-center animate-slice-noise shrink-0 flex flex-col items-center select-none relative">
              <div className="animate-cinematic-zoom">
                {/* Logo with bloody neon style */}
                <h1 className="text-8xl md:text-[11rem] font-black tracking-[0.25em] text-[#FAFAF8] filter drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-glitch-text uppercase font-sans">
                  SH<span className="text-red-600">O</span>T
                </h1>
                
                {/* Techy decentralized watermark subtext */}
                <div className="mt-4 tracking-[0.6em] font-mono text-center text-xs text-red-500/75 uppercase pl-[0.6em]">
                  TALENT ENGINE • IMMERSIVE v2.0
                </div>
              </div>
            </div>

            {/* Glowing bottom progress tracker line */}
            <div className="absolute bottom-16 left-12 right-12 max-w-sm mx-auto h-[1px] bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                className="w-1/2 h-full bg-red-600 shadow-[0_0_8px_#ef4444]"
              />
            </div>
          </motion.div>
        ) : (
          
          /* ==========================================
             STAGE 2: MINIMAL RUNNING MAN TO "TALENT"
             ========================================== */
          <motion.div
            key="runner-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center bg-[#000]"
          >
            {/* Minimalism central rectangle box */}
            <div className="w-[330px] h-[95px] bg-[#070708] border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-between px-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
              
              {/* Track Line */}
              <div className="absolute bottom-[28px] left-6 right-6 h-[1px] bg-white/5" />
              
              {/* Runner Container: Moves from left to right over the full 3.5 seconds */}
              <motion.div 
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 195, opacity: 1 }}
                transition={{ duration: 3.5, ease: [0.33, 1, 0.68, 1] }}
                className="absolute bottom-[28px] w-10 h-14 flex items-end justify-center pointer-events-none"
              >
                {/* Stylized custom SVG stick runner */}
                <svg 
                  viewBox="0 0 40 50" 
                  className="w-8 h-10 stroke-[#FAFAF8] stroke-[3.2] stroke-linecap-round stroke-linejoin-round fill-none overflow-visible"
                >
                  {/* Bobbing Body Group */}
                  <g className="animate-runner-body">
                    {/* Head */}
                    <circle cx="20" cy="8" r="4.5" className="fill-[#FAFAF8] stroke-none" />
                    
                    {/* Spine */}
                    <line x1="20" y1="12.5" x2="20" y2="32" />
                    
                    {/* Arms */}
                    <line x1="20" y1="18" x2="11" y2="24" className="animate-left-arm" />
                    <line x1="20" y1="18" x2="29" y2="24" className="animate-right-arm" />
                  </g>

                  {/* Legs swing from hip joint (20, 32) */}
                  <line x1="20" y1="32" x2="12" y2="46" className="animate-left-leg" />
                  <line x1="20" y1="32" x2="28" y2="46" className="animate-right-leg" />
                </svg>
              </motion.div>

              {/* Goal Indicator text "TALENT" on the absolute right */}
              <div className="ml-auto flex flex-col items-end justify-center z-10 select-none">
                <span className="text-[11px] font-mono tracking-[0.45em] font-black text-white/95 uppercase pl-[0.45em]">
                  TALENT
                </span>
                <span className="text-[6px] font-mono tracking-[0.2em] text-red-500 uppercase mt-1">
                  CENTER STAGE
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
