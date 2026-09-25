import { useMemo, useRef, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Text, ToggleButton, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  BookOpen24Filled,
  ChevronRight24Regular,
  RocketFilled,
  TextBulletListSquare24Filled,
  TextGrammarWand24Filled,
} from '@fluentui/react-icons';
import type { ExerciseItem } from '../types/content';
import { useAppStore } from '../store/appState';
import { buildVerbPool } from '../lib/verbPool';
import { CATEGORY_LABEL, type Verb } from '../lib/verbConjugation';
import {
  SKILL_LABEL,
  VERB_SKILLS,
  buildUnits,
  buildVerbQuizItems,
  filterVerbs,
  isVerbMastered,
  skillKey,
  type VerbFilter,
  type VerbSkill,
} from '../lib/verbQuiz';
import { pickPracticeQueue, pickTestQueue, shuffle } from '../lib/vocabSrs';
import { DEFAULT_SESSION_SIZE, PRACTICE_XP_PER_CORRECT, TEST_XP_PER_CORRECT } from '../lib/vocabGame';
import { ExerciseRunner } from '../components/exercises/ExerciseRunner';
import { CurriculumSelectTree } from '../components/vocabTrainer/CurriculumSelectTree';
import { VocabGameStats } from '../components/vocabTrainer/VocabGameStats';
import { VerbCards } from '../components/verbTrainer/VerbCards';
import { VerbList } from '../components/verbTrainer/VerbList';
import { VerbSkillProgress } from '../components/verbTrainer/VerbSkillProgress';
import { ScoreRing } from '../components/badges/ScoreRing';
import { Confetti } from '../components/celebration/Confetti';
import { LinguoAvatar } from '../components/mascot/LinguoAvatar';
import { LinguoLaunchOverlay } from '../components/mascot/LinguoLaunchOverlay';
import type { LinguoExpression } from '../components/mascot/linguoExpressions';

type Stage = 'select' | 'mode-select' | 'cards' | 'practice' | 'test' | 'list' | 'result';
type Activity = 'cards' | 'practice' | 'test';

const STUDY_SIZE = 8;
const FILTERS: VerbFilter[] = ['all', 'regular', 'irregular', 'separable', 'reflexive', 'modal'];
const FILTER_LABEL: Record<VerbFilter, string> = { all: 'Alle', ...CATEGORY_LABEL };

const LAUNCH: Record<Activity, { title: string; subtitle: string; expression: LinguoExpression }> = {
  cards: { title: 'Verbkarten', subtitle: 'Formen ansehen und einprägen.', expression: 'happy' },
  practice: { title: 'Übung', subtitle: 'Konjugieren mit Hinweisen.', expression: 'thinking' },
  test: { title: 'Test', subtitle: 'Ohne Hinweise — zeig, was sitzt.', expression: 'confident' },
};

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
    maxWidth: '560px',
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
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: tokens.fontSizeBase300,
  },
  toggles: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('14px'),
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
    color: 'inherit',
    fontFamily: 'inherit',
    cursor: 'pointer',
    minHeight: '44px',
    textAlign: 'left',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
      transform: 'none',
      boxShadow: 'none',
    },
  },
  modeHead: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  modeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  modeStep: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
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

