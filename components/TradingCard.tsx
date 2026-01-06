import React, { useRef, useState } from 'react';
import { CardData, User } from '../types';
import { Download, Trash2, Share2, Loader2 } from 'lucide-react';
import { VIBEZ_LOGO_SVG } from '../constants';

interface TradingCardProps {
  card: CardData;
  user?: User;
  onDelete?: (id: string) => void;
  variant?: 'preview' | 'full' | 'dashboard';
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

      // 1. Load and Draw Main Image (covers full canvas, no border - NO white background)
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = card.imageUrl;
      });

      // Draw Main Image covering the ENTIRE canvas (no inset)
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

      // 3. Text Overlays (matching website display proportions)
      const userName = user?.name || card.userName;

      // Top Left: Name
      ctx.font = 'italic 900 28px "Arial", sans-serif';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.strokeText(userName.toUpperCase(), 40, 60);
      ctx.fillText(userName.toUpperCase(), 40, 60);

      // Top Right: SUPER STAFFERS
      ctx.font = 'italic 900 28px "Arial", sans-serif';
      ctx.fillStyle = '#FFD700'; // Gold
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.textAlign = 'right';
      ctx.strokeText("SUPER STAFFERS", width - 40, 60);
      ctx.fillText("SUPER STAFFERS", width - 40, 60);
      ctx.textAlign = 'left'; // Reset

      // Bottom Left: Theme
      ctx.font = 'bold 32px "Arial", sans-serif';
      ctx.fillStyle = '#00B4D8';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.strokeText(card.theme.toUpperCase(), 40, height - 50);
      ctx.fillText(card.theme.toUpperCase(), 40, height - 50);

      // 4. Draw Logo (Bottom Right)
      const logoSize = 60; // Slightly larger for better visibility
      const lx = width - 40 - logoSize;
      const ly = height - 40 - logoSize;

      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
            resolve(null);
          };
          logoImg.onerror = reject;
          logoImg.src = '/logos/ss-logo-rich-64x64.png';
        });

      } catch (error) {
        console.warn("Logo drawing failed", error);
        // Fallback: Blue square if logo fails (shouldn't happen)
        ctx.fillStyle = '#00B4D8';
        ctx.fillRect(lx, ly, logoSize, logoSize);
      }

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SuperStaffer-${userName}-${card.theme}.png`;
      link.href = dataUrl;
      link.click();

    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to generate download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const displayName = user?.name || card.userName;

  return (
    <div className="relative group w-full max-w-sm">
      {/* Card Visuals - Sharp corners, no border, image bleeds to edges */}
      <div
        ref={cardRef}
        className="relative aspect-[2.5/3.5] shadow-2xl transition-transform duration-300 transform group-hover:scale-[1.02] overflow-hidden"
      >
        {/* Main Image - covers entire card */}
        <img
          src={card.imageUrl}
          alt={`${displayName} as ${card.theme}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlays - mimicking the canvas drawing for preview */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">

          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="font-action italic text-lg text-white uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: '1px black' }}>
              {displayName}
            </h2>
            <span className="font-action italic text-yellow-400 text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: '1px black' }}>
              SUPER STAFFERS
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="font-comic text-2xl text-vibez-blue uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: '1px black' }}>
              {card.theme}
            </div>

            <div className="w-10 h-10 drop-shadow-lg">
              <img src="/logos/ss-logo-rich-64x64.png" alt="Super Staffers" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Actions - only show for 'full' variant */}
      {variant === 'full' && (
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-vibez-blue hover:bg-cyan-600 text-white rounded-full font-bold shadow-lg transition-colors"
          >
            {isDownloading ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
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
      )}
    </div>
  );
};

export default TradingCard;