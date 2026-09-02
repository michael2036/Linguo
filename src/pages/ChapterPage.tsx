import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Spinner,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  BookOpen24Filled,
  CheckmarkCircle24Filled,
  ChevronRight24Regular,
  LockClosed20Filled,
  SparkleFilled,
} from '@fluentui/react-icons';
import { CHAPTER_CATALOG, loadChapter } from '../lib/chapterLoader';
import type { ChapterPackage } from '../types/chapter';
import type { Tier } from '../types/appState';
import { useAppStore } from '../store/appState';
import { isTierUnlocked } from '../lib/scoring';
import { emptyChapterProgress } from '../types/appState';
import { VocabFlashcards } from '../components/vocab/VocabFlashcards';
import { ExerciseRunner } from '../components/exercises/ExerciseRunner';
import { TrafficLightBadge } from '../components/badges/TrafficLightBadge';
import { ScoreRing } from '../components/badges/ScoreRing';
import { Confetti } from '../components/celebration/Confetti';

type Stage = 'overview' | 'vocab' | Tier | 'result';

const TIER_LABELS: Record<Tier, string> = {
  easy: 'Stufe 1 · Grundlagen',
  medium: 'Stufe 2 · Anwendung',
  hard: 'Stufe 3 · Meisterschaft',
};

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('18px'),
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '48px',
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
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  focusChips: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('6px'),
    marginTop: '2px',
  },
  focusChip: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('3px', '9px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
  },
  stageList: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
  },
  stageRow: {
    display: 'flex',
    ...shorthands.gap('14px'),
  },
  stageRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '36px',
    flexShrink: 0,
  },
  stageNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground3,
  },
  stageNodeUnlocked: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  stageNodeDone: {
    ...shorthands.border('2px', 'solid', tokens.colorPaletteGreenBorder2),
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  stageConnector: {
    width: '2px',
    flex: 1,
    minHeight: '24px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  stageConnectorDone: {
    backgroundColor: tokens.colorPaletteGreenBorder2,
  },
  stageCard: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    ...shorthands.padding('16px'),
    marginBottom: '14px',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '44px',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationFaster,
  },
  stageCardUnlocked: {
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: tokens.shadow4,
    },
  },
  stageCardLocked: {
    opacity: 0.6,
  },
  stageTextBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  stageLabel: {
    fontWeight: 600,
  },
  stageSub: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  stageScore: {
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
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
});

