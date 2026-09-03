import { create } from 'zustand';
import type {
  AppState,
  LektionProgressEntry,
  NativeLanguage,
  ThemePreference,
  Tier,
} from '../types/appState';
import { createInitialAppState, emptyLektionProgress } from '../types/appState';
import { getSyncPending, loadLocalState, saveLocalState, setSyncPending } from '../lib/localStore';
import { computeLektionStatus } from '../lib/scoring';
import { syncAppState } from '../lib/driveSync';
import { isSignedIn, requestSignIn, signOut as googleSignOut } from '../lib/googleAuth';

interface AppStore {
  state: AppState;
  signedIn: boolean;
  syncing: boolean;
  syncPending: boolean;
  lastSyncError: string | null;

  setTheme: (theme: ThemePreference) => void;
  setNativeLanguage: (lang: NativeLanguage) => void;

  markVocabCompleted: (lektionId: string, recognitionRate: number) => void;
  recordTierResult: (lektionId: string, tier: Tier, score: number) => void;
  recordTestResult: (lektionId: string, score: number) => void;
  resetProgress: () => void;

  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => void;
  syncNow: () => Promise<void>;
}

const persistAndMaybeSync = (get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  saveLocalState(get().state);
  if (get().signedIn) {
    if (navigator.onLine) {
      void get().syncNow();
    } else {
      setSyncPending(true);
      set({ syncPending: true });
    }
  }
};

const touch = (state: AppState): AppState => ({ ...state, updatedAt: new Date().toISOString() });

export const useAppStore = create<AppStore>((set, get) => ({
  state: loadLocalState() ?? createInitialAppState(),
  signedIn: isSignedIn(),
  syncing: false,
  syncPending: getSyncPending(),
  lastSyncError: null,

  setTheme: (theme) => {
    set((s) => ({ state: touch({ ...s.state, preferences: { ...s.state.preferences, theme } }) }));
    persistAndMaybeSync(get, set);
  },

  setNativeLanguage: (nativeLanguage) => {
    set((s) => ({
      state: touch({ ...s.state, preferences: { ...s.state.preferences, nativeLanguage } }),
    }));
    persistAndMaybeSync(get, set);
  },

  markVocabCompleted: (lektionId, recognitionRate) => {
    set((s) => {
      const current = s.state.lektionProgress[lektionId] ?? emptyLektionProgress();
      const updated: LektionProgressEntry = { ...current, vocabCompleted: recognitionRate >= 80 };
      updated.status = computeLektionStatus(updated);
      return {
        state: touch({
          ...s.state,
          lektionProgress: { ...s.state.lektionProgress, [lektionId]: updated },
        }),
      };
    });
    persistAndMaybeSync(get, set);
  },

  recordTierResult: (lektionId, tier, score) => {
    set((s) => {
      const current = s.state.lektionProgress[lektionId] ?? emptyLektionProgress();
      const prevTier = current.practice[tier];
      const updated: LektionProgressEntry = {
        ...current,
        practice: {
          ...current.practice,
          [tier]: { completed: true, score, attempts: prevTier.attempts + 1 },
        },
      };
      updated.status = computeLektionStatus(updated);
      return {
        state: touch({
          ...s.state,
          lektionProgress: { ...s.state.lektionProgress, [lektionId]: updated },
        }),
      };
    });
    persistAndMaybeSync(get, set);
  },

  // Direct Test Mode result — independent of `practice`, per PRD Phase 3.
  // Tracks the best score across attempts; a high enough score alone can
  // fast-track the Lektion to Green (see computeLektionStatus).
  recordTestResult: (lektionId, score) => {
    set((s) => {
      const current = s.state.lektionProgress[lektionId] ?? emptyLektionProgress();
      const updated: LektionProgressEntry = {
        ...current,
        test: {
          attempted: true,
          bestScore: Math.max(current.test.bestScore, score),
          attempts: current.test.attempts + 1,
        },
      };
      updated.status = computeLektionStatus(updated);
      return {
        state: touch({
          ...s.state,
          lektionProgress: { ...s.state.lektionProgress, [lektionId]: updated },
        }),
      };
    });
    persistAndMaybeSync(get, set);
  },

  // Explicit user action from Settings — clears learning progress only,
  // never preferences. Distinct from disconnecting Google (FR-03), which
  // must never implicitly wipe local data.
  resetProgress: () => {
    set((s) => ({
      state: touch({ ...s.state, vocabularyProgress: {}, lektionProgress: {} }),
    }));
    persistAndMaybeSync(get, set);
  },

  connectGoogle: async () => {
    await requestSignIn();
    set({ signedIn: true });
    await get().syncNow();
  },

  disconnectGoogle: () => {
    googleSignOut();
    set({ signedIn: false, syncPending: false });
    setSyncPending(false);
  },

  syncNow: async () => {
    if (!get().signedIn) return;
    set({ syncing: true, lastSyncError: null });
    const result = await syncAppState(get().state);
    if (result.ok && result.resolvedState) {
      set({ state: result.resolvedState, syncing: false, syncPending: false });
      saveLocalState(result.resolvedState);
      setSyncPending(false);
    } else {
      // Fails silently for the user (FR-05); pending flag stays set so the
      // next `online` event or manual retry can flush again.
      set({ syncing: false, lastSyncError: result.error ?? 'unknown-error', syncPending: true });
      setSyncPending(true);
    }
  },
}));

window.addEventListener('online', () => {
  const store = useAppStore.getState();
  if (store.signedIn && store.syncPending) {
    void store.syncNow();
  }
});
