import React, { useState } from 'react';
import CameraCapture from './CameraCapture';
import { User } from '../types';
import { ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selfie, setSelfie] = useState('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep(2);
  };

  const handleCapture = (base64: string) => {
    setSelfie(base64);
  };

  const handleFinish = () => {
    if (name && selfie) {
      onComplete({ name, selfie });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-vibez-purple rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-vibez-blue rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12 relative z-10">

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-12 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vibez-blue to-vibez-purple transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <form onSubmit={handleNameSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-5xl md:text-6xl font-action mb-4 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-white">
              WHICH SOUL <br />ARE WE <br />SCANNING?
            </h2>
            <p className="text-blue-200/60 text-lg mb-12 font-comic tracking-wider">ENTER YOUR REAL NAME OR HERO ALIAS.</p>

            <div className="relative group">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TONY STARK"
                className="w-full bg-transparent border-b-4 border-slate-700 focus:border-vibez-blue text-white text-4xl md:text-5xl font-action py-4 outline-none transition-all placeholder:text-slate-800"
              />
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-vibez-blue group-focus-within:w-full transition-all duration-500 shadow-[0_0_15px_rgba(0,180,216,0.5)]" />
            </div>

            <div className="mt-auto pt-12 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                ABANDON
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="group bg-white text-[#0f172a] font-action text-2xl px-10 py-5 rounded-full flex items-center gap-3 hover:bg-vibez-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                NEXT <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-5xl md:text-6xl font-action mb-4 bg-clip-text text-transparent bg-gradient-to-r from-vibez-purple to-white">
              IDENTITY <br />CONFIRMATION
            </h2>
            <p className="text-purple-200/60 text-lg mb-8 font-comic tracking-wider uppercase">WE NEED A SCAN FOR THE ARCHIVES.</p>

            {!selfie ? (
              <div className="flex-1 flex flex-col justify-center">
                <CameraCapture onCapture={handleCapture} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center space-y-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-vibez-blue to-vibez-purple rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative aspect-[3/4] w-64 md:w-80 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                    <img src={selfie} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                  </div>
                </div>

                <div className="flex flex-col w-full max-w-xs gap-4">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-2xl py-6 rounded-2xl shadow-[0_10px_20px_rgba(114,9,183,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    LEGALIZE ACCOUNT
                  </button>
                  <button
                    onClick={() => setSelfie('')}
                    className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
                  >
                    RETAKE SCAN
                  </button>
                </div>
              </div>
            )}

            {!selfie && (
              <button
                onClick={() => setStep(1)}
                className="mt-8 py-2 text-slate-500 font-bold uppercase tracking-widest text-sm hover:text-slate-300 self-center"
              >
                GO BACK TO NAME
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;