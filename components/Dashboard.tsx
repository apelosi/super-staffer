import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { User, CardData } from '../types';
import TradingCard from './TradingCard';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { storage } from '../services/storage';

import Header from './Header';
import Footer from './Footer';

interface DashboardProps {
  user: User;
  cards: CardData[];
  onCreateClick: () => void;
  onLogout: () => void;
  onDeleteCard: (id: string) => void;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  cards,
  onCreateClick,
  onDeleteCard,
}) => {
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [localCards, setLocalCards] = useState(cards);

  // Sync localCards when cards prop changes
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  const handleDeleteRequest = (id: string) => {
    setCardToDelete(id);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      try {
        console.log('Deleting card:', cardToDelete);
        await onDeleteCard(cardToDelete);
        console.log('Card deleted successfully');
        setCardToDelete(null);
      } catch (error) {
        console.error('Failed to delete card:', error);
        alert('Failed to delete card. Please try again.');
      }
    }
  };

  const handleToggleVisibility = async (cardId: string) => {
    const card = localCards.find((c: CardData) => c.id === cardId);
    if (!card) return;

    const newIsPublic = !card.isPublic;

    // Optimistic update
    setLocalCards((prev: CardData[]) =>
      prev.map((c: CardData) => c.id === cardId ? { ...c, isPublic: newIsPublic } : c)
    );

    try {
      await storage.toggleCardVisibility(cardId, newIsPublic);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert on error
      setLocalCards((prev: CardData[]) =>
        prev.map((c: CardData) => c.id === cardId ? { ...c, isPublic: !newIsPublic } : c)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Header actions={
        <div className="flex gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
                userButtonPopoverCard: 'bg-white border border-gray-200 shadow-lg',
                userButtonPopoverActionButton: 'text-gray-700 hover:bg-gray-100',
              },
            }}
          />
        </div>
      } />

      <main className="flex-1 pt-24">

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">

          {/* Welcome Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-action mb-4 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple">
              WELCOME, {user.name.toUpperCase()}
            </h1>
            <p className="text-gray-600 text-lg font-comic">
              {cards.length === 0 ? "You haven't created any cards yet." : `You have ${cards.length} trading card${cards.length === 1 ? '' : 's'}.`}
            </p>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">

            {/* Create New Card Button (First item in grid) */}
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
            {localCards.map((card: CardData) => (
              <div key={card.id} className="relative w-full max-w-sm">
                <TradingCard
                  card={card}
                  user={user}
                  onDelete={handleDeleteRequest}
                />
                {/* Public/Private Toggle */}
                <button
                  onClick={() => handleToggleVisibility(card.id)}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full border-2 border-gray-200 hover:border-vibez-blue text-gray-600 transition-all group z-10 shadow-lg"
                  title={card.isPublic ? 'Public - Click to make private' : 'Private - Click to make public'}
                >
                  {card.isPublic ? (
                    <Eye className="w-5 h-5 text-vibez-blue" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-vibez-blue" />
                  )}
                </button>
              </div>
            ))}

          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Modal */}
      {
        cardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-3xl font-action mb-4 text-center text-red-600 tracking-wide">DESTROY CARD?</h3>
              <p className="text-gray-600 text-center mb-10 text-lg">
                Are you sure you want to destroy this card? It will be lost in the multiverse forever.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCardToDelete(null)}
                  className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-300 transition shadow-sm"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  DESTROY
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;