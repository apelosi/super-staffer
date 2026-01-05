import React, { useState } from 'react';
import { User, CardData } from '../types';
import TradingCard from './TradingCard';
import SuperPowersInput from './SuperPowersInput';
import CameraCapture from './CameraCapture';
import { Plus, Sparkles, Edit2, Check, X, Camera, Loader2 } from 'lucide-react';
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

  // Personalize tab state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedSelfie, setEditedSelfie] = useState(user.selfie);
  const [editedStrengths, setEditedStrengths] = useState<string[]>(user.strengths || []);
  const [editedStory, setEditedStory] = useState(user.story || '');
  const [showCamera, setShowCamera] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditedName(user.name);
    setEditedSelfie(user.selfie);
    setEditedStrengths(user.strengths || []);
    setEditedStory(user.story || '');
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setEditedSelfie(user.selfie);
    setEditedStrengths(user.strengths || []);
    setEditedStory(user.story || '');
    setIsEditingProfile(false);
    setShowCamera(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser: User = {
        ...user,
        name: editedName,
        selfie: editedSelfie,
        strengths: editedStrengths,
        story: editedStory.trim() || undefined,
      };
      await onUpdateUser(updatedUser);
      setIsEditingProfile(false);
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCaptureNewSelfie = (base64: string) => {
    setEditedSelfie(base64);
    setShowCamera(false);
  };

  return (
    <Layout>
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-action mb-4 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple">
            WELCOME, {user.name.toUpperCase()}
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
            {/* Edit Controls */}
            <div className="flex justify-end">
              {!isEditingProfile ? (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white rounded-lg hover:shadow-lg transition-all font-action"
                >
                  <Edit2 className="w-5 h-5" />
                  EDIT PROFILE
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-action disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white rounded-lg hover:shadow-lg transition-all font-action disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        SAVING...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        SAVE CHANGES
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Name Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">NAME</h3>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-vibez-blue focus:outline-none text-gray-700 font-comic text-lg transition-colors"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-2xl font-action text-gray-900">{user.name}</p>
              )}
            </div>

            {/* Selfie Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">SELFIE</h3>
              {isEditingProfile && showCamera ? (
                <div className="space-y-4">
                  <CameraCapture onCapture={handleCaptureNewSelfie} />
                  <button
                    onClick={() => setShowCamera(false)}
                    className="w-full py-3 text-gray-600 font-action hover:text-gray-800 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative aspect-[3/4] w-48 rounded-2xl overflow-hidden border-4 border-gray-200 shadow-lg">
                    <img src={isEditingProfile ? editedSelfie : user.selfie} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {isEditingProfile && (
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-vibez-blue text-vibez-blue rounded-lg hover:bg-vibez-blue hover:text-white transition-all font-action"
                    >
                      <Camera className="w-5 h-5" />
                      UPDATE SELFIE
                    </button>
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

              {isEditingProfile ? (
                <SuperPowersInput
                  strengths={editedStrengths}
                  onStrengthsChange={setEditedStrengths}
                  maxStrengths={5}
                />
              ) : (
                <div>
                  {user.strengths && user.strengths.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {user.strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white px-4 py-2 rounded-full font-action text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          {strength}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 font-comic italic">
                      No super powers added yet. Click EDIT PROFILE to add your character strengths!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Origin Story Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="font-action text-xl text-gray-900 mb-4">ORIGIN STORY</h3>
              {isEditingProfile ? (
                <div className="space-y-2">
                  <textarea
                    value={editedStory}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 144) {
                        setEditedStory(value);
                      }
                    }}
                    placeholder="How did you come to join forces with your colleagues and what is your role?"
                    className="w-full h-32 p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-vibez-blue focus:outline-none resize-none text-gray-700 font-comic text-lg transition-colors"
                    maxLength={144}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Maximum 144 characters</span>
                    <span className={`font-action text-sm ${editedStory.length >= 144 ? 'text-vibez-purple' : 'text-gray-500'}`}>
                      {editedStory.length} / 144
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  {user.story && user.story.trim() ? (
                    <p className="text-gray-700 font-comic text-lg leading-relaxed">{user.story}</p>
                  ) : (
                    <p className="text-gray-400 font-comic italic">
                      No origin story added yet. Click EDIT PROFILE to share your story!
                    </p>
                  )}
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
