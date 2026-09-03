import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular, BookOpen24Filled, ChevronRight24Regular, RocketFilled } from '@fluentui/react-icons';
import type { ExerciseItem, VocabularyItem } from '../types/content';
import { useAppStore } from '../store/appState';
import { buildVocabPool, normalizeTermKey } from '../lib/vocabPool';
import { isMastered, pickPracticeQueue, pickTestQueue } from '../lib/vocabSrs';
import { buildVocabQuizItems } from '../lib/vocabQuiz';
import { DEFAULT_SESSION_SIZE, PRACTICE_XP_PER_CORRECT, TEST_XP_PER_CORRECT } from '../lib/vocabGame';
import { VocabFlashcards } from '../components/vocab/VocabFlashcards';
import { ExerciseRunner } from '../components/exercises/ExerciseRunner';
import { CurriculumSelectTree } from '../components/vocabTrainer/CurriculumSelectTree';
import { VocabGameStats } from '../components/vocabTrainer/VocabGameStats';
import { ScoreRing } from '../components/badges/ScoreRing';
import { Confetti } from '../components/celebration/Confetti';
import { LinguoAvatar } from '../components/mascot/LinguoAvatar';
import type { LinguoExpression } from '../components/mascot/linguoExpressions';

type Stage = 'select' | 'mode-select' | 'practice' | 'test' | 'result';
type ResultMode = 'practice' | 'test';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('18px'),
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.gap('6px'),
  },
  eyebrow: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '520px',
  },
  footerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    ...shorthands.gap('12px'),
    ...shorthands.padding('14px', '16px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  selectionCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('14px'),
    marginTop: '8px',
    '@media (min-width: 560px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  modeCard: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
    ...shorthands.padding('20px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    minHeight: '44px',
    textAlign: 'left',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  modeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  modeTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: tokens.fontSizeBase500,
  },
  modeBody: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap('18px'),
    paddingTop: '40px',
    paddingBottom: '24px',
    textAlign: 'center',
  },
  resultHeadline: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  resultActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    ...shorthands.gap('12px'),
  },
});

