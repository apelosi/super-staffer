import React, { useState, KeyboardEvent } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuperPowersInputProps {
  strengths: string[];
  onStrengthsChange: (strengths: string[]) => void;
  maxStrengths?: number;
}

// Wheel of Character Strengths
const CHARACTER_STRENGTHS = {
  TRANSCENDENCE: [
    'Appreciation of Beauty',
    'Gratitude',
    'Hope',
    'Humor',
    'Spirituality'
  ],
  WISDOM: [
    'Creativity',
    'Curiosity',
    'Judgment',
    'Love of Learning',
    'Perspective'
  ],
  COURAGE: [
    'Bravery',
    'Perseverance',
    'Honesty',
    'Zest'
  ],
  HUMANITY: [
    'Love',
    'Kindness',
    'Social Intelligence'
  ],
  JUSTICE: [
    'Teamwork',
    'Fairness',
    'Leadership'
  ],
  TEMPERANCE: [
    'Forgiveness',
    'Humility',
    'Prudence',
    'Self-Regulation'
  ]
};

const CATEGORY_COLORS = {
  TRANSCENDENCE: 'from-purple-500 to-pink-500',
  WISDOM: 'from-blue-500 to-cyan-500',
  COURAGE: 'from-red-500 to-orange-500',
  HUMANITY: 'from-green-500 to-emerald-500',
  JUSTICE: 'from-yellow-500 to-amber-500',
  TEMPERANCE: 'from-indigo-500 to-violet-500'
};

const SuperPowersInput: React.FC<SuperPowersInputProps> = ({
  strengths,
  onStrengthsChange,
  maxStrengths = 5
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addStrength(inputValue.trim());
    }
  };

  const addStrength = (strength: string) => {
    if (strength && strengths.length < maxStrengths && !strengths.includes(strength)) {
      onStrengthsChange([...strengths, strength]);
      setInputValue('');
    }
  };

  const removeStrength = (index: number) => {
    onStrengthsChange(strengths.filter((_, i) => i !== index));
  };

  const addFromWheel = (strength: string) => {
    if (strengths.length < maxStrengths && !strengths.includes(strength)) {
      onStrengthsChange([...strengths, strength]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-white border-2 border-gray-200 rounded-xl focus-within:border-vibez-blue transition-colors">
          <AnimatePresence>
            {strengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="relative group"
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white px-4 py-2 rounded-full font-action text-sm">
                  <Sparkles className="w-4 h-4" />
                  {strength}
                  <button
                    onClick={() => removeStrength(index)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${strength}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {strengths.length < maxStrengths && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.trim()) {
                  addStrength(inputValue.trim());
                }
              }}
              placeholder={strengths.length === 0 ? "Type a strength and press Enter..." : ""}
              className="flex-1 min-w-[200px] outline-none text-gray-700 placeholder-gray-400"
            />
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs">Enter</kbd> to add
          </p>
          <p className={`font-action ${strengths.length >= maxStrengths ? 'text-vibez-purple' : 'text-gray-500'}`}>
            {strengths.length} / {maxStrengths}
          </p>
        </div>
      </div>

      {/* Wheel of Character Strengths */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-vibez-blue" />
          <h3 className="font-action text-lg text-gray-900">
            WHEEL OF CHARACTER STRENGTHS
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Click any strength below to add it to your super powers:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(CHARACTER_STRENGTHS).map(([category, categoryStrengths]) => (
            <div key={category} className="space-y-2">
              <h4 className={`font-action text-sm uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]} bg-clip-text text-transparent`}>
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryStrengths.map((charStrength) => {
                  const isSelected = strengths.includes(charStrength);
                  const isDisabled = !isSelected && strengths.length >= maxStrengths;

                  return (
                    <button
                      key={charStrength}
                      onClick={() => !isSelected && !isDisabled && addFromWheel(charStrength)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-vibez-blue to-vibez-purple text-white cursor-default'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-vibez-blue hover:text-vibez-blue hover:shadow-md'
                      }`}
                    >
                      {charStrength}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperPowersInput;
