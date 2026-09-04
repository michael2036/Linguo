import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { Sparkle24Filled, TrophyFilled } from '@fluentui/react-icons';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../lib/curriculumLoader';
import type { Level } from '../types/curriculum';
import { suggestNextStep, allLektionenMastered } from '../lib/recommendation';
import { useAppStore } from '../store/appState';
import { emptyLektionProgress } from '../types/appState';
import { LevelCard } from '../components/dashboard/LevelCard';

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
  levelSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('14px'),
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  levelGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('14px'),
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
});

// Per-level {mastered, total} counts for the portal's level cards — a pure
// UI read of existing progress, not a new piece of tracked state.
const useLevelStats = (): Record<Level, { mastered: number; total: number }> => {
  const lektionProgress = useAppStore((s) => s.state.lektionProgress);
  return useMemo(() => {
    const result = {} as Record<Level, { mastered: number; total: number }>;
    for (const { level } of LEVEL_CATALOG) {
      const lektionen = MODUL_CATALOG.filter((m) => m.level === level).flatMap((m) => m.lektionen);
      const mastered = lektionen.filter((l) => (lektionProgress[l.lektionId] ?? emptyLektionProgress()).status === 'green').length;
      result[level] = { mastered, total: lektionen.length };
    }
    return result;
  }, [lektionProgress]);
};

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
  const levelStats = useLevelStats();

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

      <section className={styles.levelSection}>
        <Text className={styles.sectionTitle} as="h2" size={500}>
          Wähle ein Level
        </Text>
        <div className={styles.levelGrid}>
          {LEVEL_CATALOG.map((level) => (
            <LevelCard
              key={level.level}
              level={level}
              masteredCount={levelStats[level.level]?.mastered ?? 0}
              totalCount={levelStats[level.level]?.total ?? 0}
              onClick={() => navigate(`/levels/${level.level.toLowerCase()}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
