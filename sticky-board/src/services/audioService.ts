let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;

async function loadSound(): Promise<void> {
  try {
    audioContext = new AudioContext();
    const response = await fetch('/drop-sound.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    // AudioContext unavailable, fetch failed, or decode failed — silent no-op
    audioContext = null;
    audioBuffer = null;
  }
}

// Preload at module import time per architecture.md Audio section
const _loadSoundPromise = loadSound();

const audioService = {
  playDrop(): void {
    if (!audioContext || !audioBuffer) return; // not loaded or load failed
    if (audioContext.state !== 'running') return; // user hasn't interacted / context suspended
    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch {
      // Silently no-op on any playback error
    }
  },
};

export { audioService, _loadSoundPromise };
