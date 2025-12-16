/* PHASE 3: Mini Player (Redesigned) */
import React from 'react';
import '../styles/theme.css';

const MiniPlayer = () => {
  // Hardcoded for demo - hook up to your audio context later
  const currentTrack = { title: "Goldfish Jam", artist: "The Spandex Crew" };
  const nextTrack = "Neon Nights";

  return (
    <div className="mini-player-container">
      <div className="player-info">
        <div className="now-playing">
          <span className="label">Now Playing:</span>
          <span className="track">{currentTrack.title} - {currentTrack.artist}</span>
        </div>
        <div className="next-up">
          <span className="label">Up Next:</span>
          <span className="track">{nextTrack}</span>
        </div>
      </div>
      
      <div className="player-controls">
        <button>⏮</button>
        <button>▶️</button> {/* Play/Pause */}
        <button>⏭</button>
        {/* REMOVED: "Now Playing" Button as requested */}
      </div>
      
      <style>{`
        .mini-player-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: var(--bg-secondary);
          border-top: 2px solid var(--accent-color);
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
        }
        .player-info { display: flex; flex-direction: column; }
        .label { font-size: 0.8rem; color: var(--text-secondary); margin-right: 5px; }
        .track { font-weight: bold; color: var(--text-primary); }
      `}</style>
    </div>
  );
};

export default MiniPlayer;