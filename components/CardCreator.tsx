import React, { useState } from 'react';
import { User, Alignment, ThemeName } from '../types';
import { THEMES } from '../constants';
import { generateCardImage } from '../services/gemini';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardCreatorProps {
  user: User;
  onCancel: () => void;
  onSuccess: (imageUrl: string, theme: ThemeName, alignment: Alignment) => void;
}

const CardCreator: React.FC<CardCreatorProps> = ({ user, onCancel, onSuccess }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<Alignment>('Hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!selectedThemeId) {
      setError("Please select a theme first!");
      return;
    }
    const theme = THEMES.find(t => t.id === selectedThemeId);
    if (!theme) return;

    setIsGenerating(true);
    setError('');

    try {
      const imageUrl = await generateCardImage(user.selfie, theme.name, alignment);
      onSuccess(imageUrl, theme.name, alignment);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate card. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onCancel}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-action text-3xl">Create New Card</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Alignment Selection */}
            <div className="space-y-4">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-sm">Select Alignment</label>
              <div className="grid grid-cols-2 gap-4">
                {(['Hero', 'Villain'] as Alignment[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => setAlignment(align)}
                    className={`p-4 rounded-xl border-2 font-action text-xl transition-all ${
                      alignment === align 
                        ? align === 'Hero' ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-red-500 bg-red-500/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {align.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-sm">Select Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all overflow-hidden ${
                        isSelected 
                          ? 'border-vibez-purple bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg ring-2 ring-vibez-purple/50' 
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={`text-4xl mb-2 ${isSelected ? 'scale-110 transition-transform' : ''}`}>
                        {theme.icon}
                      </div>
                      <div className={`text-center font-bold text-sm ${isSelected ? 'text-vibez-blue' : 'text-slate-400'}`}>
                        {theme.name}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-vibez-purple rounded-xl pointer-events-none" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right: Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h3 className="font-action text-xl mb-4 text-slate-200">Preview Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Identity</span>
                  <span className="font-bold text-white">{user.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Alignment</span>
                  <span className={`font-bold ${alignment === 'Hero' ? 'text-blue-400' : 'text-red-400'}`}>
                    {alignment}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Theme</span>
                  <span className="font-bold text-vibez-blue">
                    {THEMES.find(t => t.id === selectedThemeId)?.name || 'Not Selected'}
                  </span>
                </div>
              </div>

              <button
                disabled={!selectedThemeId || isGenerating}
                onClick={handleGenerate}
                className={`w-full py-4 rounded-xl font-action text-lg flex items-center justify-center gap-2 transition-all ${
                  !selectedThemeId || isGenerating
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-vibez-blue to-vibez-purple text-white shadow-lg hover:shadow-vibez-purple/50 hover:scale-[1.02]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles /> GENERATE CARD
                  </>
                )}
              </button>
              
              {isGenerating && (
                <p className="text-center text-xs text-slate-400 mt-4 animate-pulse">
                  Connecting to the Multiverse... This may take up to 20 seconds.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCreator;