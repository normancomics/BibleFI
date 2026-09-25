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

  // Sonar-style ping: pure sine, gentle pitch fall, long decay, and a soft echo.
  const playTone = useCallback(
    (ctx: AudioContext, soundName: string) => {
      const base = FREQUENCIES[soundName] ?? 1200;
      const ping = (delay: number, level: number) => {
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2400;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 0.94, t + 1.2);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(level, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.45);
      };
      ping(0, 0.3);
      ping(0.35, 0.08); // distant echo
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
          playTone(ctx, soundName);
        } catch {
          /* audio blocked by the browser — stay silent rather than throw */
        }
      })();
    },
    [getContext, playTone],
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
