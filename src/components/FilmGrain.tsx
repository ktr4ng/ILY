import React from 'react';

export const FilmGrain: React.FC = () => {
  return (
    <>
      {/* Subtle organic film grain texture */}
      <div className="film-grain" aria-hidden="true" />
      {/* Soft nostalgic vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 opacity-40 mix-blend-multiply"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(18, 38, 30, 0.45) 100%)'
        }}
        aria-hidden="true"
      />
    </>
  );
};
