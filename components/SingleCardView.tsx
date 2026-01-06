import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TradingCard from './TradingCard';
import { CardData, User } from '../types';
import { ArrowLeft, Download, Trash2, Lock, Unlock, Link as LinkIcon, Check, Loader2, Sparkles, RefreshCw, Plus } from 'lucide-react';
import Layout from './Layout';

interface SingleCardViewProps {
  card: CardData;
  user?: User;
  onBack: () => void;
  onDelete: (cardId: string) => void;
  onToggleVisibility: (cardId: string) => void;
  isOwner: boolean;
  isSaved?: boolean;
  showAddButton?: boolean;
  onAddToCollection?: () => void;
  onRemoveFromCollection?: () => void;
  isTogglingVisibility?: boolean;
  pendingVisibility?: boolean;
  isTogglingCollection?: boolean;
}

const SingleCardView: React.FC<SingleCardViewProps> = ({
  card,
  user,
  onBack,
  onDelete,
  onToggleVisibility,
  isOwner,
  isSaved = false,
  showAddButton = false,
  onAddToCollection,
  onRemoveFromCollection,
  isTogglingVisibility = false,
  pendingVisibility = false,
  isTogglingCollection = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const renderCardBack = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const width = 750;
    const height = 1050;

    // Background gradient (slate-900 to slate-800)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');  // slate-900
    bgGradient.addColorStop(0.5, '#1e293b'); // slate-800
    bgGradient.addColorStop(1, '#0f172a');  // slate-900
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative diagonal stripe pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 20;
    for (let i = -height; i < width + height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Corner decorations
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.6)'; // vibez-blue
    ctx.lineWidth = 8;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(100, 40);
    ctx.lineTo(40, 40);
    ctx.lineTo(40, 100);
    ctx.stroke();
    // Top-right
    ctx.strokeStyle = 'rgba(114, 9, 183, 0.6)'; // vibez-purple
    ctx.beginPath();
    ctx.moveTo(width - 100, 40);
    ctx.lineTo(width - 40, 40);
    ctx.lineTo(width - 40, 100);
    ctx.stroke();
    // Bottom-left
    ctx.strokeStyle = 'rgba(114, 9, 183, 0.6)';
    ctx.beginPath();
    ctx.moveTo(40, height - 100);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(100, height - 40);
    ctx.stroke();
    // Bottom-right
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.6)';
    ctx.beginPath();
    ctx.moveTo(width - 100, height - 40);
    ctx.lineTo(width - 40, height - 40);
    ctx.lineTo(width - 40, height - 100);
    ctx.stroke();

    // Draw SuperStaffer logo (top-left)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          ctx.drawImage(logoImg, 50, 50, 50, 50);
          resolve(null);
        };
        logoImg.onerror = reject;
        logoImg.src = '/logos/ss-logo-rich-64x64.png';
      });
    } catch (error) {
      console.warn('Logo rendering failed', error);
    }

    // Header text - "SUPER STAFFERS"
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('SUPER STAFFERS', width / 2, 75);

    // Card ID
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`#${card.id.slice(0, 6)}`, width - 50, 75);

    // Name banner with gradient background
    const nameY = 140;
    const nameGradient = ctx.createLinearGradient(100, nameY - 30, width - 100, nameY - 30);
    nameGradient.addColorStop(0, '#00B4D8'); // vibez-blue
    nameGradient.addColorStop(1, '#7209B7'); // vibez-purple
    ctx.fillStyle = nameGradient;
    ctx.roundRect(100, nameY - 40, width - 200, 60, 8);
    ctx.fill();

    // Name text
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(card.userName.toUpperCase(), width / 2, nameY);

    // Stats section background
    const statsY = 230;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(60, statsY, width - 120, 80, 12);
    ctx.fill();

    // Stats boxes
    const statBoxWidth = (width - 160) / 3;
    const statBoxes = [
      { label: 'THEME', value: card.theme, x: 80, width: statBoxWidth * 1.5 },
      { label: 'ALIGNMENT', value: card.alignment, x: 80 + statBoxWidth * 1.5 + 20, width: statBoxWidth * 0.75 - 10, color: card.alignment === 'Hero' ? '#22d3ee' : '#f87171' },
      { label: 'CREATED', value: new Date(card.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), x: 80 + statBoxWidth * 2.25 + 30, width: statBoxWidth * 0.75 - 10 }
    ];

    statBoxes.forEach(box => {
      // Stat box background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.roundRect(box.x, statsY + 15, box.width, 50, 8);
      ctx.fill();

      // Label
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      ctx.fillText(box.label, box.x + 15, statsY + 32);

      // Value
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillStyle = box.color || '#ffffff';
      ctx.fillText(box.value, box.x + 15, statsY + 52);
    });

    // Super Powers section
    const powersY = 340;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(60, powersY, width - 120, height - powersY - 140, 12);
    ctx.fill();

    // Super Powers header with decorative lines
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const headerText = 'SUPER POWERS';
    const headerWidth = ctx.measureText(headerText).width;

    // Decorative lines
    const lineGradient1 = ctx.createLinearGradient(80, powersY + 30, width / 2 - headerWidth / 2 - 20, powersY + 30);
    lineGradient1.addColorStop(0, 'transparent');
    lineGradient1.addColorStop(1, '#00B4D8');
    ctx.strokeStyle = lineGradient1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, powersY + 30);
    ctx.lineTo(width / 2 - headerWidth / 2 - 20, powersY + 30);
    ctx.stroke();

    const lineGradient2 = ctx.createLinearGradient(width / 2 + headerWidth / 2 + 20, powersY + 30, width - 80, powersY + 30);
    lineGradient2.addColorStop(0, '#7209B7');
    lineGradient2.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGradient2;
    ctx.beginPath();
    ctx.moveTo(width / 2 + headerWidth / 2 + 20, powersY + 30);
    ctx.lineTo(width - 80, powersY + 30);
    ctx.stroke();

    ctx.fillText(headerText, width / 2, powersY + 35);

    // Super Powers list
    let powerY = powersY + 65;
    if (user?.strengths && user.strengths.length > 0) {
      user.strengths.forEach((strength: string) => {
        // Power item background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.roundRect(90, powerY - 20, width - 180, 35, 8);
        ctx.fill();

        // Sparkle icon (simple star)
        ctx.fillStyle = '#00B4D8';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('★', 105, powerY);

        // Power text
        ctx.font = '18px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(strength, 135, powerY);

        powerY += 45;
      });
    } else {
      ctx.font = 'italic 16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('No super powers specified', width / 2, powerY);
    }

    // Origin Story section
    const storyY = powerY + 40;

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, storyY - 10);
    ctx.lineTo(width - 90, storyY - 10);
    ctx.stroke();

    // Origin Story header
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const storyHeaderText = 'ORIGIN STORY';
    const storyHeaderWidth = ctx.measureText(storyHeaderText).width;

    // Decorative lines for story header
    const storyLine1 = ctx.createLinearGradient(80, storyY + 15, width / 2 - storyHeaderWidth / 2 - 20, storyY + 15);
    storyLine1.addColorStop(0, 'transparent');
    storyLine1.addColorStop(1, '#7209B7');
    ctx.strokeStyle = storyLine1;
    ctx.beginPath();
    ctx.moveTo(80, storyY + 15);
    ctx.lineTo(width / 2 - storyHeaderWidth / 2 - 20, storyY + 15);
    ctx.stroke();

    const storyLine2 = ctx.createLinearGradient(width / 2 + storyHeaderWidth / 2 + 20, storyY + 15, width - 80, storyY + 15);
    storyLine2.addColorStop(0, '#00B4D8');
    storyLine2.addColorStop(1, 'transparent');
    ctx.strokeStyle = storyLine2;
    ctx.beginPath();
    ctx.moveTo(width / 2 + storyHeaderWidth / 2 + 20, storyY + 15);
    ctx.lineTo(width - 80, storyY + 15);
    ctx.stroke();

    ctx.fillText(storyHeaderText, width / 2, storyY + 20);

    // Origin Story text (word wrap)
    if (user?.story && user.story.trim()) {
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'left';

      const maxWidth = width - 180;
      const words = user.story.split(' ');
      let line = '';
      let lineY = storyY + 50;

      words.forEach((word, index) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && index > 0) {
          ctx.fillText(line, 90, lineY);
          line = word + ' ';
          lineY += 24;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 90, lineY);
    } else {
      ctx.font = 'italic 16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('No origin story specified', width / 2, storyY + 50);
    }

    // Footer with ss.vibez.ventures
    const footerY = height - 50;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    const footerText = 'ss.vibez.ventures';
    const footerWidth = ctx.measureText(footerText).width;

    // Footer decorative lines
    const footerLine1 = ctx.createLinearGradient(80, footerY, width / 2 - footerWidth / 2 - 20, footerY);
    footerLine1.addColorStop(0, 'transparent');
    footerLine1.addColorStop(0.5, '#00B4D8');
    footerLine1.addColorStop(1, '#00B4D8');
    ctx.strokeStyle = footerLine1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, footerY);
    ctx.lineTo(width / 2 - footerWidth / 2 - 20, footerY);
    ctx.stroke();

    const footerLine2 = ctx.createLinearGradient(width / 2 + footerWidth / 2 + 20, footerY, width - 80, footerY);
    footerLine2.addColorStop(0, '#7209B7');
    footerLine2.addColorStop(0.5, '#7209B7');
    footerLine2.addColorStop(1, 'transparent');
    ctx.strokeStyle = footerLine2;
    ctx.beginPath();
    ctx.moveTo(width / 2 + footerWidth / 2 + 20, footerY);
    ctx.lineTo(width - 80, footerY);
    ctx.stroke();

    ctx.fillText(footerText, width / 2, footerY + 5);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 750;
      const height = 1050;
      canvas.width = width;
      canvas.height = height;

      // If viewing the back, render the back design
      if (isFlipped) {
        await renderCardBack(canvas, ctx);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `SuperStaffer-${card.userName}-${card.theme}-BACK.png`;
        link.href = dataUrl;
        link.click();

        setIsDownloading(false);
        return;
      }

      // Otherwise render the front card
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = card.imageUrl;
      });

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

      ctx.font = 'italic 900 36px "Arial", sans-serif';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.strokeText(card.userName.toUpperCase(), 40, 65);
      ctx.fillText(card.userName.toUpperCase(), 40, 65);

      ctx.font = 'italic 900 36px "Arial", sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'right';
      ctx.strokeText("SUPER STAFFERS", width - 40, 65);
      ctx.fillText("SUPER STAFFERS", width - 40, 65);
      ctx.textAlign = 'left';

      ctx.font = 'bold 40px "Arial", sans-serif';
      ctx.fillStyle = '#00B4D8';
      ctx.strokeText(card.theme.toUpperCase(), 40, height - 50);
      ctx.fillText(card.theme.toUpperCase(), 40, height - 50);

      const logoSize = 60;
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
        ctx.fillStyle = '#00B4D8';
        ctx.fillRect(lx, ly, logoSize, logoSize);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SuperStaffer-${card.userName}-${card.theme}-FRONT.png`;
      link.href = dataUrl;
      link.click();

    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to generate download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(card.id);
      onBack();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/card/${card.id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-4 p-2.5 md:p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>

        {/* Save Count - centered when present */}
        {card.saveCount > 0 && (
          <p className="font-comic text-sm md:text-base text-gray-600 text-center mb-4">
            {card.saveCount} {card.saveCount === 1 ? 'Staffer saved' : 'Staffers saved'} this card
          </p>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Flip Card Container */}
          <div className="relative flex justify-center" style={{ perspective: '1000px' }}>
            {/* Animated Card Container */}
            <motion.div
              className="w-full max-w-sm relative"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card Front */}
              <div
                className="w-full"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <TradingCard card={card} variant="preview" />
              </div>

              {/* Card Back */}
              <div
                className="w-full absolute top-0 left-0"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-full max-w-sm">
                <div className="group relative aspect-[2.5/3.5] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
                    }} />
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-vibez-blue opacity-60" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-vibez-purple opacity-60" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-vibez-purple opacity-60" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-vibez-blue opacity-60" />

                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Inner Border Frame */}
                  <div className="absolute inset-3 border-2 border-white/20 pointer-events-none" />

                  {/* Content Container */}
                  <div className="relative h-full flex flex-col p-4">
                    {/* Header Section - Compact */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 opacity-80">
                        <img src="/logos/ss-logo-rich-64x64.png" alt="Super Staffers" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-action text-[10px] text-white/60 uppercase tracking-widest">
                          SUPER STAFFERS
                        </span>
                      </div>
                      <span className="font-action text-[10px] text-white/60 uppercase tracking-wider">
                        #{card.id.slice(0, 6)}
                      </span>
                    </div>

                    {/* Name Banner - More Compact */}
                    <div className="relative mb-3">
                      <div className="bg-gradient-to-r from-vibez-blue to-vibez-purple py-2 px-3 rounded">
                        <h1 className="font-action text-lg text-white text-center uppercase tracking-wider drop-shadow-lg">
                          {card.userName}
                        </h1>
                      </div>
                    </div>

                    {/* Stats Section - Theme wider, Alignment and Created narrower */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 mb-2 border border-white/20">
                      <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
                        {/* Theme */}
                        <div className="bg-black/20 rounded p-1.5 border border-white/10">
                          <div className="text-[8px] text-white/60 uppercase tracking-wide mb-0.5">Theme</div>
                          <div className="font-action text-xs text-white leading-tight">{card.theme}</div>
                        </div>
                        {/* Alignment */}
                        <div className="bg-black/20 rounded p-1.5 border border-white/10">
                          <div className="text-[8px] text-white/60 uppercase tracking-wide mb-0.5">Alignment</div>
                          <div className={`font-action text-xs leading-tight ${
                            card.alignment === 'Hero' ? 'text-cyan-400' : 'text-red-400'
                          }`}>
                            {card.alignment}
                          </div>
                        </div>
                        {/* Created */}
                        <div className="bg-black/20 rounded p-1.5 border border-white/10">
                          <div className="text-[8px] text-white/60 uppercase tracking-wide mb-0.5">Created</div>
                          <div className="font-comic text-xs text-white/80 leading-tight">{new Date(card.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Super Powers Section - Compact with more room */}
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20 overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-blue to-transparent" />
                        <h2 className="font-action text-xs text-white uppercase tracking-wide">
                          Super Powers
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-purple to-transparent" />
                      </div>

                      <div className="space-y-1">
                        {user?.strengths && user.strengths.length > 0 ? (
                          user.strengths.map((strength: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded px-2 py-1"
                            >
                              <Sparkles className="w-3 h-3 text-vibez-blue flex-shrink-0" />
                              <span className="font-comic text-xs text-white/90 leading-tight">{strength}</span>
                            </div>
                          ))
                        ) : (
                          <p className="font-comic text-white/40 text-xs italic text-center py-1">
                            No super powers specified
                          </p>
                        )}
                      </div>

                      {/* Origin Story */}
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-purple to-transparent" />
                          <h2 className="font-action text-xs text-white uppercase tracking-wide">
                            Origin Story
                          </h2>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-blue to-transparent" />
                        </div>
                        {user?.story && user.story.trim() ? (
                          <p className="font-comic font-normal text-white/90 text-[11px] leading-snug">
                            {user.story}
                          </p>
                        ) : (
                          <p className="font-comic text-white/40 text-xs italic text-center py-1">
                            No origin story specified
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-blue to-vibez-blue/50" />
                      <span className="font-action text-[10px] text-white/60 uppercase tracking-widest">
                        ss.vibez.ventures
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-vibez-purple to-vibez-purple/50" />
                    </div>

                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions / CTA Section - Always below card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Owner Actions */}
            {isOwner ? (
              <div className="max-w-md mx-auto space-y-4">
                  {/* Flip and Download Buttons - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Flip Button */}
                    <motion.button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          '0 10px 25px rgba(0, 180, 216, 0.3)',
                          '0 10px 35px rgba(114, 9, 183, 0.5)',
                          '0 10px 25px rgba(0, 180, 216, 0.3)'
                        ]
                      }}
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <motion.div
                        animate={{ rotate: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <RefreshCw className="w-6 h-6" />
                      </motion.div>
                      <span>FLIP</span>
                    </motion.button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          DOWNLOADING...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6" />
                          DOWNLOAD
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onToggleVisibility(card.id)}
                    disabled={isTogglingVisibility}
                    className="w-full relative rounded-2xl bg-gray-100 overflow-hidden transition-all hover:shadow-lg disabled:cursor-wait"
                  >
                    {/* Sliding Background */}
                    <div
                      className={`absolute inset-y-0 w-1/2 rounded-xl transition-all duration-300 ease-in-out ${
                        isTogglingVisibility
                          ? (pendingVisibility ? 'bg-green-500 opacity-50' : 'bg-red-500 opacity-50')
                          : (card.public ? 'bg-green-500' : 'bg-red-500')
                      }`}
                      style={{
                        left: isTogglingVisibility ? (pendingVisibility ? '50%' : '0%') : (card.public ? '50%' : '0%'),
                      }}
                    />

                    {/* Static Toggle Content */}
                    <div className="relative flex items-center">
                      {/* PRIVATE Side */}
                      <div className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors duration-300 ${
                        isTogglingVisibility
                          ? (!pendingVisibility ? 'text-white' : 'text-gray-400')
                          : (!card.public ? 'text-white' : 'text-gray-400')
                      }`}>
                        <Lock className="w-6 h-6" />
                        <span className="font-action text-xl">PRIVATE</span>
                      </div>

                      {/* PUBLIC Side */}
                      <div className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors duration-300 ${
                        isTogglingVisibility
                          ? (pendingVisibility ? 'text-white' : 'text-gray-400')
                          : (card.public ? 'text-white' : 'text-gray-400')
                      }`}>
                        <Unlock className="w-6 h-6" />
                        <span className="font-action text-xl">PUBLIC</span>
                      </div>
                    </div>
                  </button>

                  {/* Copy Link (shown when public) */}
                  {card.public && (
                    <button
                      onClick={handleCopyLink}
                      className="w-full bg-white border-2 border-vibez-blue text-vibez-blue font-action text-xl py-5 rounded-2xl hover:bg-vibez-blue hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-6 h-6" />
                          LINK COPIED!
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-6 h-6" />
                          COPY SHARE LINK
                        </>
                      )}
                    </button>
                  )}

                  {/* Delete Button */}
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-white border-2 border-red-200 text-red-600 font-action text-xl py-5 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-6 h-6" />
                      DELETE CARD
                    </button>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 space-y-4">
                      <p className="font-action text-lg text-red-900 text-center">
                        DELETE THIS CARD FOREVER?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className={`bg-white border-2 border-gray-200 text-gray-700 font-action text-lg py-3 rounded-xl hover:bg-gray-50 transition-all disabled:cursor-wait ${
                            isDeleting ? 'opacity-50' : ''
                          }`}
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className={`bg-red-600 text-white font-action text-lg py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:cursor-wait ${
                            isDeleting ? 'opacity-50' : ''
                          }`}
                        >
                          {isDeleting && <Loader2 className="w-5 h-5 animate-spin" />}
                          DELETE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-Owner Actions */
                <div className="max-w-md mx-auto space-y-4">
                  {/* Flip and Download Buttons - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Flip Button */}
                    <motion.button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          '0 10px 25px rgba(0, 180, 216, 0.3)',
                          '0 10px 35px rgba(114, 9, 183, 0.5)',
                          '0 10px 25px rgba(0, 180, 216, 0.3)'
                        ]
                      }}
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    >
                      <motion.div
                        animate={{ rotate: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <RefreshCw className="w-6 h-6" />
                      </motion.div>
                      <span>FLIP</span>
                    </motion.button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          DOWNLOADING...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6" />
                          DOWNLOAD
                        </>
                      )}
                    </button>
                  </div>

                  {/* Add to Collection Button - show when not saved and not in confirmation state */}
                  {showAddButton && onAddToCollection && !isSaved && !showRemoveConfirm && (
                    <button
                      onClick={onAddToCollection}
                      disabled={isTogglingCollection}
                      className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-action text-xl py-5 rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:cursor-wait ${
                        isTogglingCollection ? 'opacity-50' : ''
                      }`}
                    >
                      {isTogglingCollection ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Plus className="w-6 h-6" />
                      )}
                      ADD TO COLLECTION
                    </button>
                  )}

                  {/* Remove from Collection Button - show when saved */}
                  {showAddButton && isSaved && onRemoveFromCollection && !showRemoveConfirm && (
                    <button
                      onClick={() => setShowRemoveConfirm(true)}
                      disabled={isTogglingCollection}
                      className="w-full bg-white border-2 border-red-200 text-red-600 font-action text-xl py-5 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-6 h-6" />
                      REMOVE FROM COLLECTION
                    </button>
                  )}

                  {/* Remove Confirmation - show when user clicks Remove */}
                  {showRemoveConfirm && onRemoveFromCollection && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 space-y-4">
                      <p className="font-action text-lg text-red-900 text-center">
                        REMOVE CARD FROM COLLECTION?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowRemoveConfirm(false)}
                          disabled={isTogglingCollection}
                          className={`bg-white border-2 border-gray-200 text-gray-700 font-action text-lg py-3 rounded-xl hover:bg-gray-50 transition-all disabled:cursor-wait ${
                            isTogglingCollection ? 'opacity-50' : ''
                          }`}
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => {
                            onRemoveFromCollection();
                          }}
                          disabled={isTogglingCollection}
                          className={`bg-red-600 text-white font-action text-lg py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:cursor-wait ${
                            isTogglingCollection ? 'opacity-50' : ''
                          }`}
                        >
                          {isTogglingCollection && <Loader2 className="w-5 h-5 animate-spin" />}
                          REMOVE
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CTA Card - New Design */}
                  {!showAddButton && (
                  <div className="relative rounded-3xl overflow-hidden shadow-xl">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,180,216,0.3) 10px, rgba(0,180,216,0.3) 20px)`
                      }} />
                    </div>

                    {/* Decorative Corner Accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-vibez-blue opacity-60" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-vibez-purple opacity-60" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-vibez-purple opacity-60" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-vibez-blue opacity-60" />

                    {/* Content */}
                    <div className="relative p-8 text-center border-2 border-white/20">
                      <div className="mb-3 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-vibez-blue animate-pulse" />
                      </div>
                      <h2 className="font-action text-3xl text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-vibez-blue to-vibez-purple" style={{
                        WebkitTextFillColor: 'white'
                      }}>
                        CREATE YOURS
                      </h2>
                      <p className="font-comic text-lg text-white/90 mb-6">
                        Join the Super Staffers and to create and share your own cards!
                      </p>
                      <a
                        href="/"
                        className="inline-block bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl px-10 py-4 rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30"
                      >
                        GET STARTED
                      </a>
                    </div>
                  </div>
                  )}
                </div>
              )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SingleCardView;
