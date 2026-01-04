import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { THEMES } from '../constants';

interface ParallaxHeroProps {
  onStart: () => void;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });

  const y1 = useTransform(scrollY, [0, 500], [0, -200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -300]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] text-white">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="font-action text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple drop-shadow-lg mb-4">
            SUPER STAFFER
          </h1>
          <p className="font-comic text-2xl md:text-3xl text-blue-200 tracking-wide">
            Turn your selfie into a Legend.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-vibez-purple font-action rounded-full hover:bg-vibez-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vibez-blue shadow-[0_0_20px_rgba(114,9,183,0.5)] hover:shadow-[0_0_30px_rgba(0,180,216,0.6)]"
        >
          <span>CREATE YOUR CARD</span>
          <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.button>

        {/* Floating Icons Grid (Parallax simulation) */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-30">
          <motion.div style={{ y: y1 }} className="absolute top-20 left-10 text-6xl">⚡</motion.div>
          <motion.div style={{ y: y2 }} className="absolute top-40 right-20 text-5xl">🛡️</motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-40 left-1/4 text-6xl">🚀</motion.div>
          <motion.div style={{ y: y1 }} className="absolute bottom-20 right-1/3 text-5xl">🔥</motion.div>
          <motion.div style={{ y: y2 }} className="absolute top-1/2 left-10 text-4xl">🔮</motion.div>
          <motion.div style={{ y: y3 }} className="absolute top-1/3 right-10 text-6xl">⚔️</motion.div>
        </div>

        {/* Themes Showcase */}
        <div className="mt-32 w-full max-w-4xl">
           <h3 className="font-comic text-2xl text-slate-400 mb-8">CHOOSE YOUR DESTINY</h3>
           <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             {THEMES.map(theme => (
               <div key={theme.id} className="flex flex-col items-center gap-2 p-2 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700">
                 <span className="text-3xl">{theme.icon}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-300">{theme.name.split(' ')[0]}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxHero;