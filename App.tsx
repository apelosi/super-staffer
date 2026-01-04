import React, { useEffect, useState } from 'react';
import { storage } from './services/storage';
import { User, CardData, ThemeName, Alignment } from './types';
import ParallaxHero from './components/ParallaxHero';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CardCreator from './components/CardCreator';

type View = 'home' | 'onboarding' | 'dashboard' | 'creator';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);

  // Initial Load
  useEffect(() => {
    const existingUser = storage.getUser();
    if (existingUser) {
      setUser(existingUser);
      setCards(storage.getCards());
      setView('dashboard');
    }
  }, []);

  const handleStart = () => {
    setView('onboarding');
  };

  const handleOnboardingComplete = (newUser: User) => {
    storage.saveUser(newUser);
    setUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    storage.clearUser();
    setUser(null);
    setCards([]);
    setView('home');
  };

  const handleCardCreated = (imageUrl: string, theme: ThemeName, alignment: Alignment) => {
    const newCard: CardData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl,
      theme,
      alignment
    };
    storage.saveCard(newCard);
    setCards(prev => [...prev, newCard]);
    setView('dashboard');
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm("Are you sure you want to delete this card? It will be lost in the multiverse forever.")) {
      storage.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    storage.saveUser(updatedUser);
    setUser(updatedUser);
  };

  // View Routing
  if (view === 'home') {
    return <ParallaxHero onStart={handleStart} />;
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} onCancel={() => setView('home')} />;
  }

  if (view === 'creator' && user) {
    return (
      <CardCreator 
        user={user} 
        onCancel={() => setView('dashboard')} 
        onSuccess={handleCardCreated} 
      />
    );
  }

  if (view === 'dashboard' && user) {
    return (
      <Dashboard 
        user={user} 
        cards={cards}
        onCreateClick={() => setView('creator')}
        onLogout={handleLogout}
        onDeleteCard={handleDeleteCard}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
};

export default App;