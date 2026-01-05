import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TradingCard from './TradingCard';
import { CardData, User } from '../types';
import { ArrowLeft, Download, Trash2, Lock, Unlock, Link as LinkIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { VIBEZ_LOGO_SVG } from '../constants';
import Layout from './Layout';

interface SingleCardViewProps {
  card: CardData;
  user?: User;
  onBack: () => void;
  onDelete: (cardId: string) => void;
  onToggleVisibility: (cardId: string) => void;
  isOwner: boolean;
}

const SingleCardView: React.FC<SingleCardViewProps> = ({
  card,
  user,
  onBack,
  onDelete,
  onToggleVisibility,
  isOwner
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const borderRadius = 20;
      const borderWidth = 20;

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

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.moveTo(borderRadius, borderWidth / 2);
      ctx.lineTo(width - borderRadius, borderWidth / 2);
      ctx.quadraticCurveTo(width - borderWidth / 2, borderWidth / 2, width - borderWidth / 2, borderRadius);
      ctx.lineTo(width - borderWidth / 2, height - borderRadius);
      ctx.quadraticCurveTo(width - borderWidth / 2, height - borderWidth / 2, width - borderRadius, height - borderWidth / 2);
      ctx.lineTo(borderRadius, height - borderWidth / 2);
      ctx.quadraticCurveTo(borderWidth / 2, height - borderWidth / 2, borderWidth / 2, height - borderRadius);
      ctx.lineTo(borderWidth / 2, borderRadius);
      ctx.quadraticCurveTo(borderWidth / 2, borderWidth / 2, borderRadius, borderWidth / 2);
      ctx.closePath();
      ctx.stroke();

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
        const svgBlob = new Blob([VIBEZ_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
            URL.revokeObjectURL(url);
            resolve(null);
          };
          logoImg.onerror = reject;
          logoImg.src = url;
        });
      } catch (error) {
        console.warn("Logo drawing failed", error);
        ctx.fillStyle = '#00B4D8';
        ctx.fillRect(lx, ly, logoSize, logoSize);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SuperStaffer-${card.userName}-${card.theme}.png`;
      link.href = dataUrl;
      link.click();

    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to generate download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    onDelete(card.id);
    onBack();
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
      <div className="container mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-8 p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Cards Row */}
          <div className="grid lg:grid-cols-2 gap-2 items-start">
            {/* Card Front */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-sm">
                <TradingCard card={card} variant="preview" />
              </div>
            </motion.div>

            {/* Card Back */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
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
                        <div dangerouslySetInnerHTML={{ __html: VIBEZ_LOGO_SVG }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-vibez-blue" />
                        <span className="font-action text-[10px] text-white/60 uppercase tracking-widest">
                          ss.vibez.ventures
                        </span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-vibez-purple" />
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

                    {/* Stats Section - Optimized Layout */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-3 border border-white/20">
                      <div className="grid grid-cols-3 gap-2">
                        {/* Theme - Takes 2 columns */}
                        <div className="bg-black/20 rounded p-2 border border-white/10 col-span-2">
                          <div className="text-[9px] text-white/60 uppercase tracking-wide mb-0.5">Theme</div>
                          <div className="font-action text-xs text-white leading-tight">{card.theme}</div>
                        </div>
                        {/* Alignment & Created - Stacked in 1 column */}
                        <div className="flex flex-col gap-2">
                          <div className="bg-black/20 rounded p-2 border border-white/10">
                            <div className="text-[9px] text-white/60 uppercase tracking-wide mb-0.5">Alignment</div>
                            <div className={`font-action text-xs leading-tight ${
                              card.alignment === 'Hero' ? 'text-cyan-400' : 'text-red-400'
                            }`}>
                              {card.alignment}
                            </div>
                          </div>
                          <div className="bg-black/20 rounded p-2 border border-white/10">
                            <div className="text-[9px] text-white/60 uppercase tracking-wide mb-0.5">Created</div>
                            <div className="font-comic text-[10px] text-white/80 leading-tight">{new Date(card.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Super Powers Section - Compact with more room */}
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 overflow-y-auto">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-blue to-transparent" />
                        <h2 className="font-action text-sm text-white uppercase tracking-wide">
                          Super Powers
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-purple to-transparent" />
                      </div>

                      <div className="space-y-1.5">
                        {user?.strengths && user.strengths.length > 0 ? (
                          user.strengths.map((strength: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded px-2 py-1.5"
                            >
                              <Sparkles className="w-3 h-3 text-vibez-blue flex-shrink-0" />
                              <span className="font-comic text-xs text-white/90 leading-tight">{strength}</span>
                            </div>
                          ))
                        ) : (
                          <p className="font-comic text-white/40 text-xs italic text-center py-2">
                            No super powers specified
                          </p>
                        )}
                      </div>

                      {/* Origin Story */}
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-purple to-transparent" />
                          <h2 className="font-action text-sm text-white uppercase tracking-wide">
                            Origin Story
                          </h2>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-vibez-blue to-transparent" />
                        </div>
                        {user?.story && user.story.trim() ? (
                          <p className="font-comic text-white/90 text-xs leading-relaxed">
                            {user.story}
                          </p>
                        ) : (
                          <p className="font-comic text-white/40 text-xs italic text-center py-2">
                            No origin story specified
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions / CTA Section - Always below both cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Owner Actions */}
            {isOwner ? (
              <div className="max-w-md mx-auto space-y-4">
                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-gradient-to-r from-vibez-blue to-vibez-purple text-white font-action text-xl py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        DOWNLOADING...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        DOWNLOAD CARD
                      </>
                    )}
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onToggleVisibility(card.id)}
                    className="w-full relative rounded-2xl bg-gray-100 overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Sliding Background */}
                    <div
                      className={`absolute inset-y-0 w-1/2 rounded-xl transition-all duration-300 ease-in-out ${
                        card.isPublic ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        left: card.isPublic ? '50%' : '0%',
                      }}
                    />

                    {/* Static Toggle Content */}
                    <div className="relative flex items-center">
                      {/* PRIVATE Side */}
                      <div className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors duration-300 ${
                        !card.isPublic ? 'text-white' : 'text-gray-400'
                      }`}>
                        <Lock className="w-6 h-6" />
                        <span className="font-action text-xl">PRIVATE</span>
                      </div>

                      {/* PUBLIC Side */}
                      <div className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors duration-300 ${
                        card.isPublic ? 'text-white' : 'text-gray-400'
                      }`}>
                        <Unlock className="w-6 h-6" />
                        <span className="font-action text-xl">PUBLIC</span>
                      </div>
                    </div>
                  </button>

                  {/* Copy Link (shown when public) */}
                  {card.isPublic && (
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
                          className="bg-white border-2 border-gray-200 text-gray-700 font-action text-lg py-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleDelete}
                          className="bg-red-600 text-white font-action text-lg py-3 rounded-xl hover:bg-red-700 transition-all"
                        >
                          YES, DELETE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-Owner CTA */
                <div className="max-w-md mx-auto bg-gradient-to-br from-vibez-blue to-vibez-purple rounded-3xl p-8 shadow-lg text-center">
                  <h2 className="font-action text-3xl text-white mb-3">
                    CREATE YOUR OWN CARD
                  </h2>
                  <p className="font-comic text-lg text-white/90 mb-6">
                    Join the Super Staffers and transform yourself into a superhero!
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-white text-vibez-blue font-action text-xl px-8 py-4 rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    GET STARTED
                  </a>
                </div>
              )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SingleCardView;
