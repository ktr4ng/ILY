import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface SoundControllerProps {
  className?: string;
}

export const SoundController: React.FC<SoundControllerProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setIsPlaying(romanticAudio.getIsPlaying());
  }, []);

  const handleToggle = () => {
    setHasInteracted(true);
    const active = romanticAudio.toggle();
    setIsPlaying(active);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 ${className}`}>
      {!hasInteracted && !isPlaying && (
        <span className="hidden sm:inline-block px-3 py-1 text-xs rounded-full bg-[#174A2D]/40 text-[#F5F0E5] border border-[#F5F0E5]/20 backdrop-blur-md animate-pulse">
          Click for ambient music ♫
        </span>
      )}
      <button
        onClick={handleToggle}
        className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel text-[#F5F0E5] hover:text-[#F5D98C] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        aria-label={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
        title={isPlaying ? 'Mute romantic ambient music' : 'Play romantic ambient music'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-[#A8C68A]" />
            <div className="flex items-end gap-[3px] h-3 px-0.5">
              <span className="w-0.5 bg-[#A8C68A] rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 bg-[#A8C68A] rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 bg-[#A8C68A] rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-medium tracking-wide">Music on</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            <span className="text-xs font-medium tracking-wide opacity-80 group-hover:opacity-100">Music off</span>
          </>
        )}
      </button>
    </div>
  );
};
