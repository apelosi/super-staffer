import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { storage } from './services/storage';
import { User, CardData, ThemeName, Alignment } from './types';
import ParallaxHero from './components/ParallaxHero';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CardCreator from './components/CardCreator';
import SingleCardView from './components/SingleCardView';
import LoadingScreen from './components/LoadingScreen';

type View = 'home' | 'onboarding' | 'dashboard' | 'creator' | 'single-card';

const PublicCardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;

      try {
        const loadedCard = await storage.getCardById(id);
        if (loadedCard && loadedCard.isPublic) {
          setCard(loadedCard);
        }
      } catch (error) {
        console.error('Failed to load card:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-action text-4xl text-gray-900 mb-4">CARD NOT FOUND</h1>
          <p className="font-comic text-xl text-gray-600 mb-8">
            This card is either private or doesn't exist.
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl px-8 py-4 rounded-full hover:shadow-xl transition-all"
          >
            GO HOME
          </a>
        </div>
      </div>
    );
  }

  return (
    <SingleCardView
      card={card}
      onBack={() => window.location.href = '/'}
      onDelete={() => {}}
      onToggleVisibility={() => {}}
      isOwner={false}
    />
  );
};

const App: React.FC = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  const [view, setView] = useState<View | null>(null); // null = initializing
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Check Clerk profile and load user data - RUNS ONCE when auth loads
  useEffect(() => {
    const checkProfile = async () => {
      if (!authLoaded) return;

      // Not signed in - show home page
      if (!isSignedIn || !clerkUser) {
        setHasProfile(false);
        setLocalUser(null);
        setCards([]);
        setView('home');
        return;
      }

      // Signed in - check for profile (keep view as null until we know)
      const userData = await storage.getUser(clerkUser.id);

      if (userData) {
        // Existing user with profile - go straight to dashboard
        setLocalUser(userData);
        setHasProfile(true);
        const loadedCards = await storage.getCards(clerkUser.id);
        setCards(loadedCards);
        setView('dashboard');
      } else {
        // New user without profile - go straight to onboarding
        setHasProfile(false);
        setView('onboarding');
      }
    };

    checkProfile();
  }, [authLoaded, isSignedIn, clerkUser]);

  const handleStart = () => {
    setView('onboarding');
  };

  const handleOnboardingComplete = async (newUser: User) => {
    if (!clerkUser) return;

    try {
      await storage.saveUser(newUser);
      setLocalUser(newUser);
      setHasProfile(true);
      setView('creator');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    // Clerk handles sign out via UserButton component
    // Just clear local state
    setLocalUser(null);
    setCards([]);
    setHasProfile(false);
    setView('home');
  };

  const handleCardCreated = async (imageUrl: string, theme: ThemeName, alignment: Alignment) => {
    if (!clerkUser || !localUser) return;

    const newCard: CardData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl,
      theme,
      alignment,
      userName: localUser.name,
      isPublic: false, // Default to private
    };
    await storage.saveCard(newCard, clerkUser.id);
    setCards(prev => [...prev, newCard]);
    setSelectedCard(newCard);
    setView('single-card');
  };

  const handleDeleteCard = async (id: string) => {
    console.log('App.handleDeleteCard called for id:', id);
    try {
      await storage.deleteCard(id);
      console.log('Storage.deleteCard completed for id:', id);
      setCards(prev => prev.filter(c => c.id !== id));
      console.log('Cards state updated, card removed from UI');
    } catch (error) {
      console.error('Error in handleDeleteCard:', error);
      throw error; // Re-throw so Dashboard can handle it
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    if (!clerkUser) return;

    try {
      await storage.saveUser(updatedUser);
      setLocalUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCardSelect = (card: CardData) => {
    setSelectedCard(card);
    setView('single-card');
  };

  const handleToggleVisibility = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newIsPublic = !card.isPublic;

    // Optimistic update
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isPublic: newIsPublic } : c));
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard({ ...selectedCard, isPublic: newIsPublic });
    }

    try {
      await storage.toggleCardVisibility(cardId, newIsPublic);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert on error
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, isPublic: !newIsPublic } : c));
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard({ ...selectedCard, isPublic: !newIsPublic });
      }
    }
  };

  // View Routing
  // Show loading ONLY while initializing (view is null)
  if (view === null) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public card view route */}
      <Route path="/card/:id" element={<PublicCardView />} />

      {/* Main app routes */}
      <Route path="*" element={
        <>
          {view === 'home' && <ParallaxHero onStart={handleStart} />}

          {view === 'onboarding' && (
            <Onboarding
              onComplete={handleOnboardingComplete}
              onCancel={() => setView('home')}
            />
          )}

          {view === 'creator' && localUser && (
            <CardCreator
              user={localUser}
              onCancel={() => setView('dashboard')}
              onSuccess={handleCardCreated}
            />
          )}

          {view === 'dashboard' && localUser && (
            <Dashboard
              user={localUser}
              cards={cards}
              onCreateClick={() => setView('creator')}
              onLogout={handleLogout}
              onCardSelect={handleCardSelect}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {view === 'single-card' && selectedCard && localUser && (
            <SingleCardView
              card={selectedCard}
              user={localUser}
              onBack={() => setView('dashboard')}
              onDelete={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
              isOwner={true}
            />
          )}
        </>
      } />
    </Routes>
  );
};

export default App;