import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { storage } from './services/storage';
import { User, CardData, ThemeName, Alignment } from './types';
import ParallaxHero from './components/ParallaxHero';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CardCreator from './components/CardCreator';
import LoadingScreen from './components/LoadingScreen';

type View = 'home' | 'onboarding' | 'dashboard' | 'creator';

const App: React.FC = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const [view, setView] = useState<View | null>(null); // null = initializing
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [hasProfile, setHasProfile] = useState(false);

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
    setView('dashboard');
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

  // View Routing
  // Show loading ONLY while initializing (view is null)
  if (view === null) {
    return <LoadingScreen />;
  }

  if (view === 'home') {
    return <ParallaxHero onStart={handleStart} />;
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} onCancel={() => setView('home')} />;
  }

  if (view === 'creator' && localUser) {
    return (
      <CardCreator
        user={localUser}
        onCancel={() => setView('dashboard')}
        onSuccess={handleCardCreated}
      />
    );
  }

  if (view === 'dashboard' && localUser) {
    return (
      <Dashboard
        user={localUser}
        cards={cards}
        onCreateClick={() => setView('creator')}
        onLogout={handleLogout}
        onDeleteCard={handleDeleteCard}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  return <div className="min-h-screen bg-white" />;
};

export default App;