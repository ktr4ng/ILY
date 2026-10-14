import React, { useState, useRef, useCallback } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface InvitationCardProps {
  onAccept: () => void;
  className?: string;
}

const DODGE_MESSAGES = [
  'NO',
  'Wait, reconsider? 🥺',
  'Wrong button! ✨',
  'Nice try! 😉',
  'Are you sure? 🌿',
  'Still can\'t catch me! 💨',
  'You know you want to say YES ♡',
  'Just click YES already! 🥰',
];

export const InvitationCard: React.FC<InvitationCardProps> = ({ onAccept, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number; isFloating: boolean }>({
    x: 0,
    y: 0,
    isFloating: false,
  });

  // Calculate runaway coordinates that strictly avoid the card and YES button
  const moveNoButton = useCallback(() => {
    romanticAudio.playDodgeSwoosh();

    const noBtn = noButtonRef.current;
    const cardEl = cardRef.current;
    const yesBtn = yesButtonRef.current;

    const btnWidth = noBtn ? noBtn.offsetWidth : 130;
    const btnHeight = noBtn ? noBtn.offsetHeight : 52;
    const padding = 24;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Get exclusion zones
    const cardRect = cardEl?.getBoundingClientRect();
    const yesRect = yesBtn?.getBoundingClientRect();

    const buffer = 30; // Safety gap around elements

    let bestX = padding;
    let bestY = padding;
    let found = false;

    // Try up to 35 random positions
    for (let i = 0; i < 35; i++) {
      const candX = Math.floor(padding + Math.random() * (viewportW - btnWidth - padding * 2));
      const candY = Math.floor(padding + Math.random() * (viewportH - btnHeight - padding * 2));

      const candRight = candX + btnWidth;
      const candBottom = candY + btnHeight;

      // Check card collision
      let collidesWithCard = false;
      if (cardRect) {
        collidesWithCard = !(
          candRight < cardRect.left - buffer ||
          candX > cardRect.right + buffer ||
          candBottom < cardRect.top - buffer ||
          candY > cardRect.bottom + buffer
        );
      }

      // Check yes button collision
      let collidesWithYes = false;
      if (yesRect) {
        collidesWithYes = !(
          candRight < yesRect.left - buffer ||
          candX > yesRect.right + buffer ||
          candBottom < yesRect.top - buffer ||
          candY > yesRect.bottom + buffer
        );
      }

      if (!collidesWithCard && !collidesWithYes) {
        bestX = candX;
        bestY = candY;
        found = true;
        break;
      }
    }

    // Fallback if random attempts fail: choose a safe corner
    if (!found) {
      if (cardRect && cardRect.top > 150) {
        bestX = padding;
        bestY = padding;
      } else {
        bestX = viewportW - btnWidth - padding;
        bestY = viewportH - btnHeight - padding;
      }
    }

    setNoPos({
      x: bestX,
      y: bestY,
      isFloating: true,
    });

    setDodgeCount((prev) => prev + 1);
  }, []);

  const handleNoInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    moveNoButton();
  };

  const handleYesClick = () => {
    romanticAudio.playCelebration();
    onAccept();
  };

  const buttonText = DODGE_MESSAGES[Math.min(dodgeCount, DODGE_MESSAGES.length - 1)];

  return (
    <div className={`relative flex items-center justify-center p-4 min-h-screen ${className}`}>
      {/* Central Romantic Invitation Glass Card with Warm High-Contrast Parchment */}
      <div
        ref={cardRef}
        className="glass-panel-warm rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center relative z-20 transition-all duration-700 animate-float shadow-2xl border border-[#F5D98C]/60"
      >
        {/* Subtle decorative top icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#A8C68A]/35 border border-[#A8C68A]/70 flex items-center justify-center text-[#174A2D] shadow-md">
            <Heart className="w-6 h-6 fill-[#174A2D] animate-pulse" />
          </div>
        </div>

        {/* Invitation Text - Sharp, Dark, High-Contrast & Romantic */}
        <p className="font-romantic text-2xl sm:text-3xl text-[#8E5328] tracking-wide mb-3 italic font-semibold">
          “Xin chao”
        </p>

        <p className="text-base sm:text-lg text-[#234232] font-normal leading-relaxed mb-5">
          Another months of us, and I still want to take you on a date.
        </p>

        <h1 className="font-romantic text-3xl sm:text-4xl text-[#174A2D] font-bold leading-tight mb-8">
          Will you go on an anniversary date with me?
        </h1>

        {/* Buttons Row */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 min-h-[58px]">
          {/* YES Button (Soft sage-green #A8C68A with rounded corners) */}
          <button
            ref={yesButtonRef}
            onClick={handleYesClick}
            onMouseEnter={() => romanticAudio.playSparkle()}
            className="group relative px-9 py-3.5 rounded-2xl bg-[#A8C68A] hover:bg-[#97bd75] text-[#113A22] font-bold text-base sm:text-lg tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(168,198,138,0.5)] flex items-center gap-2 cursor-pointer border border-[#89b366]"
          >
            <span>YES ♡</span>
            <Sparkles className="w-4 h-4 text-[#113A22] opacity-85 group-hover:opacity-100 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Placeholder anchor for NO button in layout when not floating */}
          {!noPos.isFloating && (
            <button
              ref={noButtonRef}
              onMouseEnter={handleNoInteraction}
              onTouchStart={handleNoInteraction}
              onClick={handleNoInteraction}
              className="px-9 py-3.5 rounded-2xl bg-[#5c7a82] hover:bg-[#4d6a71] border border-[#F5F0E5]/40 text-[#FFFFFF] font-semibold text-base sm:text-lg tracking-wide transition-all duration-200 cursor-pointer shadow-lg select-none"
            >
              {buttonText}
            </button>
          )}
        </div>

        {/* Hint footer */}
        <p className="mt-8 text-xs text-[#2A4839]/75 font-medium tracking-wider">
          Let's go find something nom nom
        </p>
      </div>

      {/* Floating Runaway NO Button */}
      {noPos.isFloating && (
        <button
          ref={noButtonRef}
          onMouseEnter={handleNoInteraction}
          onTouchStart={handleNoInteraction}
          onClick={handleNoInteraction}
          style={{
            position: 'fixed',
            left: `${noPos.x}px`,
            top: `${noPos.y}px`,
            zIndex: 60,
            transition: 'all 0.36s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="px-7 py-3.5 rounded-2xl bg-[#4b6a72] hover:bg-[#3d5960] border-2 border-[#F5F0E5]/60 text-[#FFFFFF] font-bold text-sm sm:text-base tracking-wide shadow-2xl cursor-pointer select-none active:scale-95 whitespace-nowrap backdrop-blur-md"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
