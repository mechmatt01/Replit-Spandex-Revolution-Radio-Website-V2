/* PHASE 5: Live Chat (Click-to-Open) */
import React, { useState, useEffect } from 'react';

const LiveChat = ({ isShowLive }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Requirement: Chat only accessible when show is live
  if (!isShowLive) return null; 

  return (
    <div className="live-chat-wrapper">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window uniform-box">
          <div className="chat-header">
            <h4>Live Chat</h4>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>
          <div className="chat-body">
            <p>Welcome to the live stream!</p>
            {/* Embed your chat iframe or component here */}
          </div>
        </div>
      )}

      {/* Bubble Button */}
      {!isOpen && (
        <button className="chat-bubble" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      <style>{`
        .live-chat-wrapper { position: fixed; bottom: 80px; right: 20px; z-index: 999; }
        .chat-bubble { 
          width: 50px; height: 50px; border-radius: 50%; 
          background: var(--accent-color); border: none; font-size: 24px; cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .chat-window {
          width: 300px; height: 400px; background: var(--bg-secondary);
          position: absolute; bottom: 0; right: 0;
          display: flex; flex-direction: column;
        }
        .chat-header { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
      `}</style>
    </div>
  );
};

export default LiveChat;