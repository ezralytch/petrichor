import React from 'react';

/**
 * ControlBar component for app settings and controls
 * @param {Object} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const ControlBar = ({ 
  soundEnabled, 
  onSoundToggle, 
  onRestart, 
  arcCount, 
  maxArcs
}) => {
  return (
    <div id="control-bar-wrapper">
      <div id="control-bar">
        <button 
          id="sound-toggle" 
          className="toggle" 
          type="button" 
          data-toggled={soundEnabled.toString()} 
          onClick={() => onSoundToggle()} 
          title="Toggle Sound"
        >
          <i className="fa-solid fa-music-slash off"></i>
          <i className="fa-solid fa-music on"></i>
        </button>
        
        <div className="arc-counter">
          Arcs: {arcCount}/{maxArcs}
        </div>
        
        <button 
          id="restart-button"
          className="toggle" 
          type="button" 
          onClick={onRestart}
          title="Restart Animation"
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;