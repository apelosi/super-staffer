import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { THEMES } from '../constants';
import { ThemeName } from '../types';
import Header from './Header';
import Footer from './Footer';
import { ArrowRight, Zap, Sparkles, Rocket, Settings, Sword, Leaf, Search, Shield, Castle, Building, Dna, Cpu, Camera, Wand2, Share2 } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap, Sparkles, Rocket, Settings, Sword, Leaf, Search, Shield, Castle, Building, Dna, Cpu
};

// 24 Character Strengths from Wheel of Character Strengths
const CHARACTER_STRENGTHS = [
  'Creativity', 'Curiosity', 'Judgment', 'Love of Learning', 'Perspective', 'Wisdom',
  'Bravery', 'Perseverance', 'Honesty', 'Zest',
  'Love', 'Kindness', 'Social Intelligence',
  'Teamwork', 'Fairness', 'Leadership',
  'Forgiveness', 'Humility', 'Prudence', 'Self-Regulation',
  'Appreciation of Beauty', 'Gratitude', 'Hope', 'Humor'
];

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
    <div ref={containerRef} className="relative min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* All 12 Superheroes - Banner Section with EXTREME Parallax */}
      {/* Like a fixed wallpaper that reveals more columns as browser expands */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ height: '85vh', width: '1600px', zIndex: 1 }}>
        {THEMES.map((theme, index) => {
          // Alternate between hero and villain
          const alignment = index % 2 === 0 ? 'hero' : 'villain';

          // EXTREME parallax speeds - minimum 900, maximum 1800 (2x variation)
          // Mixed order so variety on mobile (reordered themes array below)
          const speeds = [900, -1800, 1200, -1600, 1500, -1400, 1100, -1700, 1300, -1500, 1400, -1300];
          const parallaxSpeed = speeds[index];
          const y = useTransform(scrollYProgress, [0, 0.6], [0, parallaxSpeed]);

          // FIXED horizontal positions in pixels (like a wallpaper)
          // Reordered for mobile variety - avoid stacking similar characters
          // cyberpunk, mystic, space, steampunk, ninja, elemental, noir, galactic, medieval, urban, mutant, mecha
          // Reorder: cyberpunk, space, ninja, noir, medieval, mutant (top row)
          //          mystic, steampunk, elemental, galactic, urban, mecha (bottom row)
          const reorderedIndex = [0, 2, 4, 6, 8, 10, 1, 3, 5, 7, 9, 11][index];
          const positions = [
            // Row 1
            { left: '0px', top: '5%', rotate: -8 },      // Col 1
            { left: '267px', top: '12%', rotate: 12 },   // Col 2
            { left: '534px', top: '18%', rotate: -10 },  // Col 3
            { left: '801px', top: '8%', rotate: 14 },    // Col 4
            { left: '1068px', top: '15%', rotate: -12 }, // Col 5
            { left: '1335px', top: '10%', rotate: 10 },  // Col 6

            // Row 2
            { left: '0px', top: '65%', rotate: -14 },     // Col 1
            { left: '267px', top: '72%', rotate: 8 },     // Col 2
            { left: '534px', top: '68%', rotate: -9 },    // Col 3
            { left: '801px', top: '75%', rotate: 11 },    // Col 4
            { left: '1068px', top: '70%', rotate: -13 },  // Col 5
            { left: '1335px', top: '78%', rotate: 9 },    // Col 6
          ];

          const position = positions[reorderedIndex];

          return (
            <motion.div
              key={`superhero-${theme.id}`}
              className="absolute"
              style={{
                top: position.top,
                left: position.left,
                y,
                width: '280px',
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
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-colors font-action tracking-wider border border-gray-300 text-xs whitespace-nowrap">
                    SIGN IN
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 bg-vibez-purple hover:bg-vibez-blue text-white font-bold rounded-full transition-colors font-action tracking-wider shadow-lg text-xs whitespace-nowrap">
                    SIGN UP
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex gap-2">
                <button
                  onClick={onStart}
                  className="px-3 py-1.5 bg-vibez-purple hover:bg-vibez-blue text-white font-bold rounded-full transition-colors font-action tracking-wider shadow-lg text-xs whitespace-nowrap"
                >
                  DASHBOARD
                </button>
              </div>
            </SignedIn>
          </>
        } />

        <main className="flex-1 relative flex flex-col">
          {/* Hero Banner Section - Taller with Radial Burst Gradient */}
          <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Radial Burst Gradient Background */}
            <div className="absolute inset-0 bg-gradient-radial from-white via-vibez-blue/30 to-vibez-purple/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-vibez-blue/20 via-transparent to-vibez-purple/20" />

            {/* Animated color swirls */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 40% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                className="max-w-5xl mx-auto text-center"
                style={{ y: heroY, opacity: heroOpacity }}
              >
                {/* White backdrop for readability */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="font-comic text-2xl md:text-4xl text-gray-700 mb-8 tracking-wide leading-relaxed">
                      Transform yourself into the Super Staffer<br className="hidden md:block" />
                      you were destined to become.
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
                        className="group relative inline-flex items-center justify-center px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-2xl hover:shadow-3xl"
                      >
                        <span>GET STARTED</span>
                        <svg className="w-7 h-7 ml-3 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
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
                      className="group relative inline-flex items-center justify-center px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-2xl hover:shadow-3xl"
                    >
                      <span>GET STARTED</span>
                      <svg className="w-7 h-7 ml-3 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </SignedIn>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="relative py-20 md:py-32 bg-white">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-action text-4xl md:text-6xl text-gray-900 mb-4">
                  YOUR JOURNEY AWAITS
                </h2>
                <p className="font-comic text-xl text-gray-600 max-w-3xl mx-auto">
                  Three simple steps to unleash your inner Super Staffer
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {/* Feature 1: Make */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-center group"
                >
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-vibez-blue to-vibez-purple rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-vibez-blue to-vibez-purple p-8 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <Camera className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="font-action text-3xl text-gray-900 mb-4 uppercase tracking-wide">
                    Make
                  </h3>
                  <p className="font-comic text-lg text-gray-600 leading-relaxed">
                    Take a selfie and create your own collection of Super Staffer cards
                  </p>
                </motion.div>

                {/* Feature 2: Personalize */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center group"
                >
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <Wand2 className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="font-action text-3xl text-gray-900 mb-4 uppercase tracking-wide">
                    Personalize
                  </h3>
                  <p className="font-comic text-lg text-gray-600 leading-relaxed">
                    Specify your Super Staffer strengths and origin story
                  </p>
                </motion.div>

                {/* Feature 3: Share */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center group"
                >
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-green-500 to-teal-500 p-8 rounded-3xl shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <Share2 className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="font-action text-3xl text-gray-900 mb-4 uppercase tracking-wide">
                    Share
                  </h3>
                  <p className="font-comic text-lg text-gray-600 leading-relaxed">
                    Download cards or choose which cards to make public and share
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Super Powers Section - Character Strengths Wallpaper */}
          <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Radial Burst Gradient Background - matching hero section */}
            <div className="absolute inset-0 bg-gradient-radial from-white via-vibez-blue/30 to-vibez-purple/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-vibez-blue/20 via-transparent to-vibez-purple/20" />
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-action text-4xl md:text-6xl text-gray-900 mb-4">
                  SUPER POWERS
                </h2>
                <p className="font-comic text-xl text-gray-600 max-w-3xl mx-auto">
                  Harness your Strengths and turn them into Super Powers
                </p>
              </motion.div>

              {/* Character Strengths Wallpaper */}
              <div className="relative min-h-[250px] flex flex-wrap items-center justify-center gap-3 p-6">
                {CHARACTER_STRENGTHS.map((strength, index) => {
                  // More varied rotation angles for less orderly look
                  const rotations = [
                    -12, 8, -18, 15, -6, 11, -14, 9, -10, 7,
                    -16, 13, -8, 5, -15, 10, -7, 14, -20, 6,
                    -17, 12, -5, 3
                  ];
                  const rotation = rotations[index];

                  return (
                    <motion.div
                      key={strength}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ scale: 1.15, rotate: 0, zIndex: 10 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white px-4 py-2 rounded-full font-action text-xs md:text-sm shadow-lg cursor-default"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {strength}
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Below Strengths */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-16"
              >
                <p className="font-comic text-2xl text-gray-700 mb-8">
                  Ready to discover your super powers?
                </p>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative inline-flex items-center justify-center px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-2xl hover:shadow-3xl"
                    >
                      <span>GET STARTED</span>
                      <svg className="w-7 h-7 ml-3 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <motion.button
                    onClick={onStart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center justify-center px-10 py-5 md:px-14 md:py-6 text-xl md:text-2xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-vibez-blue to-vibez-purple font-action rounded-full shadow-2xl hover:shadow-3xl"
                  >
                    <span>GET STARTED</span>
                    <svg className="w-7 h-7 ml-3 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </SignedIn>
              </motion.div>
            </div>
          </section>

          {/* Themes Section */}
          <section className="bg-gradient-to-b from-white to-gray-50 py-10 md:py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-10 md:mb-16">
                <h2 className="font-action text-3xl md:text-5xl text-gray-900 mb-4">
                  CHOOSE YOUR DESTINY
                </h2>
                <p className="font-comic text-lg text-gray-600 max-w-2xl mx-auto">
                  Select your Super Staffer theme and embark on your legendary journey
                </p>
              </div>

              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {THEMES.map((theme, index) => {
                  const isHovered = hoveredTheme === theme.name;

                  return (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredTheme(theme.name)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      className={`group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                        isHovered ? 'border-2' : 'border border-gray-200'
                      }`}
                      style={isHovered ? { borderColor: theme.colors.from } : {}}
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
                          <SignedOut>
                            <SignUpButton mode="modal">
                              <button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  localStorage.setItem('selectedTheme', theme.name);
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
                            </SignUpButton>
                          </SignedOut>
                          <SignedIn>
                            <button
                              onClick={(e: React.MouseEvent) => {
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
                          </SignedIn>
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
