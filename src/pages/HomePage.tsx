import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, Text, ProgressBar, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { Book24Filled, ChevronRight24Regular } from '@fluentui/react-icons';
import { CHAPTER_CATALOG } from '../lib/chapterLoader';
import { useAppStore } from '../store/appState';
import { TrafficLightBadge } from '../components/badges/TrafficLightBadge';
import { emptyChapterProgress } from '../types/appState';

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
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('14px'),
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  card: {
    cursor: 'pointer',
    minHeight: '44px',
    ...shorthands.padding('4px'),
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('8px'),
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    marginTop: '6px',
  },
  cardLevel: {
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground3,
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  cardProgress: {
    marginTop: '12px',
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

  const stats = useMemo(() => {
    const entries = CHAPTER_CATALOG.map((c) => state.chapterProgress[c.chapterId] ?? emptyChapterProgress());
    const mastered = entries.filter((e) => e.status === 'green').length;
    const inProgress = entries.filter((e) => e.status === 'yellow').length;
    return { total: CHAPTER_CATALOG.length, mastered, inProgress };
  }, [state.chapterProgress]);

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
            <Text className={styles.heroStatLabel}>Kapitel</Text>
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
      </section>

      <section>
        <Text as="h2" size={500} className={styles.sectionTitle}>
          Deine Kapitel
        </Text>
        <div className={styles.grid} style={{ marginTop: 14 }}>
          {CHAPTER_CATALOG.map((chapter, i) => {
            const progress = state.chapterProgress[chapter.chapterId] ?? emptyChapterProgress();
            const stagesDone =
              (progress.vocabCompleted ? 1 : 0) +
              (progress.levels.easy.completed ? 1 : 0) +
              (progress.levels.medium.completed ? 1 : 0) +
              (progress.levels.hard.completed ? 1 : 0);

            return (
              <Card
                key={chapter.chapterId}
                className={styles.card}
                style={{ animationName: 'ls-fade-up', animationDuration: tokens.durationSlower, animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                onClick={() => navigate(`/chapter/${chapter.chapterId}`)}
              >
                <CardHeader
                  image={
                    <span className={styles.cardIcon}>
                      <Book24Filled />
                    </span>
                  }
                  header={
                    <div className={styles.cardTitleRow}>
                      <Text weight="semibold">{`Kapitel ${chapter.chapterNumber}: ${chapter.title}`}</Text>
                      <ChevronRight24Regular className={styles.chevron} />
                    </div>
                  }
                  description={
                    <div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardLevel}>{chapter.targetLevel}</span>
                        <TrafficLightBadge status={progress.status} />
                      </div>
                      <div className={styles.cardProgress}>
                        <ProgressBar value={stagesDone / 4} thickness="medium" />
                      </div>
                    </div>
                  }
                />
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
