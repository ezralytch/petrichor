import { AUDIO_SETTINGS } from '../constants/settings';

/**
 * Gets the filename for a sound based on the instrument type and index
 * @param {string} instrument - The instrument type
 * @param {number} index - The index of the sound
 * @returns {string} - The filename
 */
export const getFileName = (instrument, index) => {
  if (instrument === "default") return `key-${index}`; 
  return `${instrument}-key-${index}`;
};

/**
 * Gets the full URL for a sound file
 * @param {string} instrument - The instrument type
 * @param {number} index - The index of the sound 
 * @returns {string} - The complete URL
 */
export const getSoundUrl = (instrument, index) => {
  // Use local sounds from the public directory
  return `/sounds/${getFileName(instrument, index)}.wav`;
};

/**
 * Creates an array of audio elements for a set of sounds
 * @param {string} instrument - The instrument type
 * @param {number} count - The number of sounds to create
 * @returns {Array<HTMLAudioElement>} - Array of audio elements
 */
export const createSoundArray = (instrument, count) => {
  return Array(count).fill(null).map((_, index) => {
    const audio = new Audio(getSoundUrl(instrument, index));
    audio.volume = AUDIO_SETTINGS.defaultVolume;
    return audio;
  });
};

/**
 * Plays a sound with the specified index
 * @param {Array<HTMLAudioElement>} sounds - Array of audio elements
 * @param {number} index - The index of the sound to play
 * @param {boolean} enabled - Whether sound is enabled
 */
export const playSound = (sounds, index, enabled = true) => {
  if (!enabled || !sounds[index]) return;
  
  // Clone and play to allow overlapping sounds
  const sound = sounds[index].cloneNode();
  sound.volume = AUDIO_SETTINGS.defaultVolume;
  sound.play().catch(error => console.warn("Error playing sound:", error));
};

export default {
  getFileName,
  getSoundUrl,
  createSoundArray,
  playSound
};