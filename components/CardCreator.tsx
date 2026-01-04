import React, { useState, useEffect } from 'react';
import { User, Alignment, ThemeName } from '../types';
import { THEMES } from '../constants';
import { generateCardImage } from '../services/gemini';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Rocket,
  Settings,
  Sword,
  Leaf,
  Search,
  Shield,
  Castle,
  Building,
  Dna,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap, Sparkles, Rocket, Settings, Sword, Leaf, Search, Shield, Castle, Building, Dna, Cpu
};

interface CardCreatorProps {
  user: User;
  onCancel: () => void;
  onSuccess: (imageUrl: string, theme: ThemeName, alignment: Alignment) => void;
}

type WizardStep = 'alignment' | 'theme' | 'generating';

const CardCreator: React.FC<CardCreatorProps> = ({ user, onCancel, onSuccess }) => {
  const [step, setStep] = useState<WizardStep>('alignment');
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeName | null>(null);

  // Load selected theme from localStorage on mount (from homepage)
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const theme = THEMES.find(t => t.name === savedTheme);
      if (theme) {
        setSelectedTheme(theme.name);
        // If coming from homepage with theme, skip to alignment
        setStep('alignment');
      }
    }
  }, []);

  const handleAlignmentSelect = (align: Alignment) => {
    setAlignment(align);
    setStep('theme');
  };

  const handleThemeSelect = async (themeName: ThemeName) => {
    setSelectedTheme(themeName);

    // If we already have alignment, proceed to generation
    if (alignment) {
      await generateCard(themeName, alignment);
    }
  };

  const generateCard = async (theme: ThemeName, align: Alignment) => {
    setStep('generating');

    try {
      const imageUrl = await generateCardImage(user.selfie, theme, align);
      onSuccess(imageUrl, theme, align);
    } catch (err: any) {
      console.error(err);
      // On error, go back to theme selection
      setStep('theme');
      alert(err.message || "Failed to generate card. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === 'theme') {
      setStep('alignment');
      setAlignment(null);
    } else if (step === 'alignment') {
      onCancel();
    }
  };

  // Alignment Selection Screen
  if (step === 'alignment') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {/* Back button */}
            <button
              onClick={onCancel}
              className="mb-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="font-action text-4xl md:text-6xl text-gray-900 mb-4">
                CHOOSE YOUR PATH
              </h1>
              <p className="font-comic text-xl text-gray-600">
                Will you be a hero or a villain?
              </p>
            </motion.div>

            {/* Alignment Options */}
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleAlignmentSelect('Hero')}
                className="group relative bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl p-12 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Shield className="w-20 h-20 mx-auto mb-6" strokeWidth={2} />
                  <h2 className="font-action text-4xl mb-3">HERO</h2>
                  <p className="font-comic text-lg opacity-90">
                    Fight for justice and protect the innocent
                  </p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleAlignmentSelect('Villain')}
                className="group relative bg-gradient-to-br from-red-600 to-purple-600 rounded-3xl p-12 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <Sparkles className="w-20 h-20 mx-auto mb-6" strokeWidth={2} />
                  <h2 className="font-action text-4xl mb-3">VILLAIN</h2>
                  <p className="font-comic text-lg opacity-90">
                    Embrace chaos and conquer the world
                  </p>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Theme Selection Screen
  if (step === 'theme') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 py-12">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="mb-8 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-action text-4xl md:text-6xl text-gray-900 mb-4">
              CHOOSE YOUR THEME
            </h1>
            <p className="font-comic text-xl text-gray-600">
              Select from 12 unique superhero themes
            </p>
            {alignment && (
              <p className="font-comic text-lg text-gray-500 mt-2">
                Path: <span className={alignment === 'Hero' ? 'text-blue-600' : 'text-red-600'}>{alignment}</span>
              </p>
            )}
          </motion.div>

          {/* Theme Grid - Same as Homepage */}
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
                  style={{
                    borderColor: isHovered ? theme.colors.from : undefined
                  }}
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
                        onClick={() => handleThemeSelect(theme.name)}
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
      </div>
    );
  }

  // Generating Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-vibez-blue to-vibez-purple flex items-center justify-center p-6">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity }
          }}
          className="mb-8 inline-block"
        >
          <Sparkles className="w-24 h-24 text-white" strokeWidth={2} />
        </motion.div>

        <h2 className="font-action text-4xl md:text-5xl text-white mb-4">
          GENERATING YOUR CARD
        </h2>
        <p className="font-comic text-xl text-white/90 mb-8">
          Connecting to the Multiverse...
        </p>

        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-3 h-3 bg-white rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-white rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-3 h-3 bg-white rounded-full"
          />
        </div>

        <p className="font-comic text-sm text-white/70 mt-8">
          This may take up to 20 seconds
        </p>
      </div>
    </div>
  );
};

export default CardCreator;
