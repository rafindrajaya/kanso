/**
 * Retro 8-Bit Web Audio API Sound Chimes (Zero external dependencies)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * 8-Bit Quest Complete Blip (Retro coin / check sound)
 */
export function playQuestCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  // Pitch jumps from E5 to B5 for positive retro feedback
  osc.frequency.setValueAtTime(659.25, now);
  osc.frequency.setValueAtTime(987.77, now + 0.08);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * 8-Bit Wizard Level Up Fanfare (Classic RPG Arpeggio)
 */
export function playLevelUpSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Notes: C5, E5, G5, C6 (classic victory arpeggio)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const startTime = ctx.currentTime;

  notes.forEach((freq, index) => {
    const noteTime = startTime + index * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index === notes.length - 1 ? 'triangle' : 'square';
    osc.frequency.setValueAtTime(freq, noteTime);

    const duration = index === notes.length - 1 ? 0.35 : 0.09;
    gain.gain.setValueAtTime(0.1, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + duration);
  });
}
