import React, { useEffect, useState } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { storage } from './services/storage';
import { User, CardData, ThemeName, Alignment } from './types';
import { pendingCardSave } from './utils/pendingCardSave';
import ParallaxHero from './components/ParallaxHero';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CardCreator from './components/CardCreator';
import SingleCardView from './components/SingleCardView';
import LoadingScreen from './components/LoadingScreen';
import Toast from './components/Toast';

/**
 * Public card view at /card/:id
 * Shows public cards with "Add to Collection" button for non-owners
 */
const PublicCardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn, userId } = useAuth();
  const { openSignUp } = useClerk();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [backDestination, setBackDestination] = useState<string>('/');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState(false);
  const [isTogglingCollection, setIsTogglingCollection] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      console.log('[PublicCardView] Loading card:', id, 'isSignedIn:', isSignedIn, 'userId:', userId);

      if (!id) {
        console.log('[PublicCardView] No card ID, returning');
        return;
      }

      try {
        // Performance optimization: Pass viewer's Clerk ID to enable cache-first for owners
        // If viewer owns the card, it will be loaded from cache (60-300x faster)
        // If viewer doesn't own it, it will fetch fresh from cloud to validate public state
        const loadedCard = await storage.getCardById(id, userId || undefined);
        console.log('[PublicCardView] Loaded card:', loadedCard);

        // Card must exist, be active, and be public (or user is owner)
        if (loadedCard && loadedCard.active) {
          console.log('[PublicCardView] Card is active. public:', loadedCard.public, 'ownerClerkId:', loadedCard.ownerClerkId);

          if (loadedCard.public || (isSignedIn && userId === loadedCard.ownerClerkId)) {
            console.log('[PublicCardView] Card passed visibility check, setting card state');
            setCard(loadedCard);

            // Load user data if signed in and card owner
            if (isSignedIn && userId && userId === loadedCard.ownerClerkId) {
              console.log('[PublicCardView] Loading owner user data');
              const userData = await storage.getUser(userId);
              setUser(userData);
            }

            // Check if current user has saved this card
            if (isSignedIn && userId && userId !== loadedCard.ownerClerkId) {
              console.log('[PublicCardView] Checking if card is saved');
              const saved = await storage.checkCardSaved(userId, id);
              setIsSaved(saved);
            }
          } else {
            console.log('[PublicCardView] Card failed visibility check - not public and user is not owner');
          }
        } else {
          console.log('[PublicCardView] Card does not exist or is not active');
        }
      } catch (error) {
        console.error('[PublicCardView] Failed to load card:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id, isSignedIn, userId]);

  // Determine back button destination based on user context
  useEffect(() => {
    const determineBackButton = async () => {
      if (!card) return;

      // Not signed in → back to homepage
      if (!isSignedIn) {
        setBackDestination('/');
        return;
      }

      const isOwner = userId === card.ownerClerkId;

      // Owner viewing own card → back to My Cards
      if (isOwner) {
        setBackDestination('/cards/my');
        return;
      }

      // Non-owner signed in → check if in their collection
      if (userId && id) {
        const saved = await storage.checkCardSaved(userId, id);
        if (saved) {
          // In collection → back to Saved Cards
          setBackDestination('/cards/saved');
        } else {
          // Not in collection → back to homepage
          setBackDestination('/');
        }
      } else {
        setBackDestination('/');
      }
    };

    determineBackButton();
  }, [card, isSignedIn, userId, id]);

  const handleAddToCollection = async () => {
    if (!id || isTogglingCollection) return;

    if (!isSignedIn) {
      // Not signed in - store card ID and trigger sign-up
      pendingCardSave.set(id);
      openSignUp({
        afterSignUpUrl: '/onboarding?saveCard=true',
        redirectUrl: `/card/${id}`,
      });
      return;
    }

    // User is signed in - add to collection
    if (userId) {
      setIsTogglingCollection(true);

      try {
        await storage.saveCardToCollection(userId, id);
        // Update UI only after database confirms success
        setIsSaved(true);
        // No success toast - the button state change is the confirmation

        // Reload card to get updated save count (fetch fresh from cloud - not owner's card)
        const updatedCard = await storage.getCardById(id);
        if (updatedCard) {
          setCard(updatedCard);
        }
      } catch (error) {
        console.error('Failed to save card:', error);
        setToastMessage('Failed to save card. Please try again.');
        setShowToast(true);
      } finally {
        setIsTogglingCollection(false);
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await storage.deleteCard(cardId);
      setToastMessage('Card deleted successfully');
      setShowToast(true);
      // Navigate back to dashboard after delete
      setTimeout(() => navigate('/cards/my'), 1000);
    } catch (error) {
      console.error('Failed to delete card:', error);
      setToastMessage('Failed to delete card. Please try again.');
      setShowToast(true);
    }
  };

  const handleToggleVisibility = async (cardId: string) => {
    if (!card || isTogglingVisibility) return;

    const newPublicValue = !card.public;

    // Show loading state with pending value
    setIsTogglingVisibility(true);
    setPendingVisibility(newPublicValue);

    try {
      await storage.toggleCardVisibility(cardId, newPublicValue);
      // Update UI only after database confirms success
      setCard({ ...card, public: newPublicValue });
      // No success toast - the button state change is the confirmation
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      setToastMessage('Failed to update visibility. Please try again.');
      setShowToast(true);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (!id || !userId || isTogglingCollection) return;

    setIsTogglingCollection(true);

    try {
      await storage.removeCardFromCollection(userId, id);
      // Update UI only after database confirms success
      setIsSaved(false);
      // No success toast - the button state change is the confirmation

      // Reload card to get updated save count
      const updatedCard = await storage.getCardById(id);
      if (updatedCard) {
        setCard(updatedCard);
      }
    } catch (error) {
      console.error('Failed to remove card:', error);
      setToastMessage('Failed to remove card. Please try again.');
      setShowToast(true);
    } finally {
      setIsTogglingCollection(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!card || (!card.public && (!isSignedIn || userId !== card.ownerClerkId))) {
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

  const isOwner = isSignedIn && userId === card.ownerClerkId;

  return (
    <>
      <SingleCardView
        card={card}
        user={user}
        onBack={() => navigate(backDestination)}
        onDelete={handleDeleteCard}
        onToggleVisibility={handleToggleVisibility}
        isOwner={isOwner}
        isSaved={isSaved}
        onAddToCollection={handleAddToCollection}
        onRemoveFromCollection={handleRemoveFromCollection}
        showAddButton={!isOwner}
        isTogglingVisibility={isTogglingVisibility}
        pendingVisibility={pendingVisibility}
        isTogglingCollection={isTogglingCollection}
      />
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

/**
 * Main App Component with React Router
 */
const App: React.FC = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [localUser, setLocalUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [savedCards, setSavedCards] = useState<CardData[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Check Clerk profile and load user data - RUNS ONCE when auth loads
  useEffect(() => {
    const checkProfile = async () => {
      console.log('[App.checkProfile] Running - authLoaded:', authLoaded, 'isSignedIn:', isSignedIn, 'clerkUser:', clerkUser?.id);

      // CRITICAL: Wait for Clerk to fully load before doing ANYTHING
      if (!authLoaded) {
        console.log('[App.checkProfile] Auth not loaded yet, returning early');
        return;
      }

      // Not signed in - clear everything and stop initializing
      if (!isSignedIn || !clerkUser) {
        console.log('[App.checkProfile] User not signed in, clearing state');
        setHasProfile(false);
        setLocalUser(null);
        setCards([]);
        setSavedCards([]);
        setInitializing(false);
        return;
      }

      // OPTION 2: Cache validation - check if cached user matches current user (only on load)
      const cachedUserId = sessionStorage.getItem('lastAuthenticatedUserId');
      if (cachedUserId && cachedUserId !== clerkUser.id) {
        console.warn('[App.checkProfile] CACHE VALIDATION FAILED - clearing cache. Cached:', cachedUserId, 'Current:', clerkUser.id);
        await storage.clearAllLocalCache();
        setCards([]);
        setSavedCards([]);
        setLocalUser(null);
      }
      // Store current user ID for next load
      sessionStorage.setItem('lastAuthenticatedUserId', clerkUser.id);

      // Signed in - check for profile
      console.log('[App.checkProfile] User signed in, checking profile for:', clerkUser.id);
      const userData = await storage.getUser(clerkUser.id);

      if (userData) {
        // Existing user with profile
        console.log('[App.checkProfile] User has profile, loading cards');
        setLocalUser(userData);
        setHasProfile(true);

        // Load cards
        console.log('[App.checkProfile] About to call getSavedCards with:', clerkUser.id);
        const [myCards, userSavedCards] = await Promise.all([
          storage.getCards(clerkUser.id),
          storage.getSavedCards(clerkUser.id),
        ]);
        setCards(myCards);
        setSavedCards(userSavedCards);

        // Check for pending card save
        const pendingCardId = pendingCardSave.get();
        if (pendingCardId) {
          try {
            await storage.saveCardToCollection(clerkUser.id, pendingCardId);
            pendingCardSave.clear();

            // Reload saved cards
            const updated = await storage.getSavedCards(clerkUser.id);
            setSavedCards(updated);

            setToastMessage('Card saved to your collection! You can view it in Saved Cards after completing onboarding.');
            setShowToast(true);
          } catch (error) {
            console.error('Failed to save pending card:', error);
          }
        }

        // Redirect to /cards/my if on root
        if (location.pathname === '/') {
          navigate('/cards/my');
        }
      } else {
        // New user without profile - needs onboarding
        setHasProfile(false);

        // Redirect to onboarding if not already there
        if (location.pathname !== '/onboarding') {
          navigate('/onboarding');
        }
      }

      setInitializing(false);
    };

    checkProfile();
  }, [authLoaded, isSignedIn, clerkUser]);

  // OPTION 1: Clear cache on sign-out
  useEffect(() => {
    // Watch for sign-out event
    if (authLoaded && !isSignedIn) {
      const handleSignOut = async () => {
        console.log('[App] User signed out - clearing all local cache');
        await storage.clearAllLocalCache();
        sessionStorage.removeItem('lastAuthenticatedUserId');
        setCards([]);
        setSavedCards([]);
        setLocalUser(null);
        setHasProfile(false);
      };

      handleSignOut();
    }
  }, [authLoaded, isSignedIn]);

  // Reload cards when navigating to dashboard pages
  useEffect(() => {
    const reloadCards = async () => {
      if (!isSignedIn || !clerkUser || !hasProfile) return;

      // Only reload on dashboard pages
      if (location.pathname.startsWith('/cards/') || location.pathname === '/personalize') {
        const [myCards, userSavedCards] = await Promise.all([
          storage.getCards(clerkUser.id),
          storage.getSavedCards(clerkUser.id),
        ]);
        setCards(myCards);
        setSavedCards(userSavedCards);
      }
    };

    reloadCards();
  }, [location.pathname, isSignedIn, clerkUser, hasProfile]);

  const handleOnboardingComplete = async (newUser: User) => {
    if (!clerkUser) return;

    try {
      await storage.saveUser(newUser);
      setLocalUser(newUser);
      setHasProfile(true);

      // Check for pending card save during onboarding
      const pendingCardId = pendingCardSave.get();
      if (pendingCardId) {
        try {
          await storage.saveCardToCollection(clerkUser.id, pendingCardId);
          pendingCardSave.clear();

          // Reload saved cards
          const updated = await storage.getSavedCards(clerkUser.id);
          setSavedCards(updated);

          setToastMessage('Card saved to your collection! You can view it in Saved Cards after completing onboarding.');
          setShowToast(true);
        } catch (error) {
          console.error('Failed to save pending card:', error);
        }
      }

      // Navigate to dashboard after onboarding completes
      navigate('/cards/my');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save profile. Please try again.');
    }
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
      public: false,
      active: true,
      saveCount: 0,
      ownerClerkId: clerkUser.id,
    };

    await storage.saveCard(newCard, clerkUser.id);
    setCards(prev => [...prev, newCard]);

    // Small delay to ensure IndexedDB transaction commits before navigation
    // This prevents race condition where PublicCardView loads before card is queryable
    await new Promise(resolve => setTimeout(resolve, 50));

    // Navigate to single card view
    navigate(`/card/${newCard.id}`);
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await storage.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
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

  const handleToggleVisibility = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newPublicValue = !card.public;

    // Optimistic update
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, public: newPublicValue } : c));

    try {
      await storage.toggleCardVisibility(cardId, newPublicValue);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert on error
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, public: !newPublicValue } : c));
    }
  };

  // Show loading while initializing
  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isSignedIn && hasProfile ? <Navigate to="/cards/my" replace /> : <ParallaxHero onStart={() => navigate('/onboarding')} />
        } />
        <Route path="/card/:id" element={<PublicCardView />} />

        {/* Auth Required Routes */}
        <Route path="/onboarding" element={
          isSignedIn ? (
            hasProfile ? <Navigate to="/cards/my" replace /> : (
              <Onboarding
                onComplete={handleOnboardingComplete}
                onCancel={() => navigate('/')}
              />
            )
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/creator" element={
          isSignedIn && hasProfile && localUser ? (
            <CardCreator
              user={localUser}
              onCancel={() => navigate('/cards/my')}
              onSuccess={handleCardCreated}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/cards/my" element={
          isSignedIn && hasProfile && localUser ? (
            <Dashboard
              user={localUser}
              cards={cards}
              savedCards={savedCards}
              activeTab="my"
              onCreateClick={() => navigate('/creator')}
              onCardSelect={(card) => navigate(`/card/${card.id}`)}
              onSavedCardSelect={(card) => navigate(`/card/${card.id}`)}
              onUpdateUser={handleUpdateUser}
              onDeleteCard={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/cards/saved" element={
          isSignedIn && hasProfile && localUser ? (
            <Dashboard
              user={localUser}
              cards={cards}
              savedCards={savedCards}
              activeTab="saved"
              onCreateClick={() => navigate('/creator')}
              onCardSelect={(card) => navigate(`/card/${card.id}`)}
              onSavedCardSelect={(card) => navigate(`/card/${card.id}`)}
              onUpdateUser={handleUpdateUser}
              onDeleteCard={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/stats" element={
          isSignedIn && hasProfile && localUser ? (
            <Dashboard
              user={localUser}
              cards={cards}
              savedCards={savedCards}
              activeTab="stats"
              onCreateClick={() => navigate('/creator')}
              onCardSelect={(card) => navigate(`/card/${card.id}`)}
              onSavedCardSelect={(card) => navigate(`/card/${card.id}`)}
              onUpdateUser={handleUpdateUser}
              onDeleteCard={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/personalize" element={
          isSignedIn && hasProfile && localUser ? (
            <Dashboard
              user={localUser}
              cards={cards}
              savedCards={savedCards}
              activeTab="personalize"
              onCreateClick={() => navigate('/creator')}
              onCardSelect={(card) => navigate(`/card/${card.id}`)}
              onSavedCardSelect={(card) => navigate(`/card/${card.id}`)}
              onUpdateUser={handleUpdateUser}
              onDeleteCard={handleDeleteCard}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default App;
