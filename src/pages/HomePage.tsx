import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { Brain24Filled, ChevronRight20Regular, Sparkle24Filled, TrophyFilled } from '@fluentui/react-icons';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../lib/curriculumLoader';
import type { Level } from '../types/curriculum';
import { suggestNextStep, allLektionenMastered } from '../lib/recommendation';
import { useAppStore } from '../store/appState';
import { emptyLektionProgress } from '../types/appState';
import { LinguoLevelBanner } from '../components/mascot/LinguoLevelBanner';
import type { LinguoExpression } from '../components/mascot/linguoExpressions';
import { LevelTabs } from '../components/dashboard/LevelTabs';
import { ModulPathCard } from '../components/dashboard/ModulPathCard';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('32px'),
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('28px', '24px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
    color: tokens.colorNeutralForegroundOnBrand,
    animationName: 'ls-fade-up',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 600,
    fontSize: '13px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 700,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: '4px',
  },
  heroStats: {
    display: 'flex',
    ...shorthands.gap('24px'),
    marginTop: '18px',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  heroStatValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 700,
  },
  heroStatLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.75)',
  },
  resumeCard: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    ...shorthands.gap('12px'),
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(6px)',
    '@media (min-width: 520px)': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
  resumeText: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('2px'),
    minWidth: 0,
  },
  resumeEyebrow: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.75)',
  },
  resumeTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    color: tokens.colorNeutralForegroundOnBrand,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    '@media (min-width: 520px)': {
      WebkitLineClamp: 1,
    },
  },
  resumeButton: {
    flexShrink: 0,
    minHeight: '44px',
    width: '100%',
    '@media (min-width: 520px)': {
      width: 'auto',
    },
  },
  vocabCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    ...shorthands.padding('16px', '18px'),
    minHeight: '44px',
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: tokens.shadow4,
    },
  },
  vocabLeft: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    minWidth: 0,
  },
  vocabIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  vocabText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  vocabTitle: {
    fontWeight: 600,
  },
  vocabSub: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  chevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  levelSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('18px'),
  },
  modulGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('16px'),
    '@media (min-width: 720px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
});

// A level counts as mastered for the tab badge once every one of its
// Lektionen is green — purely a UI read of existing progress, not a new
// piece of tracked state.
const useMasteredLevels = (): Level[] => {
  const lektionProgress = useAppStore((s) => s.state.lektionProgress);
  return useMemo(
    () =>
      LEVEL_CATALOG.filter(({ level }) => {
        const lektionen = MODUL_CATALOG.filter((m) => m.level === level).flatMap((m) => m.lektionen);
        return (
          lektionen.length > 0 &&
          lektionen.every((l) => (lektionProgress[l.lektionId] ?? emptyLektionProgress()).status === 'green')
        );
      }).map((l) => l.level),
    [lektionProgress],
  );
};

const levelOf = (lektionId: string): Level | undefined =>
  MODUL_CATALOG.find((m) => m.lektionen.some((l) => l.lektionId === lektionId))?.level;