export const ChapterPage = () => {
  const styles = useStyles();
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [pack, setPack] = useState<ChapterPackage | null>(null);
  const [stage, setStage] = useState<Stage>('overview');
  const [lastResultScore, setLastResultScore] = useState<number | null>(null);
  const [justMastered, setJustMastered] = useState(false);

  const summary = useMemo(() => CHAPTER_CATALOG.find((c) => c.chapterId === chapterId), [chapterId]);
  const storedProgress = useAppStore((s) => (chapterId ? s.state.chapterProgress[chapterId] : undefined));
  const progress = useMemo(() => storedProgress ?? emptyChapterProgress(), [storedProgress]);
  const markVocabCompleted = useAppStore((s) => s.markVocabCompleted);
  const recordTierResult = useAppStore((s) => s.recordTierResult);

  useEffect(() => {
    if (!summary) return;
    loadChapter(summary).then(setPack);
  }, [summary]);

  if (!summary) {
    return <Text>Kapitel nicht gefunden.</Text>;
  }

  if (!pack || !progress) {
    return (
      <div className={styles.loading}>
        <Spinner label="Kapitel wird geladen..." />
      </div>
    );
  }

  const handleVocabComplete = (rate: number) => {
    markVocabCompleted(summary.chapterId, rate);
    setLastResultScore(rate);
    setJustMastered(false);
    setStage('result');
  };

  const handleTierComplete = (tier: Tier) => (score: number) => {
    const wasGreen = progress.status === 'green';
    recordTierResult(summary.chapterId, tier, score);
    const nowGreen = useAppStore.getState().state.chapterProgress[summary.chapterId]?.status === 'green';
    setLastResultScore(score);
    setJustMastered(!wasGreen && nowGreen);
    setStage('result');
  };

  if (stage === 'vocab') {
    return <VocabFlashcards items={pack.vocabulary} onComplete={handleVocabComplete} />;
  }

  if (stage === 'easy' || stage === 'medium' || stage === 'hard') {
    return (
      <ExerciseRunner
        tierLabel={TIER_LABELS[stage]}
        items={pack.exercises[stage]}
        onComplete={handleTierComplete(stage)}
      />
    );
  }

  if (stage === 'result') {
    const passed = lastResultScore !== null && lastResultScore >= 60;
    const headline = justMastered ? 'Kapitel gemeistert!' : passed ? 'Stark gemacht!' : 'Weiter üben lohnt sich!';
    return (
      <div className={styles.resultWrap} role="status" aria-live="polite">
        {justMastered && <Confetti />}
        <ScoreRing percent={lastResultScore ?? 0} />
        <Text className={styles.resultHeadline} as="h1" size={600}>
          {headline}
        </Text>
        <Text style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          {lastResultScore}% erreicht.
        </Text>
        {justMastered && (
          <Text style={{ color: tokens.colorNeutralForeground3, marginTop: '-10px' }}>
            Alle drei Stufen bestanden — dieses Kapitel steht jetzt auf Grün.
          </Text>
        )}
        <TrafficLightBadge status={progress.status} />
        <Button appearance="primary" icon={<SparkleFilled />} onClick={() => setStage('overview')}>
          Zurück zur Kapitelübersicht
        </Button>
      </div>
    );
  }

  const stages: { key: Stage; label: string; sub: string; unlocked: boolean; done: boolean; score?: number }[] = [
    {
      key: 'vocab',
      label: 'Stufe 0 · Wortschatz',
      sub: `${pack.vocabulary.length} Begriffe`,
      unlocked: true,
      done: progress.vocabCompleted,
    },
    {
      key: 'easy',
      label: TIER_LABELS.easy,
      sub: `${pack.exercises.easy.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'easy'),
      done: progress.levels.easy.completed,
      score: progress.levels.easy.attempts > 0 ? progress.levels.easy.score : undefined,
    },
    {
      key: 'medium',
      label: TIER_LABELS.medium,
      sub: `${pack.exercises.medium.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'medium'),
      done: progress.levels.medium.completed,
      score: progress.levels.medium.attempts > 0 ? progress.levels.medium.score : undefined,
    },
    {
      key: 'hard',
      label: TIER_LABELS.hard,
      sub: `${pack.exercises.hard.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'hard'),
      done: progress.levels.hard.completed,
      score: progress.levels.hard.attempts > 0 ? progress.levels.hard.score : undefined,
    },
  ];

  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
        Alle Kapitel
      </Button>

      <div className={styles.titleBlock}>
        <Text className={styles.title} as="h1" size={700}>
          {`Kapitel ${pack.chapterNumber}: ${pack.title}`}
        </Text>
        <TrafficLightBadge status={progress.status} />
        <div className={styles.focusChips}>
          {pack.grammarFocus.map((focus) => (
            <span key={focus} className={styles.focusChip}>
              {focus}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.stageList}>
        {stages.map((s, i) => (
          <div key={s.key} className={styles.stageRow}>
            <div className={styles.stageRail}>
              <div
                className={mergeClasses(
                  styles.stageNode,
                  s.unlocked && !s.done && styles.stageNodeUnlocked,
                  s.done && styles.stageNodeDone,
                )}
              >
                {s.done ? <CheckmarkCircle24Filled /> : s.unlocked ? <BookOpen24Filled /> : <LockClosed20Filled />}
              </div>
              {i < stages.length - 1 && (
                <div className={mergeClasses(styles.stageConnector, s.done && styles.stageConnectorDone)} />
              )}
            </div>

            <div
              className={mergeClasses(styles.stageCard, s.unlocked ? styles.stageCardUnlocked : styles.stageCardLocked)}
              onClick={() => s.unlocked && setStage(s.key)}
            >
              <div className={styles.stageTextBlock}>
                <Text className={styles.stageLabel}>{s.label}</Text>
                <Text className={styles.stageSub}>
                  {s.unlocked ? s.sub : 'Schließe die vorherige Stufe ab, um freizuschalten.'}
                </Text>
              </div>
              {s.unlocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.score !== undefined && <Text className={styles.stageScore}>{s.score}%</Text>}
                  <ChevronRight24Regular />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