// Verben-Trainer: same select → mode → round → result shape as the
// Wortschatz-Trainer, but every item is generated from the conjugation
// engine (lib/verbConjugation.ts) instead of authored content. The learner
// narrows the round by skill (tense / Stammformen) and verb type, and
// progress is tracked per verb × skill so each tense is learned separately.
// Suggested path: Verbkarten (study) → Übung (hints) → Test (none).
export const VerbTrainerPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const verbTrainer = useAppStore((s) => s.state.verbTrainer);
  const recordTrainerAnswer = useAppStore((s) => s.recordTrainerAnswer);
  const finishTrainerSession = useAppStore((s) => s.finishTrainerSession);

  const [stage, setStage] = useState<Stage>('select');
  const [selectedLektionIds, setSelectedLektionIds] = useState<Set<string>>(new Set());
  const [pool, setPool] = useState<Verb[] | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);

  const [skills, setSkills] = useState<VerbSkill[]>(['praesens', 'praeteritum', 'perfekt', 'stammformen']);
  const [filter, setFilter] = useState<VerbFilter>('all');

  const [studyVerbs, setStudyVerbs] = useState<Verb[]>([]);
  const [quizItems, setQuizItems] = useState<ExerciseItem[]>([]);
  const quizKeyById = useRef<Record<string, string>>({});
  const [launchTarget, setLaunchTarget] = useState<Activity | null>(null);

  const [resultMode, setResultMode] = useState<Activity | null>(null);
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [bestStreakDisplay, setBestStreakDisplay] = useState(0);

  // Read synchronously inside the runner's onItemComplete → onComplete
  // chain (same tick), where state would still be stale — see
  // VocabTrainerPage for the same pattern.
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);

  const verbs = useMemo(() => (pool ? filterVerbs(pool, filter) : []), [pool, filter]);
  const masteredCount = useMemo(
    () => verbs.filter((v) => isVerbMastered(v, VERB_SKILLS, verbTrainer.words)).length,
    [verbs, verbTrainer.words],
  );
  const filterCounts = useMemo(() => {
    const counts = {} as Record<VerbFilter, number>;
    for (const f of FILTERS) counts[f] = pool ? filterVerbs(pool, f).length : 0;
    return counts;
  }, [pool]);

  const handleContinueFromSelect = async () => {
    setPoolLoading(true);
    const items = await buildVerbPool(selectedLektionIds);
    setPool(items);
    setPoolLoading(false);
    setFilter('all');
    setStage('mode-select');
  };

  const toggleSkill = (skill: VerbSkill) => {
    setSkills((current) => {
      if (current.includes(skill)) return current.length > 1 ? current.filter((s) => s !== skill) : current;
      return VERB_SKILLS.filter((s) => s === skill || current.includes(s));
    });
  };

  const resetSessionCounters = () => {
    streakRef.current = 0;
    bestStreakRef.current = 0;
    setXpEarned(0);
  };

  // Least-practised verbs first (lowest total box across the chosen
  // skills), random among ties — study what you haven't learned yet.
  const startCards = () => {
    const boxTotal = (v: Verb) => skills.reduce((sum, s) => sum + (verbTrainer.words[skillKey(v, s)]?.box ?? -1), 0);
    const ranked = shuffle(verbs).sort((a, b) => boxTotal(a) - boxTotal(b));
    setStudyVerbs(ranked.slice(0, STUDY_SIZE));
    setStage('cards');
  };

  const startQuiz = (mode: 'practice' | 'test') => {
    resetSessionCounters();
    const units = buildUnits(verbs, skills);
    const queue =
      mode === 'practice'
        ? pickPracticeQueue(units, verbTrainer.words, (u) => u.key, DEFAULT_SESSION_SIZE)
        : pickTestQueue(units, DEFAULT_SESSION_SIZE);
    const built = buildVerbQuizItems(queue, mode === 'practice');
    setQuizItems(built.items);
    quizKeyById.current = built.keyById;
    setStage(mode);
  };

  const handleQuizItem = (xpPerCorrect: number) => (item: ExerciseItem, correct: boolean) => {
    const key = quizKeyById.current[item.id];
    if (!key) return;
    recordTrainerAnswer('verbTrainer', key, correct, xpPerCorrect);
    if (correct) setXpEarned((xp) => xp + xpPerCorrect);
    streakRef.current = correct ? streakRef.current + 1 : 0;
    bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
  };

  const finishSession = (mode: Activity, score: number | null) => {
    finishTrainerSession('verbTrainer', bestStreakRef.current);
    setBestStreakDisplay(bestStreakRef.current);
    setResultMode(mode);
    setResultScore(score);
    setStage('result');
  };

  if (launchTarget) {
    const launch = LAUNCH[launchTarget];
    return (
      <LinguoLaunchOverlay
        title={launch.title}
        subtitle={launch.subtitle}
        expression={launch.expression}
        onDone={() => {
          if (launchTarget === 'cards') {
            resetSessionCounters();
            startCards();
          } else {
            startQuiz(launchTarget);
          }
          setLaunchTarget(null);
        }}
      />
    );
  }

  if (stage === 'cards') {
    return <VerbCards verbs={studyVerbs} onComplete={() => finishSession('cards', null)} />;
  }

  if (stage === 'practice' || stage === 'test') {
    const mode = stage;
    return (
      <ExerciseRunner
        tierLabel={mode === 'practice' ? 'Verben-Übung' : 'Verben-Test'}
        items={quizItems}
        onItemComplete={handleQuizItem(mode === 'practice' ? PRACTICE_XP_PER_CORRECT : TEST_XP_PER_CORRECT)}
        onComplete={(score) => finishSession(mode, score)}
      />
    );
  }

  if (stage === 'result' && resultMode) {
    const studied = resultMode === 'cards';
    const score = resultScore ?? 0;
    const celebrate = !studied && (score === 100 || bestStreakDisplay >= 10);
    const expression: LinguoExpression = studied
      ? 'happy'
      : celebrate
        ? 'celebrating'
        : score >= 60
          ? 'happy'
          : 'encouraging';
    // Nudge along the Lernen → Üben → Test path rather than only repeating.
    const next: Activity = studied ? 'practice' : resultMode === 'practice' && score >= 80 ? 'test' : resultMode;
    const nextLabel: Record<Activity, string> = {
      cards: 'Weitere Verbkarten',
      practice: studied ? 'Jetzt üben' : 'Noch eine Übung',
      test: resultMode === 'test' ? 'Noch ein Test' : 'Test versuchen',
    };
    return (
      <div className={styles.resultWrap} role="status" aria-live="polite">
        {celebrate && <Confetti />}
        <LinguoAvatar expression={expression} size={88} animate="pop" />
        {!studied && <ScoreRing percent={score} />}
        <Text className={styles.resultHeadline} as="h1" size={600}>
          {studied ? `${studyVerbs.length} Verben angesehen!` : resultMode === 'practice' ? 'Übung geschafft!' : 'Test abgeschlossen!'}
        </Text>
        {!studied && (
          <Text style={{ color: tokens.colorNeutralForeground3 }}>
            +{xpEarned} XP{bestStreakDisplay >= 3 ? ` · Beste Serie: ${bestStreakDisplay}` : ''}
          </Text>
        )}
        <VocabGameStats trainer={verbTrainer} masteredCount={masteredCount} poolSize={verbs.length} />
        <div className={styles.resultActions}>
          <Button appearance="primary" icon={<RocketFilled />} onClick={() => setLaunchTarget(next)}>
            {nextLabel[next]}
          </Button>
          <Button appearance="outline" onClick={() => setStage('mode-select')}>
            Zur Übersicht
          </Button>
          <Button appearance="subtle" onClick={() => navigate('/')}>
            Fertig
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'list' && pool) {
    return (
      <div className={styles.wrap}>
        <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStage('mode-select')}>
          Zur Übersicht
        </Button>
        <div className={styles.titleBlock}>
          <Text className={styles.eyebrow}>Verbliste · {FILTER_LABEL[filter]}</Text>
          <Text className={styles.title} as="h1" size={700}>
            {verbs.length} Verben
          </Text>
        </div>
        <VerbList verbs={verbs} />
      </div>
    );
  }

  if (stage === 'mode-select' && pool) {
    const empty = verbs.length === 0;
    const roundSize = Math.min(DEFAULT_SESSION_SIZE, verbs.length * skills.length);
    const modes: { key: Activity | 'list'; step: string; title: string; body: string; icon: ReactElement }[] = [
      {
        key: 'cards',
        step: 'Schritt 1 · Lernen',
        title: 'Verbkarten',
        body: `${Math.min(STUDY_SIZE, verbs.length)} Verben mit Stammformen und kompletter Konjugationstabelle — zuerst die, die du noch nicht kannst.`,
        icon: <BookOpen24Filled />,
      },
      {
        key: 'practice',
        step: 'Schritt 2 · Üben',
        title: 'Übung',
        body: `${roundSize} Aufgaben mit Hinweisen. Die App wählt, welche Formen du am dringendsten wiederholen musst.`,
        icon: <TextGrammarWand24Filled />,
      },
      {
        key: 'test',
        step: 'Schritt 3 · Prüfen',
        title: 'Test',
        body: `${roundSize} zufällige Aufgaben ohne Hinweise — prüft, was wirklich sitzt.`,
        icon: <RocketFilled />,
      },
      {
        key: 'list',
        step: 'Nachschlagen',
        title: 'Verbliste',
        body: 'Alle Verben durchsuchen und ihre Konjugationstabellen ansehen.',
        icon: <TextBulletListSquare24Filled />,
      },
    ];

    return (
      <div className={styles.wrap}>
        <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setStage('select')}>
          Auswahl ändern
        </Button>

        <div className={styles.titleBlock}>
          <Text className={styles.eyebrow}>Verben-Trainer</Text>
          <Text className={styles.title} as="h1" size={700}>
            {pool.length} Verben im Pool
          </Text>
        </div>

        <VocabGameStats trainer={verbTrainer} masteredCount={masteredCount} poolSize={verbs.length} />
        <VerbSkillProgress verbs={verbs} progress={verbTrainer.words} />

        <div className={styles.section}>
          <Text className={styles.sectionTitle}>Was möchtest du trainieren?</Text>
          <div className={styles.toggles}>
            {VERB_SKILLS.map((skill) => (
              <ToggleButton
                key={skill}
                checked={skills.includes(skill)}
                appearance={skills.includes(skill) ? 'primary' : 'secondary'}
                onClick={() => toggleSkill(skill)}
              >
                {SKILL_LABEL[skill]}
              </ToggleButton>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Text className={styles.sectionTitle}>Welche Verben?</Text>
          <div className={styles.toggles}>
            {FILTERS.map((f) => (
              <ToggleButton
                key={f}
                checked={filter === f}
                appearance={filter === f ? 'primary' : 'secondary'}
                disabled={filterCounts[f] === 0}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABEL[f]} ({filterCounts[f]})
              </ToggleButton>
            ))}
          </div>
        </div>

        <div className={styles.modeGrid}>
          {modes.map((mode) => (
            <button
              key={mode.key}
              className={styles.modeCard}
              disabled={empty}
              onClick={() => (mode.key === 'list' ? setStage('list') : setLaunchTarget(mode.key))}
            >
              <span className={styles.modeHead}>
                <span className={styles.modeIcon}>{mode.icon}</span>
                <span>
                  <Text className={styles.modeStep} block>
                    {mode.step}
                  </Text>
                  <Text className={styles.modeTitle}>{mode.title}</Text>
                </span>
              </span>
              <Text className={styles.modeBody}>{mode.body}</Text>
            </button>
          ))}
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
        <Text className={styles.eyebrow}>Verben-Trainer</Text>
        <Text className={styles.title} as="h1" size={700}>
          Wähle deine Verben
        </Text>
        <Text className={styles.subtitle}>
          Wähle ein Level, Module oder einzelne Lektionen — alle Verben daraus werden gesammelt: regelmäßig,
          unregelmäßig, trennbar, reflexiv und Modalverben, in Präsens, Präteritum und Perfekt.
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
