import React, { useState } from 'react';
import { User, CardData } from '../types';
import TradingCard from './TradingCard';
import SuperPowersInput from './SuperPowersInput';
import CameraCapture from './CameraCapture';
import { Plus, Sparkles, Camera, Loader2, X, Check } from 'lucide-react';
import Layout from './Layout';

interface DashboardProps {
  user: User;
  cards: CardData[];
  onCreateClick: () => void;
  onLogout: () => void;
  onCardSelect: (card: CardData) => void;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  cards,
  onCreateClick,
  onCardSelect,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'personalize'>('collection');

  // Per-field editing state
  const [editingField, setEditingField] = useState<'name' | 'selfie' | 'strengths' | 'story' | null>(null);
  const [editedName, setEditedName] = useState(user.name);
  const [editedSelfie, setEditedSelfie] = useState(user.selfie);
  const [editedStrengths, setEditedStrengths] = useState<string[]>(user.strengths || []);
  const [editedStory, setEditedStory] = useState(user.story || '');
  const [showCamera, setShowCamera] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);

  const handleCancelField = (field: 'name' | 'selfie' | 'strengths' | 'story') => {
    if (field === 'name') setEditedName(user.name);
    if (field === 'selfie') {
      setEditedSelfie(user.selfie);
      setShowCamera(false);
    }
    if (field === 'strengths') setEditedStrengths(user.strengths || []);
    if (field === 'story') setEditedStory(user.story || '');
    setEditingField(null);
  };

  const handleSaveField = async (field: 'name' | 'selfie' | 'strengths' | 'story') => {
    setSavingField(field);
    try {
      const updatedUser: User = { ...user };
      if (field === 'name') updatedUser.name = editedName;
      if (field === 'selfie') updatedUser.selfie = editedSelfie;
      if (field === 'strengths') updatedUser.strengths = editedStrengths.length > 0 ? editedStrengths : undefined;
      if (field === 'story') updatedUser.story = editedStory.trim() || undefined;

      await onUpdateUser(updatedUser);
      setEditingField(null);
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to update field:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSavingField(null);
    }
  };

  const handleCaptureNewSelfie = (base64: string) => {
    setEditedSelfie(base64);
    setShowCamera(false);
  };

  const hasNameChanged = editedName !== user.name;
  const hasSelfieChanged = editedSelfie !== user.selfie;
  const hasStrengthsChanged = JSON.stringify(editedStrengths) !== JSON.stringify(user.strengths || []);
  const hasStoryChanged = editedStory !== (user.story || '');

  return (
    <Layout>
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-action mb-4 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple">
            HELLO, {user.name.toUpperCase()}
          </h1>
          <p className="text-gray-600 text-lg font-comic">
            {cards.length === 0
              ? "You have not created a Super Staffer card yet, time to execute your first mission and create one!"
              : `You have ${cards.length} personalized Super Staffer card${cards.length === 1 ? '' : 's'} in your collection. Create more and share your favorites!`
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-8 py-4 font-action text-lg transition-all relative ${
                activeTab === 'collection'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              COLLECTION
              {activeTab === 'collection' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('personalize')}
              className={`px-8 py-4 font-action text-lg transition-all relative ${
                activeTab === 'personalize'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PERSONALIZE
              {activeTab === 'personalize' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </button>
          </div>
        </div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {/* Create New Card Button */}
            <button
              onClick={onCreateClick}
              className="w-full max-w-sm aspect-[2.5/3.5] rounded-3xl border-4 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 hover:text-vibez-blue hover:border-vibez-blue hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all group shadow-sm hover:shadow-lg"
            >
              <div className="p-5 rounded-full bg-gray-100 group-hover:bg-vibez-blue/10 mb-5 transition-colors">
                <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-action text-xl">CREATE NEW CARD</span>
            </button>

            {/* Existing Cards */}
            {cards.map((card: CardData) => (
              <div
                key={card.id}
                className="w-full max-w-sm cursor-pointer"
                onClick={() => onCardSelect(card)}
              >
                <TradingCard
                  card={card}
                  user={user}
                  variant="dashboard"
                />
              </div>
            ))}
          </div>
        )}

        {/* Personalize Tab */}
        {activeTab === 'personalize' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Name Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">NAME</h3>
              <input
                type="text"
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                  if (editingField !== 'name') setEditingField('name');
                }}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-vibez-blue focus:outline-none text-gray-700 font-comic text-lg transition-colors"
                placeholder="Your name"
              />
              {hasNameChanged && editingField === 'name' && (
                <div className="flex gap-3 mt-4 justify-end">
                  <button
                    onClick={() => handleCancelField('name')}
                    disabled={savingField === 'name'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleSaveField('name')}
                    disabled={savingField === 'name'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    {savingField === 'name' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    SAVE
                  </button>
                </div>
              )}
            </div>

            {/* Selfie Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">SELFIE</h3>
              {showCamera ? (
                <div className="space-y-4">
                  <CameraCapture onCapture={handleCaptureNewSelfie} />
                  <button
                    onClick={() => {
                      setShowCamera(false);
                      handleCancelField('selfie');
                    }}
                    className="w-full py-3 text-gray-600 font-action hover:text-gray-800 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-48 rounded-2xl overflow-hidden border-4 border-gray-200 shadow-lg">
                      <img src={editedSelfie} alt="Profile" className="w-full h-auto object-contain" />
                    </div>
                    <button
                      onClick={() => {
                        setShowCamera(true);
                        if (editingField !== 'selfie') setEditingField('selfie');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-vibez-blue text-vibez-blue rounded-lg hover:bg-vibez-blue hover:text-white transition-all font-action"
                    >
                      <Camera className="w-5 h-5" />
                      UPDATE SELFIE
                    </button>
                  </div>
                  {hasSelfieChanged && editingField === 'selfie' && (
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleCancelField('selfie')}
                        disabled={savingField === 'selfie'}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                        CANCEL
                      </button>
                      <button
                        onClick={() => handleSaveField('selfie')}
                        disabled={savingField === 'selfie'}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                      >
                        {savingField === 'selfie' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        SAVE
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Super Powers Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-vibez-blue" />
                <h3 className="font-action text-xl text-gray-900">SUPER POWERS</h3>
              </div>

              <SuperPowersInput
                strengths={editedStrengths}
                onStrengthsChange={(newStrengths) => {
                  setEditedStrengths(newStrengths);
                  if (editingField !== 'strengths') setEditingField('strengths');
                }}
                maxStrengths={5}
              />

              {hasStrengthsChanged && editingField === 'strengths' && (
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => handleCancelField('strengths')}
                    disabled={savingField === 'strengths'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleSaveField('strengths')}
                    disabled={savingField === 'strengths'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    {savingField === 'strengths' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    SAVE
                  </button>
                </div>
              )}
            </div>

            {/* Origin Story Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">ORIGIN STORY</h3>
              <div className="space-y-2">
                <textarea
                  value={editedStory}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 256) {
                      setEditedStory(value);
                      if (editingField !== 'story') setEditingField('story');
                    }
                  }}
                  placeholder="How did you come to join forces with your colleagues and what is your role?"
                  className="w-full h-32 p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-vibez-blue focus:outline-none resize-none text-gray-700 font-comic text-lg transition-colors"
                  maxLength={256}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Maximum 256 characters</span>
                  <span className={`font-action text-sm ${editedStory.length >= 256 ? 'text-vibez-purple' : 'text-gray-500'}`}>
                    {editedStory.length} / 256
                  </span>
                </div>
              </div>

              {hasStoryChanged && editingField === 'story' && (
                <div className="flex gap-3 mt-4 justify-end">
                  <button
                    onClick={() => handleCancelField('story')}
                    disabled={savingField === 'story'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleSaveField('story')}
                    disabled={savingField === 'story'}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    {savingField === 'story' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    SAVE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Dashboard;