// Bulk vocabulary trainer: aggregates vocab across a user-chosen slice of
// the curriculum (whole Level, specific Moduln, or individual Lektionen),
// then drills it in two modes. Practice queues are ordered by an adaptive
// Leitner-box priority (lib/vocabSrs.ts) so the "intelligent" part of
// learning-assessment lives in *which* words surface, not in a separate
// mode — Test always samples the full pool for a broad, unweighted check.
export const VocabTrainerPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const vocabTrainer = useAppStore((s) => s.state.vocabTrainer);
  const recordVocabAnswer = useAppStore((s) => s.recordVocabAnswer);
  const finishVocabSession = useAppStore((s) => s.finishVocabSession);

  const [stage, setStage] = useState<Stage>('select');
  const [selectedLektionIds, setSelectedLektionIds] = useState<Set<string>>(new Set());
  const [pool, setPool] = useState<VocabularyItem[] | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);

  const [activeQueue, setActiveQueue] = useState<VocabularyItem[]>([]);
  const [quizItems, setQuizItems] = useState<ExerciseItem[]>([]);
  const quizKeyById = useRef<Record<string, string>>({});

  const [resultMode, setResultMode] = useState<ResultMode | null>(null);
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [bestStreakDisplay, setBestStreakDisplay] = useState(0);

  // Session-local counters read synchronously inside the same click-handler
  // chain that flashcards/exercise items fire (onCardComplete/onItemComplete
  // both run before the round's own onComplete, in the same tick) — regular
  // state would still read stale there, so these are refs instead.
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);

  const masteredCount = useMemo(
    () => (pool ? pool.filter((item) => isMastered(vocabTrainer.words[normalizeTermKey(item.term)])).length : 0),
    [pool, vocabTrainer.words],
  );

  const handleContinueFromSelect = async () => {
    setPoolLoading(true);
    const items = await buildVocabPool(selectedLektionIds);
    setPool(items);
    setPoolLoading(false);
    setStage('mode-select');
  };

  const resetSessionCounters = () => {
    streakRef.current = 0;
    bestStreakRef.current = 0;
    setXpEarned(0);
  };

  const startPractice = () => {
    if (!pool) return;
    resetSessionCounters();
    setActiveQueue(
      pickPracticeQueue(pool, vocabTrainer.words, (item) => normalizeTermKey(item.term), DEFAULT_SESSION_SIZE),
    );
    setStage('practice');
  };

  const startTest = () => {
    if (!pool) return;
    resetSessionCounters();
    const queue = pickTestQueue(pool, DEFAULT_SESSION_SIZE);
    const built = buildVocabQuizItems(queue, pool);
    setQuizItems(built.items);
    quizKeyById.current = built.termKeyById;
    setStage('test');
  };

  const bumpStreak = (correct: boolean) => {
    streakRef.current = correct ? streakRef.current + 1 : 0;
    bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
  };

  const handlePracticeCard = (item: VocabularyItem, known: boolean) => {
    recordVocabAnswer(normalizeTermKey(item.term), known, PRACTICE_XP_PER_CORRECT);
    if (known) setXpEarned((xp) => xp + PRACTICE_XP_PER_CORRECT);
    bumpStreak(known);
  };

  const handleQuizItem = (item: ExerciseItem, correct: boolean) => {
    const key = quizKeyById.current[item.id];
    if (!key) return;
    recordVocabAnswer(key, correct, TEST_XP_PER_CORRECT);
    if (correct) setXpEarned((xp) => xp + TEST_XP_PER_CORRECT);
    bumpStreak(correct);
  };

  const finishSession = (mode: ResultMode, score: number) => {
    finishVocabSession(bestStreakRef.current);
    setBestStreakDisplay(bestStreakRef.current);
    setResultMode(mode);
    setResultScore(score);
    setStage('result');
  };

  if (stage === 'practice') {
    return (
      <VocabFlashcards
        items={activeQueue}
        onCardComplete={handlePracticeCard}
        onComplete={(rate) => finishSession('practice', rate)}
      />
    );
  }

  if (stage === 'test') {
    return (
      <ExerciseRunner
        tierLabel="Wortschatz-Test"
        items={quizItems}
        onItemComplete={handleQuizItem}
        onComplete={(score) => finishSession('test', score)}
      />
    );
  }

  if (stage === 'result' && resultMode) {
    const celebrate = resultScore === 100 || bestStreakDisplay >= 10;
    const linguoExpression: LinguoExpression = celebrate ? 'celebrating' : (resultScore ?? 0) >= 60 ? 'happy' : 'encouraging';
    return (
      <div className={styles.resultWrap} role="status" aria-live="polite">
        {celebrate && <Confetti />}
        <LinguoAvatar expression={linguoExpression} size={88} animate="pop" />
        <ScoreRing percent={resultScore ?? 0} />
        <Text className={styles.resultHeadline} as="h1" size={600}>
          {resultMode === 'practice' ? 'Runde geschafft!' : 'Test abgeschlossen!'}
        </Text>
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          +{xpEarned} XP{bestStreakDisplay >= 3 ? ` · Beste Serie: ${bestStreakDisplay}` : ''}
        </Text>
        <VocabGameStats trainer={vocabTrainer} masteredCount={masteredCount} poolSize={pool?.length ?? 0} />
        <div className={styles.resultActions}>
          <Button
            appearance="primary"
            icon={<RocketFilled />}
            onClick={() => (resultMode === 'practice' ? startPractice() : startTest())}
          >
            Noch eine Runde
          </Button>
          <Button appearance="outline" onClick={() => setStage('select')}>
            Auswahl ändern
          </Button>
          <Button appearance="subtle" onClick={() => navigate('/')}>
            Fertig
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'mode-select' && pool) {
    const sessionSize = Math.min(DEFAULT_SESSION_SIZE, pool.length);
    return (
      <div className={styles.wrap}>
        <Button
          className={styles.backButton}
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          onClick={() => setStage('select')}
        >
          Auswahl ändern
        </Button>

        <div className={styles.titleBlock}>
          <Text className={styles.eyebrow}>Wortschatz-Trainer</Text>
          <Text className={styles.title} as="h1" size={700}>
            {pool.length} Wörter im Pool
          </Text>
        </div>

        <VocabGameStats trainer={vocabTrainer} masteredCount={masteredCount} poolSize={pool.length} />

        <div className={styles.modeGrid}>
          <button className={styles.modeCard} onClick={startPractice}>
            <span className={styles.modeIcon}>
              <BookOpen24Filled />
            </span>
            <Text className={styles.modeTitle}>Übung</Text>
            <Text className={styles.modeBody}>
              {sessionSize} Karteikarten — die App wählt automatisch, welche Wörter du am dringendsten
              wiederholen musst.
            </Text>
          </button>
          <button className={styles.modeCard} onClick={startTest}>
            <span className={styles.modeIcon}>
              <RocketFilled />
            </span>
            <Text className={styles.modeTitle}>Test</Text>
            <Text className={styles.modeBody}>
              {sessionSize} Multiple-Choice-Fragen, zufällig aus dem gesamten Pool — ideal, um deinen Stand
              zu checken.
            </Text>
          </button>
        </div>
      </div>
    );
  }

  // stage === 'select'
  const selectedCount = selectedLektionIds.size;
  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
        Start
      </Button>

      <div className={styles.titleBlock}>
        <Text className={styles.eyebrow}>Wortschatz-Trainer</Text>
        <Text className={styles.title} as="h1" size={700}>
          Wähle deinen Lernbereich
        </Text>
        <Text className={styles.subtitle}>
          Wähle ein ganzes Level, einzelne Module oder Lektionen — der Wortschatz wird automatisch
          zusammengeführt und Duplikate entfernt.
        </Text>
      </div>

      <CurriculumSelectTree selected={selectedLektionIds} onChange={setSelectedLektionIds} />

      <div className={styles.footerBar}>
        <Text className={styles.selectionCount}>
          {selectedCount} Lektion{selectedCount === 1 ? '' : 'en'} ausgewählt
        </Text>
        <Button
          appearance="primary"
          disabled={selectedCount === 0 || poolLoading}
          icon={poolLoading ? <Spinner size="tiny" /> : <ChevronRight24Regular />}
          onClick={handleContinueFromSelect}
        >
          {poolLoading ? 'Lädt…' : 'Weiter'}
        </Button>
      </div>
    </div>
  );
};
