import { useState, useEffect, useRef } from 'react';
import '../App.css';
import ControlBar from './ControlBar';
import PolyCanvas from './PolyCanvas';
import ArcOverlay from './ArcOverlay';
import useArcManager from '../hooks/useArcManager';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { playHandpanSound, resumeAudio } from '../utils/synthAudioUtils';

function App() {
  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Arc management
  const { 
    arcCount, 
    arcDataRef, 
    startTimeRef, 
    resetArcs, 
    addArcsWithCooldown, 
    maxArcs,
    allPossibleColors
  } = useArcManager({
    initialArcCount: DEFAULT_SETTINGS.initialArcCount,
    maxArcs: DEFAULT_SETTINGS.maxArcs,
    duration: DEFAULT_SETTINGS.duration,
    maxCycles: Math.max(DEFAULT_SETTINGS.maxArcs, 100)
  });
  
  // Add arc update effect
  useEffect(() => {
    // Set up a timer to periodically check if we should add arcs
    const updateInterval = setInterval(() => {
      addArcsWithCooldown();
    }, 100);
    
    return () => clearInterval(updateInterval);
  }, [addArcsWithCooldown]);
  
  // Handle visibility change to disable sound when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSoundEnabled(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Sound toggle handler
  const handleSoundToggle = (enabled = !soundEnabled) => {  
    setSoundEnabled(enabled);
    if (enabled) {
      // Ensure audio context is running when sound is enabled
      resumeAudio();
    }
  };
  
  // Play a note using our enhanced synthetic handpan
  const playNote = (index) => {
    if (soundEnabled) {
      playHandpanSound(index, 0.15);
    }
  };
  
  // Restart handler
  const handleRestart = () => {
    // Reset to initial state
    resetArcs();
  };

  return (
    <>
      <ControlBar 
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        onRestart={handleRestart}
        arcCount={arcCount}
        maxArcs={maxArcs}
      />
      
      <div id="sound-message">
        <p>Click anywhere to toggle sound</p>
      </div>
      
      <PolyCanvas 
        arcData={arcDataRef}
        soundEnabled={soundEnabled}
        playNote={playNote}
        startTime={startTimeRef.current}
        onSoundToggle={handleSoundToggle}
        pulseEnabled={DEFAULT_SETTINGS.pulseEnabled}
        arcCount={arcCount}
      />
      
      {/* Animation overlay for smooth transitions */}
      <ArcOverlay 
        arcCount={arcCount} 
        maxArcs={maxArcs} 
        colors={allPossibleColors}
      />
    </>
  );
}

export default App;