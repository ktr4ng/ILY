import React, { useState } from 'react';
import { Scene3D } from './components/Scene3D';
import { InvitationCard } from './components/InvitationCard';
import { CelebrationModal } from './components/CelebrationModal';
import { SoundController } from './components/SoundController';
import { DayNightToggle } from './components/DayNightToggle';
import { FilmGrain } from './components/FilmGrain';
import { Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [isCelebration, setIsCelebration] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const handleAccept = () => {
    setIsCelebration(true);
    setShowCelebrationModal(true);
  };

  const handleBackToRoom = () => {
    setShowCelebrationModal(false);
  };

  const handleReopenCelebration = () => {
    setShowCelebrationModal(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#718B91] font-sans">
      {/* 1. 3D WebGL Living Environment */}
      <Scene3D isNight={isNight} isCelebration={isCelebration} />

      {/* 2. Indie Game Film Grain & Soft Vignette */}
      <FilmGrain />

      {/* 3. Top Controls (Starry Night Toggle & Ambient Music Toggle) */}
      <DayNightToggle isNight={isNight} onToggle={() => setIsNight(!isNight)} />
      <SoundController />

      {/* 4. Primary Invitation Screen */}
      {!isCelebration && (
        <InvitationCard onAccept={handleAccept} />
      )}

      {/* 5. Celebration & Surprise Experience */}
      {isCelebration && showCelebrationModal && (
        <CelebrationModal onBackToRoom={handleBackToRoom} />
      )}

      {/* 6. Floating Persistent Badge when modal is closed to view room */}
      {isCelebration && !showCelebrationModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <button
            onClick={handleReopenCelebration}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel-warm text-[#174A2D] font-medium text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-[#174A2D] text-[#174A2D]" />
            <span>It's a date! View our surprise →</span>
          </button>
        </div>
      )}
    </main>
  );
};

export default App;
