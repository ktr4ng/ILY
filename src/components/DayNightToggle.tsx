import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface DayNightToggleProps {
  isNight: boolean;
  onToggle: () => void;
  className?: string;
}

export const DayNightToggle: React.FC<DayNightToggleProps> = ({
  isNight,
  onToggle,
  className = '',
}) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel text-[#F5F0E5] hover:text-[#F5D98C] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${className}`}
      aria-label={isNight ? 'Switch to daylight' : 'Switch to starry night'}
      title={isNight ? 'Switch to warm sunny day' : 'Switch to romantic starry night'}
    >
      {isNight ? (
        <>
          <Moon className="w-4 h-4 text-[#49B8D8]" />
          <span className="text-xs font-medium tracking-wide">Starry Night</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-[#F5D98C]" />
          <span className="text-xs font-medium tracking-wide">Sunlit Room</span>
        </>
      )}
    </button>
  );
};
