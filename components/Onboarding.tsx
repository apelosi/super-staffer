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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        
        {/* Progress Dots */}
        <div className="flex gap-2 justify-center mb-8">
          <div className={`w-3 h-3 rounded-full transition-colors ${step === 1 ? 'bg-vibez-blue' : 'bg-slate-600'}`} />
          <div className={`w-3 h-3 rounded-full transition-colors ${step === 2 ? 'bg-vibez-blue' : 'bg-slate-600'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleNameSubmit} className="animate-in fade-in slide-in-from-right-8">
            <h2 className="text-3xl font-action text-white mb-2 text-center">Who are you?</h2>
            <p className="text-slate-400 text-center mb-8">Enter your real name or superhero alias.</p>
            
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tony Stark"
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-vibez-blue text-white text-xl p-4 rounded-xl outline-none transition-colors mb-6 text-center"
            />
            
            <div className="flex gap-4">
               <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 py-4 text-slate-400 font-bold hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-[2] bg-vibez-blue disabled:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-600 transition disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8">
            <h2 className="text-3xl font-action text-white mb-2 text-center">Identify Yourself</h2>
            <p className="text-slate-400 text-center mb-6">We need a scan for the archives.</p>

            {!selfie ? (
              <CameraCapture onCapture={handleCapture} />
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-4 border-vibez-purple mx-auto max-w-[200px]">
                  <img src={selfie} alt="Captured" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelfie('')}
                    className="flex-1 py-3 border border-slate-600 rounded-xl text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={handleFinish}
                    className="flex-[2] bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
            
            {!selfie && (
              <button 
                onClick={() => setStep(1)}
                className="w-full mt-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-400"
              >
                Back to Name
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;