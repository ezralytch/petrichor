/**
 * Enhanced handpan sound generator using Web Audio API with heavy reverb and delay
 */

// Audio context singleton
let audioContext = null;

// Audio effects nodes
let reverbNode = null;
let delayNode = null;

// Initialize audio context on first use
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    setupEffectsChain();
  }
  return audioContext;
};

/**
 * Setup global audio effects chain
 */
const setupEffectsChain = () => {
  const ctx = getAudioContext();
  
  // Create effects only once
  if (!reverbNode) {
    // Create reverb with longer decay
    reverbNode = ctx.createConvolver();
    createReverb(reverbNode, 3.5); // Much longer reverb (3.5 seconds)
    
    // Create delay with math-rock style multiple repeats
    delayNode = ctx.createDelay(2.0); // Longer max delay time
    delayNode.delayTime.value = 0.375; // Dotted eighth note feel at 120bpm
    
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.65; // Much higher feedback for more repeats
    
    // Create a filter to darken successive repeats
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 3000;
    delayFilter.Q.value = 1.0;
    
    // Connect in a loop with filter
    delayNode.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delayNode);
  }
};

/**
 * Create a rich reverb impulse response
 * @param {ConvolverNode} convolverNode - The convolver node to set
 * @param {number} duration - Duration of reverb tail in seconds
 */
const createReverb = (convolverNode, duration = 3.5) => {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const length = duration * sampleRate; // 3.5 seconds reverb tail
  const impulse = ctx.createBuffer(2, length, sampleRate);
  
  // Fill both channels with noise that decays exponentially
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      // Create a more complex reverb shape with early reflections and slower decay
      let decay;
      
      if (i < 0.1 * sampleRate) {
        // Early reflections (first 100ms)
        decay = Math.exp(-i / (sampleRate * 0.05));
      } else {
        // Long tail with slower decay
        decay = Math.exp(-i / (sampleRate * 0.8)); 
      }
      
      // Add some randomness to create a more natural sound
      impulseData[i] = (Math.random() * 2 - 1) * decay;
      
      // Add some gentle modulation
      if (i > 0.2 * sampleRate) {
        impulseData[i] *= 1 + (0.03 * Math.sin(i / (sampleRate * 0.05)));
      }
    }
  }
  
  convolverNode.buffer = impulse;
};

/**
 * Handpan scale frequencies
 * These frequencies represent a D minor handpan scale (common tuning)
 * Feel free to adjust these to create different scales
 */
const HANDPAN_FREQUENCIES = [
  146.83, // D3
  174.61, // F3
  196.00, // G3
  220.00, // A3
  293.66, // D4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  587.33, // D5
];

/**
 * Creates a synthetic handpan sound with heavy effects
 * @param {number} index - Index of the note to play (maps to the scale)
 * @param {number} volume - Volume between 0 and 1
 * @returns {Object} - Audio nodes for further manipulation
 */
