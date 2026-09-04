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
  RocketFilled,
  SparkleFilled,
} from '@fluentui/react-icons';
import { MODUL_CATALOG, loadModul } from '../lib/curriculumLoader';
import type { ModulPackage } from '../types/curriculum';
import type { Tier } from '../types/appState';
import { useAppStore } from '../store/appState';
import { emptyLektionProgress } from '../types/appState';
import { VocabFlashcards } from '../components/vocab/VocabFlashcards';
import { ExerciseRunner } from '../components/exercises/ExerciseRunner';
import { LessonStatusBadge } from '../components/badges/LessonStatusBadge';
import { getDisplayStatus } from '../lib/dashboardStatus';
import { ScoreRing } from '../components/badges/ScoreRing';
import { Confetti } from '../components/celebration/Confetti';
import { LinguoAvatar } from '../components/mascot/LinguoAvatar';
import { LinguoLaunchOverlay } from '../components/mascot/LinguoLaunchOverlay';
import type { LinguoExpression } from '../components/mascot/linguoExpressions';

// Every "opening an activity" entry point (vocab primer, a practice tier,
// or Test) shows the same brief launch beat first — see enterActivity below.
const ACTIVITY_LAUNCH: Record<'vocab' | Tier | 'test', { title: string; subtitle: string; expression: LinguoExpression }> = {
  vocab: { title: 'Wortschatz', subtitle: 'Neue Begriffe kennenlernen.', expression: 'happy' },
  easy: { title: 'Stufe 1 · Grundlagen', subtitle: 'Erkennen und wiederholen.', expression: 'thinking' },
  medium: { title: 'Stufe 2 · Anwendung', subtitle: 'Jetzt wird es aktiver.', expression: 'thinking' },
  hard: { title: 'Stufe 3 · Meisterschaft', subtitle: 'Freie Anwendung — du schaffst das!', expression: 'confident' },
  test: { title: 'Test', subtitle: 'Zeig, was du drauf hast.', expression: 'confident' },
};

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
  // Keyed by `stage` at every call site below so switching between
  // mode-select/practice-overview/a tier/result always remounts and
  // replays this slide-in, rather than silently reusing the previous
  // stage's DOM node when both happen to render a plain <div> at the root.
  // Position-only (ls-slide-in, not ls-fade-up) — this wraps a whole
  // page's worth of content, and an opacity fade over that much text reads
  // as a readability bug (low-contrast flash), not a transition.
  stageEnter: {
    animationName: 'ls-slide-in',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  resultHeadline: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
});

// React's own recommended fix for "reset all state when a prop/route param
// changes": remount via `key`, rather than an effect full of setState calls
// (which also trips oxlint's set-state-in-effect rule). Without this, React
// Router reusing this component instance across two different Lektion URLs
// would leave `stage` (and the rest) stuck wherever the previous Lektion
// left off — e.g. still deep in "Stufe 3" — instead of starting fresh at
// mode-select for the newly-loaded Lektion.
export const LektionPage = () => {
  const { lektionId } = useParams<{ lektionId: string }>();
  return <LektionPageInner key={lektionId} />;
};

