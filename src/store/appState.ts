import { create } from 'zustand';
import type {
  AppState,
  LektionProgressEntry,
  NativeLanguage,
  ThemePreference,
  Tier,
} from '../types/appState';
import { createInitialAppState, emptyLektionProgress, emptyVocabTrainerState } from '../types/appState';
import { getSyncPending, loadLocalState, saveLocalState, setSyncPending } from '../lib/localStore';
import { computeLektionStatus } from '../lib/scoring';
import { applyAnswer } from '../lib/vocabSrs';
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
  recordVocabAnswer: (termKey: string, correct: boolean, xpOnCorrect: number) => void;
  finishVocabSession: (bestStreakInSession: number) => void;
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

  // Wortschatz-Trainer per-word result — updates that word's Leitner box
  // (see lib/vocabSrs.ts) and awards XP on a correct answer. `termKey` is
  // the normalized-term identity from lib/vocabPool.ts, not a vocabulary
  // item id (those aren't globally unique).
  recordVocabAnswer: (termKey, correct, xpOnCorrect) => {
    set((s) => {
      const trainer = s.state.vocabTrainer;
      const nextWord = applyAnswer(trainer.words[termKey], correct);
      return {
        state: touch({
          ...s.state,
          vocabTrainer: {
            ...trainer,
            words: { ...trainer.words, [termKey]: nextWord },
            xp: trainer.xp + (correct ? xpOnCorrect : 0),
          },
        }),
      };
    });
    persistAndMaybeSync(get, set);
  },

  // Called once per finished practice/test round: records the session and
  // rolls the daily streak forward (consecutive calendar days with at least
  // one round played), resetting it if a day was missed.
  finishVocabSession: (bestStreakInSession) => {
    set((s) => {
      const trainer = s.state.vocabTrainer;
      const today = new Date().toISOString().slice(0, 10);
      let dailyStreak: number;
      if (trainer.lastPracticeDate === today) {
        dailyStreak = trainer.dailyStreak;
      } else if (trainer.lastPracticeDate) {
        const diffDays = Math.round(
          (new Date(`${today}T00:00:00`).getTime() - new Date(`${trainer.lastPracticeDate}T00:00:00`).getTime()) /
            86_400_000,
        );
        dailyStreak = diffDays === 1 ? trainer.dailyStreak + 1 : 1;
      } else {
        dailyStreak = 1;
      }
      return {
        state: touch({
          ...s.state,
          vocabTrainer: {
            ...trainer,
            sessionsCompleted: trainer.sessionsCompleted + 1,
            bestSessionStreak: Math.max(trainer.bestSessionStreak, bestStreakInSession),
            lastPracticeDate: today,
            dailyStreak,
          },
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
      state: touch({
        ...s.state,
        vocabularyProgress: {},
        lektionProgress: {},
        vocabTrainer: emptyVocabTrainerState(),
      }),
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
