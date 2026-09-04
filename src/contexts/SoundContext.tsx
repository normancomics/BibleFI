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
  click: '/sounds/click.mp3',
  select: '/sounds/select.mp3',
  coin: '/sounds/coin.mp3',
  scroll: '/sounds/scroll.mp3',
  powerup: '/sounds/powerup.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

/** Fallback tones when a sample is unavailable. */
const FREQUENCIES: Record<string, number> = {
  click: 700,
  select: 800,
  coin: 1200,
  scroll: 600,
  powerup: 1500,
  success: 1000,
  error: 400,
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

  const playTone = useCallback(
    (ctx: AudioContext, soundName: string) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(FREQUENCIES[soundName] ?? 800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    },
    [],
  );

  const playSound = useCallback(
    (soundName: string) => {
      if (!enabledRef.current) return;
      const ctx = getContext();
      if (!ctx) return;

      void (async () => {
        try {
          // Safari suspends the context between gestures; resume every time.
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          const buffer = await loadBuffer(soundName);
          if (buffer) {
            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            gain.gain.value = 0.6;
            source.buffer = buffer;
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(0);
          } else {
            playTone(ctx, soundName);
          }
        } catch {
          /* audio blocked by the browser — stay silent rather than throw */
        }
      })();
    },
    [getContext, loadBuffer, playTone],
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
