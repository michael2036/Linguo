import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ChevronRight20Regular, Sparkle24Filled, TrophyFilled } from '@fluentui/react-icons';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../lib/curriculumLoader';
import { suggestNextStep, allLektionenMastered } from '../lib/recommendation';
import { useAppStore } from '../store/appState';
import { TrafficLightBadge } from '../components/badges/TrafficLightBadge';
import { emptyLektionProgress } from '../types/appState';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('28px'),
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
  levelTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  modulGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('14px'),
    '@media (min-width: 720px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  modulCard: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('16px'),
  },
  modulHeader: {
    display: 'flex',
    alignItems: 'baseline',
    ...shorthands.gap('8px'),
    marginBottom: '8px',
  },
  modulTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  modulEyebrow: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  lektionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('10px'),
    ...shorthands.padding('10px', '4px'),
    minHeight: '44px',
    cursor: 'pointer',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  lektionText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  lektionTitle: {
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lektionMeta: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    flexShrink: 0,
  },
  chevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
});

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

      {LEVEL_CATALOG.map(({ level, title }) => {
        const moduln = MODUL_CATALOG.filter((m) => m.level === level);
        if (moduln.length === 0) return null;

        return (
          <section key={level} className={styles.levelSection}>
            <Text className={styles.levelTitle} as="h2" size={600}>
              {title}
            </Text>
            <div className={styles.modulGrid}>
              {moduln.map((modul) => (
                <Card key={modul.modulId} className={styles.modulCard}>
                  <div className={styles.modulHeader}>
                    <Text className={styles.modulTitle}>{`Modul ${modul.modulNumber} · ${modul.title}`}</Text>
                  </div>
                  {modul.lektionen.map((lektion) => {
                    const progress = state.lektionProgress[lektion.lektionId] ?? emptyLektionProgress();
                    return (
                      <div
                        key={lektion.lektionId}
                        className={styles.lektionRow}
                        onClick={() => navigate(`/lektion/${lektion.lektionId}`)}
                      >
                        <div className={styles.lektionText}>
                          <Text className={styles.lektionTitle}>{`Lektion ${lektion.lektionNumber}: ${lektion.title}`}</Text>
                        </div>
                        <div className={styles.lektionMeta}>
                          <TrafficLightBadge status={progress.status} />
                          <ChevronRight20Regular className={styles.chevron} />
                        </div>
                      </div>
                    );
                  })}
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
