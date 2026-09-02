import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  Spinner,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import {
  BookOpen24Regular,
  CheckmarkCircle24Filled,
  LockClosed24Regular,
  PlayCircle24Regular,
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
    ...shorthands.gap('16px'),
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '48px',
  },
  stageList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  stageCard: {
    minHeight: '44px',
  },
  stageRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  resultWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap('16px'),
    paddingTop: '32px',
    textAlign: 'center',
  },
});

export const ChapterPage = () => {
  const styles = useStyles();
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [pack, setPack] = useState<ChapterPackage | null>(null);
  const [stage, setStage] = useState<Stage>('overview');
  const [lastResultScore, setLastResultScore] = useState<number | null>(null);

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
    setStage('result');
  };

  const handleTierComplete = (tier: Tier) => (score: number) => {
    recordTierResult(summary.chapterId, tier, score);
    setLastResultScore(score);
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
    return (
      <div className={styles.resultWrap}>
        <CheckmarkCircle24Filled fontSize={48} color={tokens.colorPaletteGreenForeground2} />
        <Text size={600} weight="semibold">
          {lastResultScore}% erreicht
        </Text>
        <TrafficLightBadge status={progress.status} />
        <Button appearance="primary" onClick={() => setStage('overview')}>
          Zurück zur Kapitelübersicht
        </Button>
      </div>
    );
  }

  const stages: { key: Stage; label: string; unlocked: boolean; done: boolean }[] = [
    {
      key: 'vocab',
      label: `Stufe 0 · Wortschatz (${pack.vocabulary.length} Begriffe)`,
      unlocked: true,
      done: progress.vocabCompleted,
    },
    {
      key: 'easy',
      label: TIER_LABELS.easy,
      unlocked: isTierUnlocked(progress, 'easy'),
      done: progress.levels.easy.completed,
    },
    {
      key: 'medium',
      label: TIER_LABELS.medium,
      unlocked: isTierUnlocked(progress, 'medium'),
      done: progress.levels.medium.completed,
    },
    {
      key: 'hard',
      label: TIER_LABELS.hard,
      unlocked: isTierUnlocked(progress, 'hard'),
      done: progress.levels.hard.completed,
    },
  ];

  return (
    <div className={styles.wrap}>
      <Button appearance="subtle" onClick={() => navigate('/')}>
        ← Alle Kapitel
      </Button>
      <Text as="h1" size={700} weight="semibold">
        {`Kapitel ${pack.chapterNumber}: ${pack.title}`}
      </Text>
      <Text style={{ color: tokens.colorNeutralForeground3 }}>{pack.grammarFocus.join(' · ')}</Text>
      <TrafficLightBadge status={progress.status} />

      <div className={styles.stageList}>
        {stages.map((s) => (
          <Card key={s.key} className={styles.stageCard}>
            <CardHeader
              image={
                !s.unlocked ? (
                  <LockClosed24Regular />
                ) : s.done ? (
                  <CheckmarkCircle24Filled color={tokens.colorPaletteGreenForeground2} />
                ) : (
                  <BookOpen24Regular />
                )
              }
              header={
                <div className={styles.stageRow}>
                  <Text weight="semibold">{s.label}</Text>
                  {s.unlocked && (
                    <Button
                      appearance="primary"
                      icon={<PlayCircle24Regular />}
                      onClick={() => setStage(s.key)}
                    >
                      {s.done ? 'Wiederholen' : 'Start'}
                    </Button>
                  )}
                </div>
              }
              description={
                !s.unlocked ? (
                  <Text style={{ color: tokens.colorNeutralForeground3 }}>
                    Schließe die vorherige Stufe ab, um freizuschalten.
                  </Text>
                ) : undefined
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
};
