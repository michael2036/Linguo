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
  ClipboardTaskListLtr24Filled,
  LockClosed20Filled,
  RocketFilled,
  SparkleFilled,
} from '@fluentui/react-icons';
import { MODUL_CATALOG, loadModul } from '../lib/curriculumLoader';
import type { ModulPackage } from '../types/curriculum';
import type { Tier } from '../types/appState';
import { useAppStore } from '../store/appState';
import { isTierUnlocked } from '../lib/scoring';
import { emptyLektionProgress } from '../types/appState';
import { VocabFlashcards } from '../components/vocab/VocabFlashcards';
import { ExerciseRunner } from '../components/exercises/ExerciseRunner';
import { TrafficLightBadge } from '../components/badges/TrafficLightBadge';
import { ScoreRing } from '../components/badges/ScoreRing';
import { Confetti } from '../components/celebration/Confetti';

type Stage = 'mode-select' | 'practice-overview' | 'vocab' | Tier | 'test' | 'result';
type ResultOrigin = 'vocab' | Tier | 'test';

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

export const LektionPage = () => {
  const styles = useStyles();
  const { lektionId } = useParams<{ lektionId: string }>();
  const navigate = useNavigate();
  const [modul, setModul] = useState<ModulPackage | null>(null);
  const [stage, setStage] = useState<Stage>('mode-select');
  const [lastResultScore, setLastResultScore] = useState<number | null>(null);
  const [resultOrigin, setResultOrigin] = useState<ResultOrigin | null>(null);
  const [justMastered, setJustMastered] = useState(false);

  const modulSummary = useMemo(
    () => MODUL_CATALOG.find((m) => m.lektionen.some((l) => l.lektionId === lektionId)),
    [lektionId],
  );
  const storedProgress = useAppStore((s) => (lektionId ? s.state.lektionProgress[lektionId] : undefined));
  const progress = useMemo(() => storedProgress ?? emptyLektionProgress(), [storedProgress]);
  const markVocabCompleted = useAppStore((s) => s.markVocabCompleted);
  const recordTierResult = useAppStore((s) => s.recordTierResult);
  const recordTestResult = useAppStore((s) => s.recordTestResult);

  useEffect(() => {
    if (!modulSummary) return;
    loadModul(modulSummary).then(setModul);
  }, [modulSummary]);

  if (!modulSummary || !lektionId) {
    return <Text>Lektion nicht gefunden.</Text>;
  }

  if (!modul || !progress) {
    return (
      <div className={styles.loading}>
        <Spinner label="Lektion wird geladen..." />
      </div>
    );
  }

  const lektion = modul.lektionen.find((l) => l.lektionId === lektionId);
  if (!lektion) {
    return <Text>Lektion nicht gefunden.</Text>;
  }

  const handleVocabComplete = (rate: number) => {
    markVocabCompleted(lektionId, rate);
    setLastResultScore(rate);
    setResultOrigin('vocab');
    setJustMastered(false);
    setStage('result');
  };

  const handleTierComplete = (tier: Tier) => (score: number) => {
    const wasGreen = progress.status === 'green';
    recordTierResult(lektionId, tier, score);
    const nowGreen = useAppStore.getState().state.lektionProgress[lektionId]?.status === 'green';
    setLastResultScore(score);
    setResultOrigin(tier);
    setJustMastered(!wasGreen && nowGreen);
    setStage('result');
  };

  const handleTestComplete = (score: number) => {
    const wasGreen = progress.status === 'green';
    recordTestResult(lektionId, score);
    const nowGreen = useAppStore.getState().state.lektionProgress[lektionId]?.status === 'green';
    setLastResultScore(score);
    setResultOrigin('test');
    setJustMastered(!wasGreen && nowGreen);
    setStage('result');
  };

  if (stage === 'vocab') {
    return <VocabFlashcards items={lektion.vocabulary} onComplete={handleVocabComplete} />;
  }

  if (stage === 'easy' || stage === 'medium' || stage === 'hard') {
    return (
      <ExerciseRunner
        tierLabel={TIER_LABELS[stage]}
        items={lektion.practice[stage]}
        onComplete={handleTierComplete(stage)}
      />
    );
  }

  if (stage === 'test') {
    return <ExerciseRunner tierLabel="Test" items={lektion.test} onComplete={handleTestComplete} />;
  }

  if (stage === 'result') {
    const passed = lastResultScore !== null && lastResultScore >= 60;
    const headline = justMastered
      ? 'Lektion gemeistert!'
      : resultOrigin === 'vocab'
        ? 'Wortschatz gespeichert!'
        : passed
          ? 'Stark gemacht!'
          : 'Weiter üben lohnt sich!';
    const backTarget = resultOrigin === 'test' ? 'mode-select' : 'practice-overview';
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
            {resultOrigin === 'test'
              ? 'Starkes Testergebnis — diese Lektion steht jetzt auf Grün.'
              : 'Alle drei Stufen bestanden — diese Lektion steht jetzt auf Grün.'}
          </Text>
        )}
        <TrafficLightBadge status={progress.status} />
        <Button appearance="primary" icon={<SparkleFilled />} onClick={() => setStage(backTarget)}>
          {resultOrigin === 'test' ? 'Zurück zur Lektion' : 'Zurück zur Übungsübersicht'}
        </Button>
      </div>
    );
  }

  if (stage === 'mode-select') {
    return (
      <div className={styles.wrap}>
        <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
          Alle Lektionen
        </Button>

        <div className={styles.titleBlock}>
          <Text className={styles.eyebrow}>{`Modul ${modul.modulNumber} · ${modul.title}`}</Text>
          <Text className={styles.title} as="h1" size={700}>
            {`Lektion ${lektion.lektionNumber}: ${lektion.title}`}
          </Text>
          <TrafficLightBadge status={progress.status} />
          <div className={styles.focusChips}>
            {lektion.grammarFocus.map((focus) => (
              <span key={focus} className={styles.focusChip}>
                {focus}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.modeGrid}>
          <button className={styles.modeCard} onClick={() => setStage('practice-overview')}>
            <span className={styles.modeIcon}>
              <BookOpen24Filled />
            </span>
            <Text className={styles.modeTitle}>Übung</Text>
            <Text className={styles.modeBody}>
              Wortschatz lernen, dann drei Übungsstufen vom Erkennen bis zur freien Anwendung.
            </Text>
          </button>
          <button className={styles.modeCard} onClick={() => setStage('test')}>
            <span className={styles.modeIcon}>
              <RocketFilled />
            </span>
            <Text className={styles.modeTitle}>Test</Text>
            <Text className={styles.modeBody}>
              Direkt zur Prüfung — ohne Wortschatz oder Übung vorher. Ideal, um deinen Stand
              schnell zu checken.
            </Text>
          </button>
        </div>
      </div>
    );
  }

  // stage === 'practice-overview'
  const stages: { key: Stage; label: string; sub: string; unlocked: boolean; done: boolean; score?: number }[] = [
    {
      key: 'vocab',
      label: 'Stufe 0 · Wortschatz',
      sub: `${lektion.vocabulary.length} Begriffe`,
      unlocked: true,
      done: progress.vocabCompleted,
    },
    {
      key: 'easy',
      label: TIER_LABELS.easy,
      sub: `${lektion.practice.easy.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'easy'),
      done: progress.practice.easy.completed,
      score: progress.practice.easy.attempts > 0 ? progress.practice.easy.score : undefined,
    },
    {
      key: 'medium',
      label: TIER_LABELS.medium,
      sub: `${lektion.practice.medium.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'medium'),
      done: progress.practice.medium.completed,
      score: progress.practice.medium.attempts > 0 ? progress.practice.medium.score : undefined,
    },
    {
      key: 'hard',
      label: TIER_LABELS.hard,
      sub: `${lektion.practice.hard.length} Aufgaben`,
      unlocked: isTierUnlocked(progress, 'hard'),
      done: progress.practice.hard.completed,
      score: progress.practice.hard.attempts > 0 ? progress.practice.hard.score : undefined,
    },
  ];

  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStage('mode-select')}>
        Zurück zur Lektion
      </Button>

      <div className={styles.titleBlock}>
        <Text className={styles.eyebrow}>Übung</Text>
        <Text className={styles.title} as="h1" size={700}>
          {`Lektion ${lektion.lektionNumber}: ${lektion.title}`}
        </Text>
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

      {progress.test.attempted && (
        <div className={styles.stageRow}>
          <div className={styles.stageRail}>
            <div className={mergeClasses(styles.stageNode, progress.test.bestScore >= 85 && styles.stageNodeDone)}>
              <ClipboardTaskListLtr24Filled />
            </div>
          </div>
          <div className={styles.stageCard}>
            <div className={styles.stageTextBlock}>
              <Text className={styles.stageLabel}>Test</Text>
              <Text className={styles.stageSub}>Bestes Ergebnis: {progress.test.bestScore}%</Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
