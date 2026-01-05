import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import CameraCapture from './CameraCapture';
import SuperPowersInput from './SuperPowersInput';
import { User } from '../types';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const { user: clerkUser } = useUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [selfie, setSelfie] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [story, setStory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep(2);
  };

  const handleCapture = (base64: string) => {
    setSelfie(base64);
  };

  const handleSelfieConfirm = () => {
    setStep(3);
  };

  const handleSkipStrengths = () => {
    setStep(4);
  };

  const handleSkipStory = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    if (!name || !selfie || !clerkUser) return;

    setIsUploading(true);
    try {
      // Create user object with Clerk ID, selfie, strengths, and story
      const user: User = {
        clerkId: clerkUser.id,
        name,
        selfie: selfie, // Store base64 directly
        strengths: strengths.length > 0 ? strengths : undefined,
        story: story.trim() || undefined,
      };

      onComplete(user);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-vibez-purple rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-vibez-blue rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-8 py-16 relative z-10">

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-16 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-vibez-blue to-vibez-purple transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <form onSubmit={handleNameSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl md:text-5xl font-action mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple leading-tight">
              WHO MIGHT YOU BE?
            </h2>
            <p className="text-gray-600 text-xl mb-16 font-comic tracking-wide">Enter your real name or alias.</p>

            <div className="relative group mb-8">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tony Stark"
                className="w-full bg-white border-b-4 border-gray-200 focus:border-vibez-blue text-gray-900 text-4xl md:text-5xl font-action py-6 outline-none transition-all placeholder:text-gray-300 shadow-sm"
              />
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-vibez-blue group-focus-within:w-full transition-all duration-500 shadow-[0_0_15px_rgba(0,180,216,0.3)]" />
            </div>

            <div className="mt-auto pt-16 flex items-center justify-end">
              <button
                type="submit"
                disabled={!name.trim()}
                className="group bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-2xl px-12 py-6 rounded-full flex items-center gap-3 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                NEXT <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl md:text-5xl font-action mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vibez-purple to-vibez-blue leading-tight">
              PHOTO CONFIRMATION
            </h2>
            <p className="text-gray-600 text-xl mb-12 font-comic tracking-wide">We need a selfie to generate your digital card.</p>

            {!selfie ? (
              <div className="flex-1 flex flex-col justify-center">
                <CameraCapture onCapture={handleCapture} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center space-y-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-vibez-blue to-vibez-purple rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-72 md:w-96 rounded-3xl overflow-hidden border-4 border-gray-200 shadow-2xl">
                    <img src={selfie} alt="Captured" className="w-full h-auto object-contain" />
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md">
                  <button
                    onClick={() => setSelfie('')}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-action text-xl py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSelfieConfirm}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-action text-xl py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    CONFIRM
                  </button>
                </div>
              </div>
            )}

            {!selfie && (
              <div className="mt-10">
                <button
                  onClick={() => setStep(1)}
                  className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl md:text-5xl font-action mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple leading-tight">
              SUPER POWERS
            </h2>
            <p className="text-gray-600 text-xl mb-12 font-comic tracking-wide">
              Tell us the top Super Powers that make you an incredible Super Staffer. You can skip for now or specify up to 5.
            </p>

            <div className="flex-1 overflow-y-auto mb-8">
              <SuperPowersInput
                strengths={strengths}
                onStrengthsChange={setStrengths}
                maxStrengths={5}
              />
            </div>

            <div className="pt-8 flex gap-4 items-center">
              <button
                onClick={() => setStep(2)}
                className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleSkipStrengths}
                disabled={isUploading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-action text-xl py-5 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-400 transition-all disabled:opacity-50"
              >
                SKIP
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl md:text-5xl font-action mb-6 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple leading-tight">
              ORIGIN STORY
            </h2>
            <p className="text-gray-600 text-xl mb-8 font-comic tracking-wide">
              How did you come to join forces with your colleagues and what is your role?
            </p>

            <div className="flex-1 mb-8">
              <textarea
                value={story}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 256) {
                    setStory(value);
                  }
                }}
                placeholder="Tell your origin story..."
                className="w-full h-48 p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-vibez-blue focus:outline-none resize-none text-gray-700 font-comic text-lg transition-colors"
                maxLength={256}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">Maximum 256 characters</span>
                <span className={`font-action text-sm ${story.length >= 256 ? 'text-vibez-purple' : 'text-gray-500'}`}>
                  {story.length} / 256
                </span>
              </div>
            </div>

            <div className="pt-8 flex gap-4 items-center">
              <button
                onClick={() => setStep(3)}
                className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleSkipStory}
                disabled={isUploading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-action text-xl py-5 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-400 transition-all disabled:opacity-50"
              >
                SKIP
              </button>
              <button
                onClick={handleFinish}
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
                    SAVING...
                  </>
                ) : (
                  'NEXT'
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;