import React, { useState } from 'react';
import { User, CardData } from '../types';
import TradingCard from './TradingCard';
import { Plus, Settings, LogOut, Edit2 } from 'lucide-react';
import CameraCapture from './CameraCapture';

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
  onLogout, 
  onDeleteCard,
  onUpdateUser
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleSaveProfile = () => {
    onUpdateUser({ ...user, name: editName });
    setIsEditingProfile(false);
  };

  const handleUpdateSelfie = (newSelfie: string) => {
    onUpdateUser({ ...user, selfie: newSelfie });
    setIsCameraOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex justify-between items-center">
        <div className="font-action text-xl text-transparent bg-clip-text bg-gradient-to-r from-vibez-blue to-vibez-purple">
          SUPER STAFFERS
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsEditingProfile(!isEditingProfile)}
             className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
           >
             <Settings className="w-5 h-5" />
           </button>
           <button 
             onClick={onLogout}
             className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Profile Edit Modal / Section */}
      {isEditingProfile && (
        <div className="max-w-md mx-auto mt-4 p-4 bg-slate-800 mx-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-white font-bold mb-4">Edit Profile</h3>
          
          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase font-bold">Name</label>
            <input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white mt-1"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Selfie</label>
            <div className="flex items-center gap-4">
               <img src={user.selfie} alt="Current" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
               <button 
                 onClick={() => setIsCameraOpen(true)}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg text-sm text-white hover:bg-slate-600"
               >
                 <Edit2 className="w-4 h-4" /> Change Selfie
               </button>
            </div>
            {isCameraOpen && (
              <div className="mt-4">
                <CameraCapture onCapture={handleUpdateSelfie} />
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveProfile}
            className="w-full py-3 bg-vibez-blue text-white font-bold rounded-lg hover:bg-cyan-600"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Welcome Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-slate-400">
            {cards.length === 0 ? "You haven't created any cards yet." : `You have ${cards.length} trading card${cards.length === 1 ? '' : 's'}.`}
          </p>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          
          {/* Create New Card Button (First item in grid) */}
          <button 
            onClick={onCreateClick}
            className="w-full max-w-sm aspect-[2.5/3.5] rounded-xl border-4 border-dashed border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center text-slate-500 hover:text-vibez-blue hover:border-vibez-blue hover:bg-slate-800 transition-all group"
          >
            <div className="p-4 rounded-full bg-slate-700 group-hover:bg-vibez-blue/20 mb-4 transition-colors">
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-action text-xl">CREATE NEW CARD</span>
          </button>

          {/* Existing Cards */}
          {cards.map(card => (
            <TradingCard 
              key={card.id} 
              card={card} 
              user={user} 
              onDelete={onDeleteCard} 
            />
          ))}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;