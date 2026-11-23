import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  playSound: (soundName: string) => void;
  userInteracted: boolean;
  setUserInteracted: (interacted: boolean) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

const STORAGE_KEY = 'biblefi_sound_enabled';

/** Retro-arcade sample files shipped in /public/sounds. */
const SOUND_FILES: Record<string, string> = {
  click: '/sounds/click.wav',
  select: '/sounds/select.wav',
  coin: '/sounds/coin.wav',
  scroll: '/sounds/scroll.wav',
  powerup: '/sounds/powerup.wav',
  success: '/sounds/success.wav',
  error: '/sounds/error.wav',
};


interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEY) !== 'false';
  });
  const [userInteracted, setUserInteracted] = useState(false);

  // iOS/iPadOS Safari allows only a handful of AudioContexts per page and keeps
  // any context created outside a user gesture suspended forever — so we keep a
  // SINGLE shared context and unlock it on the first touch/click/keypress.
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const enabledRef = useRef(isEnabled);
  enabledRef.current = isEnabled;

  const setIsEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      /* private browsing — preference simply is not remembered */
    }
  }, []);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) {
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const loadBuffer = useCallback(
    async (soundName: string): Promise<AudioBuffer | null> => {
      const ctx = getContext();
      const url = SOUND_FILES[soundName];
      if (!ctx || !url) return null;
      const cached = buffersRef.current.get(soundName);
      if (cached) return cached;
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const bytes = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(bytes);
        buffersRef.current.set(soundName, buffer);
        return buffer;
      } catch {
        return null;
      }
    },
    [getContext],
  );

  const lastPlayRef = useRef<Map<string, number>>(new Map());
  const MIN_INTERVAL_MS = 90;

  // Guard shared by both sample playback and the synthesized fallback so
  // rapid taps/hovers can never stack sounds on top of each other.
  const shouldPlay = useCallback((soundName: string): boolean => {
    const now = performance.now();
    const last = lastPlayRef.current.get(soundName) ?? 0;
    if (now - last < MIN_INTERVAL_MS) return false;
    lastPlayRef.current.set(soundName, now);
    return true;
  }, []);

  // Synthesized fallback: retro 8-bit arcade blips (square waves, stepped
  // pitch), used only when a sample file cannot be loaded/decoded.
  const playTone = useCallback(
    (ctx: AudioContext, soundName: string) => {
      const t0 = ctx.currentTime;

      // Each sound is a list of [frequency, duration, volume] steps.
      // Classic NES-style square wave, stepped pitches, no echo.
      const RECIPES: Record<string, Array<[number, number, number]>> = {
        click: [[880, 0.05, 0.12]],
        select: [
          [660, 0.04, 0.12],
          [990, 0.06, 0.12],
        ],
        coin: [
          [988, 0.06, 0.14],
          [1319, 0.16, 0.14],
        ],
        scroll: [[440, 0.04, 0.08]],
        powerup: [
          [523, 0.05, 0.12],
          [659, 0.05, 0.12],
          [784, 0.05, 0.12],
          [1047, 0.1, 0.12],
        ],
        success: [
          [523, 0.06, 0.13],
          [659, 0.06, 0.13],
          [784, 0.06, 0.13],
          [1047, 0.12, 0.13],
        ],
        error: [
          [330, 0.08, 0.14],
          [220, 0.12, 0.14],
        ],
      };
      const steps = RECIPES[soundName] ?? [[988, 0.05, 0.12]];

      let t = t0;
      for (const [freq, dur, vol] of steps) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.setValueAtTime(vol, t + dur * 0.7);
        // Tiny 10ms tail so steps don't click against each other.
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.01);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
        t += dur;
      }
    },
    [],
  );

  const playSound = useCallback(
    (soundName: string) => {
      if (!enabledRef.current) return;
      const ctx = getContext();
      if (!ctx) return;
      if (!shouldPlay(soundName)) return;

      void (async () => {
        try {
          // Safari suspends the context between gestures; resume every time.
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          // Preferred path: the real retro pixel samples in /public/sounds.
          const buffer = await loadBuffer(soundName);
          if (buffer) {
            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            source.buffer = buffer;
            gain.gain.value = 0.35;
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(0);
            return;
          }
          // Fallback: synthesized retro blip if the sample is unavailable.
          playTone(ctx, soundName);
        } catch {
          /* audio blocked by the browser — stay silent rather than throw */
        }
      })();
    },
    [getContext, loadBuffer, playTone, shouldPlay],
  );

  // Unlock audio on the first gesture (required on iPad/iPhone/Safari).
  useEffect(() => {
    const unlock = () => {
      setUserInteracted(true);
      const ctx = getContext();
      if (!ctx) return;
      void ctx.resume().catch(() => undefined);
      // A zero-length silent buffer is what actually flips iOS out of its
      // "muted until a gesture plays something" state.
      try {
        const source = ctx.createBufferSource();
        source.buffer = ctx.createBuffer(1, 1, 22050);
        source.connect(ctx.destination);
        source.start(0);
      } catch {
        /* ignore */
      }
      // Warm the most common samples so the first real sound is instant.
      void loadBuffer('click');
      void loadBuffer('success');
    };

    const events: Array<keyof DocumentEventMap> = ['pointerdown', 'touchstart', 'keydown', 'click'];
    events.forEach((e) => document.addEventListener(e, unlock, { once: true, passive: true }));
    return () => events.forEach((e) => document.removeEventListener(e, unlock));
  }, [getContext, loadBuffer]);

  const toggleSound = useCallback(() => setIsEnabled(!enabledRef.current), [setIsEnabled]);

  const value = useMemo(
    () => ({
      isEnabled,
      setIsEnabled,
      playSound,
      userInteracted,
      setUserInteracted,
      isSoundEnabled: isEnabled,
      toggleSound,
    }),
    [isEnabled, setIsEnabled, playSound, userInteracted, toggleSound],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

// Default export for backward compatibility
const SoundInitializer: React.FC = () => null;

export default SoundInitializer;