export const HomePage = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const state = useAppStore((s) => s.state);

  const allLektionen = useMemo(() => MODUL_CATALOG.flatMap((m) => m.lektionen), []);

  const stats = useMemo(() => {
    const entries = allLektionen.map((l) => state.lektionProgress[l.lektionId] ?? emptyLektionProgress());
    const mastered = entries.filter((e) => e.status === 'green').length;
    const inProgress = entries.filter((e) => e.status === 'yellow').length;
    return { total: allLektionen.length, mastered, inProgress };
  }, [allLektionen, state.lektionProgress]);

  const nextStep = useMemo(() => suggestNextStep(state.lektionProgress), [state.lektionProgress]);
  const allMastered = useMemo(() => allLektionenMastered(state.lektionProgress), [state.lektionProgress]);
  const masteredLevels = useMasteredLevels();

  // Defaults to wherever the learner should pick up next, so the level tab
  // that opens is the one that's actually relevant right now.
  const [activeLevel, setActiveLevel] = useState<Level>(
    () => (nextStep && levelOf(nextStep.lektionId)) ?? LEVEL_CATALOG[0].level,
  );

  const activeLevelInfo = LEVEL_CATALOG.find((l) => l.level === activeLevel) ?? LEVEL_CATALOG[0];
  const activeModuln = useMemo(() => MODUL_CATALOG.filter((m) => m.level === activeLevel), [activeLevel]);
  const progressFor = (lektionId: string) => state.lektionProgress[lektionId] ?? emptyLektionProgress();

  const activeLevelLektionen = useMemo(() => activeModuln.flatMap((m) => m.lektionen), [activeModuln]);
  const activeLevelMasteredCount = useMemo(
    () => activeLevelLektionen.filter((l) => progressFor(l.lektionId).status === 'green').length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeLevelLektionen, state.lektionProgress],
  );
  const isActiveLevelMastered = masteredLevels.includes(activeLevel);
  const linguoExpression: LinguoExpression = isActiveLevelMastered
    ? 'celebrating'
    : activeLevelMasteredCount > 0
      ? 'happy'
      : 'idle';
  const progressLabel =
    activeLevelLektionen.length > 0
      ? isActiveLevelMastered
        ? `Alle ${activeLevelLektionen.length} Lektionen gemeistert — stark! 🎉`
        : `${activeLevelMasteredCount} von ${activeLevelLektionen.length} Lektionen gemeistert`
      : undefined;

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <Text className={styles.heroEyebrow}>Deutsch · A1–C1</Text>
        <Text className={styles.heroTitle} as="h1">
          Willkommen zurück!
        </Text>
        <Text className={styles.heroSubtitle}>
          Muttersprache: {state.preferences.nativeLanguage === 'es' ? 'Español' : 'English'}
        </Text>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{stats.total}</Text>
            <Text className={styles.heroStatLabel}>Lektionen</Text>
          </div>
          <div className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{stats.mastered}</Text>
            <Text className={styles.heroStatLabel}>Gemeistert</Text>
          </div>
          <div className={styles.heroStat}>
            <Text className={styles.heroStatValue}>{stats.inProgress}</Text>
            <Text className={styles.heroStatLabel}>In Bearbeitung</Text>
          </div>
        </div>

        {allMastered ? (
          <div className={styles.resumeCard}>
            <div className={styles.resumeText}>
              <Text className={styles.resumeEyebrow}>Alle Lektionen gemeistert</Text>
              <Text className={styles.resumeTitle}>Stark! Du hast jede Lektion auf Grün gebracht. 🎉</Text>
            </div>
            <TrophyFilled fontSize={28} />
          </div>
        ) : (
          nextStep && (
            <div className={styles.resumeCard}>
              <div className={styles.resumeText}>
                <Text className={styles.resumeEyebrow}>{nextStep.hasStarted ? 'Weiter lernen' : 'Jetzt starten'}</Text>
                <Text className={styles.resumeTitle}>
                  {nextStep.modulTitle} · {nextStep.lektionTitle}
                </Text>
              </div>
              <Button
                className={styles.resumeButton}
                appearance="primary"
                icon={<Sparkle24Filled />}
                onClick={() => navigate(`/lektion/${nextStep.lektionId}`)}
              >
                {nextStep.hasStarted ? 'Fortsetzen' : 'Start'}
              </Button>
            </div>
          )
        )}
      </section>

      <Card className={styles.vocabCard} onClick={() => navigate('/vocab-trainer')}>
        <div className={styles.vocabLeft}>
          <span className={styles.vocabIcon}>
            <Brain24Filled />
          </span>
          <div className={styles.vocabText}>
            <Text className={styles.vocabTitle}>Wortschatz-Trainer</Text>
            <Text className={styles.vocabSub}>Vokabeln aus jedem Modul gezielt üben — unabhängig vom Level.</Text>
          </div>
        </div>
        <ChevronRight20Regular className={styles.chevron} />
      </Card>

      <section className={styles.levelSection}>
        <LevelTabs
          levels={LEVEL_CATALOG}
          activeLevel={activeLevel}
          masteredLevels={masteredLevels}
          onSelect={setActiveLevel}
        />

        <LinguoLevelBanner
          levelTitle={activeLevelInfo.title}
          tagline={activeLevelInfo.tagline}
          expression={linguoExpression}
          progressLabel={progressLabel}
        />

        {activeModuln.length > 0 ? (
          <div className={styles.modulGrid}>
            {activeModuln.map((modul) => (
              <ModulPathCard
                key={modul.modulId}
                modul={modul}
                progressFor={progressFor}
                onSelectLektion={(lektionId) => navigate(`/lektion/${lektionId}`)}
              />
            ))}
          </div>
        ) : (
          <Text style={{ color: tokens.colorNeutralForeground3 }}>
            Für dieses Level sind noch keine Module verfügbar.
          </Text>
        )}
      </section>
    </div>
  );
};
