import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, CardData } from '../types';
import TradingCard from './TradingCard';
import SuperPowersInput from './SuperPowersInput';
import CameraCapture from './CameraCapture';
import { Plus, Sparkles, Camera, Loader2, X, Check, Wand2, PlusCircle, UserCircle, BarChart3, TrendingUp, Users, Award, Trophy, Star } from 'lucide-react';
import Layout from './Layout';
import { storage } from '../services/storage';

interface DashboardProps {
  user: User;
  cards: CardData[];
  savedCards: CardData[];
  activeTab: 'my' | 'saved' | 'stats' | 'personalize';
  onCreateClick: () => void;
  onCardSelect: (card: CardData) => void;
  onSavedCardSelect: (card: CardData) => void;
  onUpdateUser: (user: User) => void;
  onDeleteCard: (id: string) => Promise<void>;
  onToggleVisibility: (id: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  cards,
  savedCards,
  activeTab,
  onCreateClick,
  onCardSelect,
  onSavedCardSelect,
  onUpdateUser,
  onDeleteCard,
  onToggleVisibility,
}) => {

  // Per-field editing state
  const [editingField, setEditingField] = useState<'name' | 'selfie' | 'strengths' | 'story' | null>(null);
  const [editedName, setEditedName] = useState(user.name);
  const [editedSelfie, setEditedSelfie] = useState(user.selfie);
  const [editedStrengths, setEditedStrengths] = useState<string[]>(user.strengths || []);
  const [editedStory, setEditedStory] = useState(user.story || '');
  const [showCamera, setShowCamera] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);

  // Global stats state
  const [globalStats, setGlobalStats] = useState<{
    totalAddsRank: number;
    topCardRank: number;
    totalUsers: number;
    uniqueSavers: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch global stats when Stats tab is active
  useEffect(() => {
    if (activeTab === 'stats' && !globalStats && !loadingStats) {
      setLoadingStats(true);
      storage.getGlobalStats(user.clerkId)
        .then(stats => setGlobalStats(stats))
        .catch(err => console.error('Failed to load global stats:', err))
        .finally(() => setLoadingStats(false));
    }
  }, [activeTab, globalStats, loadingStats, user.clerkId]);

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
      <main className="container mx-auto px-6 py-6">
        {/* Welcome Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-5xl font-action bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple">
            HELLO, {user.name.toUpperCase()}
          </h1>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex border-b border-gray-200">
            <Link
              to="/cards/my"
              className={`flex-1 px-2 sm:px-6 md:px-8 py-3 font-action text-sm sm:text-base md:text-lg transition-all relative flex flex-col items-center justify-center gap-1 ${
                activeTab === 'my'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              CREATED
              {activeTab === 'my' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </Link>
            <Link
              to="/cards/saved"
              className={`flex-1 px-2 sm:px-6 md:px-8 py-3 font-action text-sm sm:text-base md:text-lg transition-all relative flex flex-col items-center justify-center gap-1 ${
                activeTab === 'saved'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              ADDED
              {activeTab === 'saved' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </Link>
            <Link
              to="/stats"
              className={`flex-1 px-2 sm:px-6 md:px-8 py-3 font-action text-sm sm:text-base md:text-lg transition-all relative flex flex-col items-center justify-center gap-1 ${
                activeTab === 'stats'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              STATS
              {activeTab === 'stats' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </Link>
            <Link
              to="/personalize"
              className={`flex-1 px-2 sm:px-6 md:px-8 py-3 font-action text-sm sm:text-base md:text-lg transition-all relative flex flex-col items-center justify-center gap-1 ${
                activeTab === 'personalize'
                  ? 'text-vibez-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              ME
              {activeTab === 'personalize' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-vibez-blue to-vibez-purple" />
              )}
            </Link>
          </div>
        </div>

        {/* My Cards Tab */}
        {activeTab === 'my' && (
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

        {/* Saved Cards Tab */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {savedCards.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="font-action text-2xl text-gray-400 mb-4">NO SAVED CARDS YET</p>
                <p className="font-comic text-lg text-gray-500">
                  Save cards from other users to view them here!
                </p>
              </div>
            ) : (
              savedCards.map((card: CardData) => (
                <div
                  key={card.id}
                  className="w-full max-w-sm cursor-pointer"
                  onClick={() => onSavedCardSelect(card)}
                >
                  <TradingCard
                    card={card}
                    user={user}
                    variant="dashboard"
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (() => {
          // Calculate stats
          const totalCreated = cards.length;
          const deletedCards = cards.filter(c => !c.active).length;
          const activeCards = cards.filter(c => c.active).length;
          const publicCards = cards.filter(c => c.active && c.public).length;
          const cardsAddedByOthers = cards.filter(c => c.active && c.public && c.saveCount > 0).length;
          const totalAdds = cards.reduce((sum, c) => sum + (c.saveCount || 0), 0);

          // Find most popular card
          const mostPopularCard = cards
            .filter(c => c.active && c.public)
            .sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0))[0];

          // Stats about saved cards
          const totalSavedCards = savedCards.filter(c => c.active && c.public).length;
          const mostPopularSavedCard = savedCards
            .filter(c => c.active && c.public)
            .sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0))[0];

          // Theme distribution (bar chart data)
          const themeCount = activeCards > 0 ? cards
            .filter(c => c.active)
            .reduce((acc, card) => {
              acc[card.theme] = (acc[card.theme] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) : {};
          const maxThemeCount = Math.max(...Object.values(themeCount), 1);

          // Hero vs Villain ratio
          const heroCount = cards.filter(c => c.active && c.alignment === 'Hero').length;
          const villainCount = cards.filter(c => c.active && c.alignment === 'Villain').length;
          const heroPercent = activeCards > 0 ? Math.round((heroCount / activeCards) * 100) : 0;
          const villainPercent = activeCards > 0 ? Math.round((villainCount / activeCards) * 100) : 0;

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl md:text-3xl font-action text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple">
                YOUR SUPER STAFFER STATS
              </h2>

              {/* Rankings Box */}
              {globalStats && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 md:p-8 border-2 border-amber-300/40 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-amber-600" />
                    <h3 className="font-action text-xl text-gray-900">RANKINGS</h3>
                  </div>

                  <div className="space-y-4 font-comic text-gray-700">
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p>
                        You rank <span className="font-bold text-amber-600">#{globalStats.totalAddsRank}</span> out of <span className="font-bold text-gray-900">{globalStats.totalUsers}</span> SUPER STAFFERS based on total adds.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p>
                        You rank <span className="font-bold text-amber-600">#{globalStats.topCardRank}</span> out of <span className="font-bold text-gray-900">{globalStats.totalUsers}</span> SUPER STAFFERS based on your most popular card.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p>
                        <span className="font-bold text-amber-600">{globalStats.uniqueSavers}</span> unique {globalStats.uniqueSavers === 1 ? 'person has' : 'people have'} added your cards to their collection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Your Cards Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-vibez-blue/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Wand2 className="w-6 h-6 text-vibez-blue" />
                  <h3 className="font-action text-xl text-gray-900">YOUR CARDS</h3>
                </div>

                <div className="space-y-4 font-comic text-gray-700">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-vibez-purple mt-1 flex-shrink-0" />
                    <p>
                      You have created <span className="font-bold text-vibez-blue">{totalCreated}</span> {totalCreated === 1 ? 'card' : 'cards'}
                      {deletedCards > 0 && <> and deleted <span className="font-bold text-gray-600">{deletedCards}</span> for a total of</>}
                      {' '}<span className="font-bold text-vibez-purple">{activeCards}</span> active {activeCards === 1 ? 'card' : 'cards'}.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-vibez-purple mt-1 flex-shrink-0" />
                    <p>
                      <span className="font-bold text-vibez-blue">{publicCards}</span> of your active {publicCards === 1 ? 'card' : 'cards'} {publicCards === 1 ? 'has' : 'have'} been made public.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-vibez-purple mt-1 flex-shrink-0" />
                    <p>
                      <span className="font-bold text-vibez-blue">{cardsAddedByOthers}</span> of your {cardsAddedByOthers === 1 ? 'card has' : 'cards have'} been added by others
                      for a total of <span className="font-bold text-vibez-purple">{totalAdds}</span> {totalAdds === 1 ? 'add' : 'adds'}.
                    </p>
                  </div>

                  {mostPopularCard && (
                    <div className="flex items-start gap-3 pt-2 border-t border-vibez-blue/20">
                      <Award className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                      <p>
                        Your most popular card is{' '}
                        <button
                          onClick={() => onCardSelect(mostPopularCard)}
                          className="font-bold text-vibez-blue hover:text-vibez-purple underline transition-colors"
                        >
                          {mostPopularCard.theme} {mostPopularCard.alignment}
                        </button>
                        {' '}with <span className="font-bold text-amber-500">{mostPopularCard.saveCount || 0}</span> {(mostPopularCard.saveCount || 0) === 1 ? 'add' : 'adds'}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Distribution & Hero/Villain Ratio */}
              {activeCards > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 md:p-8 border-2 border-green-300/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <h3 className="font-action text-xl text-gray-900">CARD BREAKDOWN</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Hero vs Villain Ratio */}
                    <div>
                      <h4 className="font-action text-sm text-gray-600 mb-3">HERO VS VILLAIN</h4>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs"
                            style={{ width: `${heroPercent}%` }}
                          >
                            {heroPercent > 0 && <span>{heroPercent}%</span>}
                          </div>
                          <div
                            className="bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs"
                            style={{ width: `${villainPercent}%` }}
                          >
                            {villainPercent > 0 && <span>{villainPercent}%</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm font-comic text-gray-600">
                        <span><span className="font-bold text-blue-600">{heroCount}</span> Hero{heroCount !== 1 ? 'es' : ''}</span>
                        <span><span className="font-bold text-red-600">{villainCount}</span> Villain{villainCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Theme Bar Chart */}
                    <div>
                      <h4 className="font-action text-sm text-gray-600 mb-3">THEME DISTRIBUTION</h4>
                      <div className="space-y-2">
                        {Object.entries(themeCount)
                          .sort((a, b) => b[1] - a[1])
                          .map(([theme, count]) => (
                            <div key={theme} className="flex items-center gap-3">
                              <span className="font-comic text-xs text-gray-600 w-32 truncate">{theme}</span>
                              <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-vibez-blue to-vibez-purple flex items-center px-2"
                                  style={{ width: `${(count / maxThemeCount) * 100}%` }}
                                >
                                  <span className="text-white font-bold text-xs">{count}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collected Cards Stats */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-vibez-purple/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <PlusCircle className="w-6 h-6 text-vibez-purple" />
                  <h3 className="font-action text-xl text-gray-900">YOUR COLLECTION</h3>
                </div>

                <div className="space-y-4 font-comic text-gray-700">
                  <div className="flex items-start gap-3">
                    <PlusCircle className="w-5 h-5 text-vibez-purple mt-1 flex-shrink-0" />
                    <p>
                      You have collected <span className="font-bold text-vibez-purple">{totalSavedCards}</span> {totalSavedCards === 1 ? 'card' : 'cards'} from other SUPER STAFFERS.
                    </p>
                  </div>

                  {mostPopularSavedCard && (
                    <div className="flex items-start gap-3 pt-2 border-t border-vibez-purple/20">
                      <Award className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                      <p>
                        The most popular card you've added is{' '}
                        <button
                          onClick={() => onSavedCardSelect(mostPopularSavedCard)}
                          className="font-bold text-vibez-purple hover:text-vibez-blue underline transition-colors"
                        >
                          {mostPopularSavedCard.theme} {mostPopularSavedCard.alignment}
                        </button>
                        {' '}with <span className="font-bold text-amber-500">{mostPopularSavedCard.saveCount || 0}</span> {(mostPopularSavedCard.saveCount || 0) === 1 ? 'add' : 'adds'}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Encouragement Message */}
              <div className="text-center py-6">
                <p className="font-comic text-lg text-gray-600 leading-relaxed">
                  Keep up the great work SUPER STAFFER{' '}
                  <span className="font-bold text-vibez-blue">{user.name}</span>!<br />
                  Continue to create more, share with others, and add to your collection!
                </p>
              </div>
            </div>
          );
        })()}

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
