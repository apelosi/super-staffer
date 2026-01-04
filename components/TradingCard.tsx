import React, { useRef, useState } from 'react';
import { CardData, User } from '../types';
import { Download, Trash2, Share2, Loader2 } from 'lucide-react';
import { VIBEZ_LOGO_SVG } from '../constants';

interface TradingCardProps {
  card: CardData;
  user: User;
  onDelete?: (id: string) => void;
  variant?: 'preview' | 'full';
}

const TradingCard: React.FC<TradingCardProps> = ({ card, user, onDelete, variant = 'full' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to compose the card onto a canvas and download it
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card dimensions (High res for print quality)
      const width = 750;
      const height = 1050; // 2.5 x 3.5 aspect roughly
      canvas.width = width;
      canvas.height = height;

      // 1. Fill Background (Black/Space)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 2. Load Main Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = card.imageUrl;
      });

      // Draw Main Image (Covering the card area)
      // Maintain aspect ratio, crop if needed
      const imgRatio = img.width / img.height;
      const cardRatio = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgRatio > cardRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetY = 0;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // 3. Draw Border Frame (Marvel Series III style - simplistic representation)
      // Inner Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // 4. Text Overlays
      
      // Top Left: Name
      ctx.font = '900 60px "Arial Black", Gadget, sans-serif';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.strokeText(user.name.toUpperCase(), 40, 90);
      ctx.fillText(user.name.toUpperCase(), 40, 90);

      // Top Right: SUPER STAFFERS
      ctx.font = 'italic 900 36px "Arial", sans-serif';
      ctx.fillStyle = '#FFD700'; // Gold
      ctx.textAlign = 'right';
      ctx.strokeText("SUPER STAFFERS", width - 40, 80);
      ctx.fillText("SUPER STAFFERS", width - 40, 80);
      ctx.textAlign = 'left'; // Reset

      // Bottom Left: Theme
      ctx.font = 'bold 40px "Arial", sans-serif';
      ctx.fillStyle = '#00B4D8';
      ctx.strokeText(card.theme.toUpperCase(), 40, height - 50);
      ctx.fillText(card.theme.toUpperCase(), 40, height - 50);

      // 5. Draw Logo (Bottom Right)
      // Since we can't easily draw the SVG onto canvas without converting to Image,
      // We will draw a simplified "V" shape manually.
      const logoSize = 100;
      const lx = width - 40 - logoSize;
      const ly = height - 40 - logoSize;

      // Gradient for V
      const gradient = ctx.createLinearGradient(lx, ly, lx + logoSize, ly + logoSize);
      gradient.addColorStop(0, '#00B4D8');
      gradient.addColorStop(1, '#7209B7');
      
      ctx.beginPath();
      ctx.moveTo(lx + 20, ly + 20);
      ctx.lineTo(lx + 50, ly + 80);
      ctx.lineTo(lx + 80, ly + 20);
      ctx.lineWidth = 15;
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SuperStaffer-${user.name}-${card.theme}.png`;
      link.href = dataUrl;
      link.click();

    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to generate download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`relative group ${variant === 'preview' ? 'w-full max-w-xs' : 'w-full max-w-sm'} mx-auto`}>
      {/* Card Visuals */}
      <div 
        ref={cardRef}
        className="relative aspect-[2.5/3.5] bg-card-bg rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 transition-transform duration-300 transform group-hover:scale-[1.02]"
      >
        {/* Main Image */}
        <img 
          src={card.imageUrl} 
          alt={`${user.name} as ${card.theme}`} 
          className="w-full h-full object-cover"
        />

        {/* Overlays - mimicking the canvas drawing for preview */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border-[1px] border-white/20 m-2 rounded-lg">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="font-action text-3xl text-white uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" 
                style={{ WebkitTextStroke: '1px black' }}>
              {user.name}
            </h2>
            <div className="text-right">
              <span className="font-action italic text-yellow-400 text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block"
               style={{ WebkitTextStroke: '1px black' }}>
                SUPER
              </span>
              <span className="font-action italic text-yellow-400 text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block -mt-1"
               style={{ WebkitTextStroke: '1px black' }}>
                STAFFERS
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="font-comic text-2xl text-vibez-blue uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
             style={{ WebkitTextStroke: '1px black' }}>
              {card.theme}
            </div>
            
            <div className="w-16 h-16 opacity-90">
               {/* SVG Rendered Inline for display */}
               <div dangerouslySetInnerHTML={{ __html: VIBEZ_LOGO_SVG }} />
            </div>
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-center gap-4">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-vibez-blue hover:bg-cyan-600 text-white rounded-full font-bold shadow-lg transition-colors"
        >
          {isDownloading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4" />}
          Download
        </button>
        {onDelete && (
          <button 
            onClick={() => onDelete(card.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TradingCard;