const LektionPageInner = () => {
  const styles = useStyles();
  const { lektionId } = useParams<{ lektionId: string }>();
  const navigate = useNavigate();
  const [modul, setModul] = useState<ModulPackage | null>(null);
  const [stage, setStage] = useState<Stage>('mode-select');
  const [lastResultScore, setLastResultScore] = useState<number | null>(null);
  const [resultOrigin, setResultOrigin] = useState<ResultOrigin | null>(null);
  const [justMastered, setJustMastered] = useState(false);
  // Set only for the five "opening an activity" targets (vocab/tier/test) —
  // while set, a full-screen LinguoLaunchOverlay renders instead of the
  // normal stage content; its onDone flips `stage` for real. Pure
  // navigation (mode-select <-> practice-overview, "back" buttons) skips
  // this and calls setStage directly, since nothing is being "opened".
  const [launchTarget, setLaunchTarget] = useState<'vocab' | Tier | 'test' | null>(null);

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

  const enterActivity = (target: 'vocab' | Tier | 'test') => setLaunchTarget(target);

  if (launchTarget) {
    const launch = ACTIVITY_LAUNCH[launchTarget];
    return (
      <LinguoLaunchOverlay
        title={launch.title}
        subtitle={launch.subtitle}
        expression={launch.expression}
        onDone={() => {
          setStage(launchTarget);
          setLaunchTarget(null);
        }}
      />
    );
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
    return (
      <div key={stage} className={styles.stageEnter}>
        <VocabFlashcards items={lektion.vocabulary} onComplete={handleVocabComplete} />
      </div>
    );
  }

  if (stage === 'easy' || stage === 'medium' || stage === 'hard') {
    return (
      <div key={stage} className={styles.stageEnter}>
        <ExerciseRunner
          tierLabel={TIER_LABELS[stage]}
          items={lektion.practice[stage]}
          onComplete={handleTierComplete(stage)}
        />
      </div>
    );
  }

  if (stage === 'test') {
    return (
      <div key={stage} className={styles.stageEnter}>
        <ExerciseRunner tierLabel="Test" items={lektion.test} onComplete={handleTestComplete} />
      </div>
    );
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
    const linguoExpression: LinguoExpression = justMastered ? 'celebrating' : passed ? 'happy' : 'encouraging';
    const levelPath = `/levels/${modul.level.toLowerCase()}`;

    // Chains one activity into the next instead of dumping the learner back
    // on a generic overview — the whole point of the "intuitive next step"
    // requirement. Always paired with a lower-emphasis way out, so this is
    // a nudge forward, never a new gate.
    let primaryLabel: string;
    let primaryIcon = <ChevronRight24Regular />;
    let onPrimary: () => void;
    let secondaryLabel: string;
    let onSecondary: () => void;
    switch (resultOrigin) {
      case 'vocab':
        primaryLabel = 'Weiter zu Stufe 1';
        onPrimary = () => enterActivity('easy');
        secondaryLabel = 'Zurück zur Übersicht';
        onSecondary = () => setStage('practice-overview');
        break;
      case 'easy':
        primaryLabel = 'Weiter zu Stufe 2';
        onPrimary = () => enterActivity('medium');
        secondaryLabel = 'Zurück zur Übersicht';
        onSecondary = () => setStage('practice-overview');
        break;
      case 'medium':
        primaryLabel = 'Weiter zu Stufe 3';
        onPrimary = () => enterActivity('hard');
        secondaryLabel = 'Zurück zur Übersicht';
        onSecondary = () => setStage('practice-overview');
        break;
      case 'hard':
        primaryLabel = 'Test versuchen';
        primaryIcon = <RocketFilled />;
        onPrimary = () => enterActivity('test');
        secondaryLabel = 'Zur Levelübersicht';
        onSecondary = () => navigate(levelPath);
        break;
      case 'test':
      default:
        primaryLabel = 'Zur Levelübersicht';
        primaryIcon = <SparkleFilled />;
        onPrimary = () => navigate(levelPath);
        secondaryLabel = 'Zurück zur Lektion';
        onSecondary = () => setStage('mode-select');
        break;
    }

    return (
      <div key={stage} className={mergeClasses(styles.resultWrap, styles.stageEnter)} role="status" aria-live="polite">
        {justMastered && <Confetti />}
        <LinguoAvatar expression={linguoExpression} size={88} animate="pop" />
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
        <LessonStatusBadge status={getDisplayStatus(progress)} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          <Button appearance="outline" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
          <Button appearance="primary" icon={primaryIcon} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'mode-select') {
    return (
      <div key={stage} className={mergeClasses(styles.wrap, styles.stageEnter)}>
        <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
          Alle Lektionen
        </Button>

        <div className={styles.titleBlock}>
          <Text className={styles.eyebrow}>{`Modul ${modul.modulNumber} · ${modul.title}`}</Text>
          <Text className={styles.title} as="h1" size={700}>
            {`Lektion ${lektion.lektionNumber}: ${lektion.title}`}
          </Text>
          <LessonStatusBadge status={getDisplayStatus(progress)} />
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
          <button className={styles.modeCard} onClick={() => enterActivity('test')}>
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

  // stage === 'practice-overview'. Every stage is always open — no gating,
  // no lock icon (see AGENTS.md). `isRecommendedNext` below is a soft nudge
  // only: the first not-yet-done stage gets a brand-accent highlight to
  // suggest where to go, but every row is equally clickable regardless.
  const stages: { key: Stage; label: string; sub: string; done: boolean; score?: number }[] = [
    {
      key: 'vocab',
      label: 'Stufe 0 · Wortschatz',
      sub: `${lektion.vocabulary.length} Begriffe`,
      done: progress.vocabCompleted,
    },
    {
      key: 'easy',
      label: TIER_LABELS.easy,
      sub: `${lektion.practice.easy.length} Aufgaben`,
      done: progress.practice.easy.completed,
      score: progress.practice.easy.attempts > 0 ? progress.practice.easy.score : undefined,
    },
    {
      key: 'medium',
      label: TIER_LABELS.medium,
      sub: `${lektion.practice.medium.length} Aufgaben`,
      done: progress.practice.medium.completed,
      score: progress.practice.medium.attempts > 0 ? progress.practice.medium.score : undefined,
    },
    {
      key: 'hard',
      label: TIER_LABELS.hard,
      sub: `${lektion.practice.hard.length} Aufgaben`,
      done: progress.practice.hard.completed,
      score: progress.practice.hard.attempts > 0 ? progress.practice.hard.score : undefined,
    },
  ];
  const recommendedNextKey = stages.find((s) => !s.done)?.key;

  return (
    <div key={stage} className={mergeClasses(styles.wrap, styles.stageEnter)}>
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
                  !s.done && s.key === recommendedNextKey && styles.stageNodeUnlocked,
                  s.done && styles.stageNodeDone,
                )}
              >
                {s.done ? <CheckmarkCircle24Filled /> : <BookOpen24Filled />}
              </div>
              {i < stages.length - 1 && (
                <div className={mergeClasses(styles.stageConnector, s.done && styles.stageConnectorDone)} />
              )}
            </div>

            <div className={mergeClasses(styles.stageCard, styles.stageCardUnlocked)} onClick={() => enterActivity(s.key as 'vocab' | Tier)}>
              <div className={styles.stageTextBlock}>
                <Text className={styles.stageLabel}>{s.label}</Text>
                <Text className={styles.stageSub}>{s.sub}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.score !== undefined && <Text className={styles.stageScore}>{s.score}%</Text>}
                <ChevronRight24Regular />
              </div>
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