export const createHandpanSound = (index, volume = 0.15) => {
  const ctx = getAudioContext();
  
  // Select frequency from our scale (wrap around if index is larger than scale)
  const frequency = HANDPAN_FREQUENCIES[index % HANDPAN_FREQUENCIES.length];
  
  // If the index is higher than our scale length, go up an octave
  const octave = Math.floor(index / HANDPAN_FREQUENCIES.length);
  const adjustedFrequency = frequency * Math.pow(2, octave);
  
  // Create oscillators for rich sound (handpans have multiple harmonics)
  const fundamental = ctx.createOscillator();
  fundamental.type = 'sine';
  fundamental.frequency.value = adjustedFrequency;
  
  // First harmonic (adds character)
  const harmonic1 = ctx.createOscillator();
  harmonic1.type = 'sine';
  harmonic1.frequency.value = adjustedFrequency * 2.0; // One octave up
  
  // Second harmonic (adds shimmer)
  const harmonic2 = ctx.createOscillator();
  harmonic2.type = 'sine';
  harmonic2.frequency.value = adjustedFrequency * 3.0; // Octave + fifth
  
  // Gain nodes for envelope and mixing
  const fundamentalGain = ctx.createGain();
  const harmonic1Gain = ctx.createGain();
  const harmonic2Gain = ctx.createGain();
  const masterGain = ctx.createGain();
  
  // Connect oscillators to individual gain nodes
  fundamental.connect(fundamentalGain);
  harmonic1.connect(harmonic1Gain);
  harmonic2.connect(harmonic2Gain);
  
  // Set relative harmonic volumes
  fundamentalGain.gain.value = 0.6;
  harmonic1Gain.gain.value = 0.3;
  harmonic2Gain.gain.value = 0.1;
  
  // Connect harmonic gains to master gain
  fundamentalGain.connect(masterGain);
  harmonic1Gain.connect(masterGain);
  harmonic2Gain.connect(masterGain);
  
  // Initialize master volume
  masterGain.gain.value = 0;
  
  // Create 8-bit effect with bit crusher
  const bitCrusherNode = ctx.createWaveShaper();
  
  // Create a curve that approximates bit reduction
  const bits = 5; // Lower bit depth for more pronounced effect
  const samples = 44100;
  const curve = new Float32Array(samples);
  const step = Math.pow(0.5, bits);
  
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * 2 - 1;
    curve[i] = Math.round(x / step) * step;
  }
  
  bitCrusherNode.curve = curve;
  
  // Create a dry/wet mix for the bit crusher effect
  const dryGain = ctx.createGain();
  const wetGain = ctx.createGain();
  
  dryGain.gain.value = 0.3; // 30% dry signal
  wetGain.gain.value = 0.7; // 70% wet/bitcrushed signal
  
  // Split the signal
  masterGain.connect(dryGain); // Dry path
  masterGain.connect(bitCrusherNode); // Wet path
  bitCrusherNode.connect(wetGain);
  
  // Create effects chain mixer
  const effectsMixer = ctx.createGain();
  dryGain.connect(effectsMixer);
  wetGain.connect(effectsMixer);
  
  // Create effect sends with dedicated gain nodes
  const reverbSend = ctx.createGain();
  const delaySend = ctx.createGain();
  const directGain = ctx.createGain();
  
  // Set very wet mix with reverb and delay prominent
  reverbSend.gain.value = 0.8;  // 80% reverb send
  delaySend.gain.value = 0.4;   // 60% delay send
  directGain.gain.value = 0.3;  // Reduced direct signal for effect balance
  
  // Connect to effect sends
  effectsMixer.connect(reverbSend);
  effectsMixer.connect(delaySend);
  effectsMixer.connect(directGain);
  
  // Connect sends to effects
  reverbSend.connect(reverbNode);
  delaySend.connect(delayNode);
  
  // Connect effects and direct output to destination
  reverbNode.connect(ctx.destination);
  delayNode.connect(ctx.destination);
  directGain.connect(ctx.destination);
  
  // Start all oscillators
  const now = ctx.currentTime;
  fundamental.start(now);
  harmonic1.start(now);
  harmonic2.start(now);
  
  // Envelope: attack
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.02);
  
  // Envelope: decay and sustain
  masterGain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.1);
  masterGain.gain.exponentialRampToValueAtTime(volume * 0.3, now + 1.0);
  
  // Envelope: long release (handpans have long sustain)
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
  
  // Schedule oscillator stop
  fundamental.stop(now + 3.1);
  harmonic1.stop(now + 3.1);
  harmonic2.stop(now + 3.1);
  
  // Handle cleanup after the sound is done
  setTimeout(() => {
    fundamental.disconnect();
    harmonic1.disconnect();
    harmonic2.disconnect();
    fundamentalGain.disconnect();
    harmonic1Gain.disconnect();
    harmonic2Gain.disconnect();
    masterGain.disconnect();
    bitCrusherNode.disconnect();
    dryGain.disconnect();
    wetGain.disconnect();
    effectsMixer.disconnect();
    reverbSend.disconnect();
    delaySend.disconnect();
    directGain.disconnect();
  }, 3200);
  
  return {
    oscillators: [fundamental, harmonic1, harmonic2],
    masterGain
  };
};

/**
 * Play a handpan sound
 * @param {number} index - Index of the note to play
 * @param {number} volume - Volume between 0 and 1
 */
export const playHandpanSound = (index, volume = 0.15) => {
  createHandpanSound(index, volume);
};

// Resume audio context if it was suspended (needed for browsers that require user interaction)
export const resumeAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

export default {
  playHandpanSound,
  createHandpanSound,
  resumeAudio,
  getAudioContext
};