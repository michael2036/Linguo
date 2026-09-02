import { create } from 'zustand';
import type {
  AppState,
  ChapterProgressEntry,
  NativeLanguage,
  ThemePreference,
  Tier,
} from '../types/appState';
import { createInitialAppState, emptyChapterProgress } from '../types/appState';
import { getSyncPending, loadLocalState, saveLocalState, setSyncPending } from '../lib/localStore';
import { computeChapterStatus } from '../lib/scoring';
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

  markVocabCompleted: (chapterId: string, recognitionRate: number) => void;
  recordTierResult: (chapterId: string, tier: Tier, score: number) => void;
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

  markVocabCompleted: (chapterId, recognitionRate) => {
    set((s) => {
      const current = s.state.chapterProgress[chapterId] ?? emptyChapterProgress();
      const updated: ChapterProgressEntry = { ...current, vocabCompleted: recognitionRate >= 80 };
      updated.status = computeChapterStatus(updated);
      return {
        state: touch({
          ...s.state,
          chapterProgress: { ...s.state.chapterProgress, [chapterId]: updated },
        }),
      };
    });
    persistAndMaybeSync(get, set);
  },

  recordTierResult: (chapterId, tier, score) => {
    set((s) => {
      const current = s.state.chapterProgress[chapterId] ?? emptyChapterProgress();
      const prevTier = current.levels[tier];
      const updated: ChapterProgressEntry = {
        ...current,
        levels: {
          ...current.levels,
          [tier]: { completed: true, score, attempts: prevTier.attempts + 1 },
        },
      };
      updated.status = computeChapterStatus(updated);
      return {
        state: touch({
          ...s.state,
          chapterProgress: { ...s.state.chapterProgress, [chapterId]: updated },
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
      state: touch({ ...s.state, vocabularyProgress: {}, chapterProgress: {} }),
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
