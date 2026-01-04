import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { THEMES } from '../constants';
import { ThemeName } from '../types';
import Header from './Header';
import Footer from './Footer';
import { ArrowRight, Zap, Sparkles, Rocket, Settings, Sword, Leaf, Search, Shield, Castle, Building, Dna, Cpu } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap, Sparkles, Rocket, Settings, Sword, Leaf, Search, Shield, Castle, Building, Dna, Cpu
};

interface ParallaxHeroProps {
  onStart: () => void;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ onStart }) => {
  const [hoveredTheme, setHoveredTheme] = useState<ThemeName | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Hero section parallax
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Clear any saved theme selection on mount (homepage shouldn't have selections)
  useEffect(() => {
    localStorage.removeItem('selectedTheme');
  }, []);

  const handleCreateWithTheme = (themeName: ThemeName) => {
    // Save the selected theme temporarily for the CardCreator
    localStorage.setItem('selectedTheme', themeName);
    onStart();
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Parallax Background Characters - ONLY in hero section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: '100vh' }}>
        {THEMES.map((theme, index) => {
          const alignment = index % 2 === 0 ? 'hero' : 'villain';
          // Create varied parallax speeds - each character moves differently
          const speeds = [-80, 120, -100, 90, -60, 110, -120, 70, -90, 100, -70, 130];
          const parallaxSpeed = speeds[index];
          const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed]);

          // Position characters to fill the hero section
          const positions = [
            { top: '5%', left: '2%', size: '400px', rotate: -10 },
            { top: '15%', right: '5%', size: '450px', rotate: 15 },
            { top: '35%', left: '8%', size: '380px', rotate: 5 },
            { top: '10%', right: '25%', size: '420px', rotate: -8 },
            { top: '40%', left: '30%', size: '390px', rotate: 12 },
            { top: '20%', right: '15%', size: '410px', rotate: -15 },
            { top: '50%', left: '5%', size: '440px', rotate: 8 },
            { top: '45%', right: '30%', size: '370px', rotate: -12 },
            { top: '30%', left: '20%', size: '400px', rotate: 10 },
            { top: '55%', right: '10%', size: '430px', rotate: -5 },
            { top: '25%', left: '40%', size: '390px', rotate: 7 },
            { top: '60%', right: '35%', size: '410px', rotate: -18 },
          ];

          const position = positions[index];

          return (
            <motion.div
              key={`bg-${theme.id}`}
              className="absolute opacity-70"
              style={{
                top: position.top,
                left: position.left,
                right: position.right,
                y,
                width: position.size,
                height: 'auto',
                transform: `rotate(${position.rotate}deg)`,
              }}
            >
              <img
                src={`/ss-${theme.id}-${alignment}.png`}
                alt=""
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        <Header actions={
          <>
            <SignedOut>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-colors font-action tracking-wider border border-gray-300">
                    SIGN IN
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2 bg-vibez-purple hover:bg-vibez-blue text-white font-bold rounded-full transition-colors font-action tracking-wider shadow-lg">
                    SIGN UP
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <button
                onClick={onStart}
                className="px-6 py-2 bg-vibez-purple hover:bg-vibez-blue text-white font-bold rounded-full transition-colors font-action tracking-wider shadow-lg"
              >
                GO TO DASHBOARD
              </button>
            </SignedIn>
          </>
        } />

        <main className="flex-1 relative flex flex-col">
          {/* Hero Section */}
          <section className="container mx-auto px-6 pt-32 pb-12 md:py-32">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              style={{ y: heroY, opacity: heroOpacity }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="font-comic text-xl md:text-2xl text-gray-600 mb-6 tracking-wide">
                  Become the Super Staffer you were <br className="block md:hidden" /> destined to become.
                </p>
              </motion.div>

              <SignedOut>
                <SignUpButton mode="modal">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-lg hover:shadow-xl"
                  >
                    <span>CREATE YOUR CARD</span>
                    <svg className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="group relative inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-lg hover:shadow-xl"
                >
                  <span>CREATE YOUR CARD</span>
                  <svg className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </SignedIn>
            </motion.div>
          </section>

          {/* Themes Section */}
          <section className="bg-gradient-to-b from-white to-gray-50 py-10 md:py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-10 md:mb-16">
                <h2 className="font-action text-3xl md:text-5xl text-gray-900 mb-4">
                  CHOOSE YOUR DESTINY
                </h2>
                <p className="font-comic text-lg text-gray-600 max-w-2xl mx-auto">
                  Select from 12 unique superhero themes. Will you be a hero or a villain?
                </p>
              </div>

              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {THEMES.map((theme, index) => {
                  const isHovered = hoveredTheme === theme.name;
                  // Create different parallax speeds for each card based on index
                  // Even indices move slower (heroes), odd indices move faster (villains)
                  const parallaxSpeed = index % 2 === 0 ? -50 : -30;
                  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed]);

                  return (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      style={{ y }}
                      onMouseEnter={() => setHoveredTheme(theme.name)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      className={`group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                        isHovered ? 'border-2' : 'border border-gray-200'
                      }`}
                      {...(isHovered && {
                        style: {
                          ...{ y },
                          borderColor: theme.colors.from,
                        }
                      })}
                    >
                      {/* Content wrapper - fixed height with space for button */}
                      <div className="flex flex-col items-center text-center h-full">
                        {/* Icon with gradient background circle */}
                        <div
                          className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.from}15, ${theme.colors.to}15)`
                          }}
                        >
                          {(() => {
                            const IconComponent = iconMap[theme.icon];
                            return IconComponent ? (
                              <IconComponent
                                className="transition-all duration-300"
                                size={48}
                                strokeWidth={2.5}
                                style={{
                                  color: theme.colors.from
                                }}
                              />
                            ) : null;
                          })()}
                        </div>

                        <h3 className="font-action text-sm uppercase mb-2 text-gray-900 transition-colors duration-300">
                          {theme.name}
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-600 mb-4 flex-1">
                          {theme.description}
                        </p>

                        {/* Button area - always present, fades in on hover */}
                        <div className={`w-full transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateWithTheme(theme.name);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-action text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg"
                            style={{
                              backgroundColor: isHovered ? theme.colors.from : 'transparent',
                              color: 'white'
                            }}
                          >
                            <span>CREATE</span>
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ParallaxHero;
