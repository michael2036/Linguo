import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, Text, ProgressBar, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { Book24Filled, ChevronRight24Regular, Sparkle24Filled, TrophyFilled } from '@fluentui/react-icons';
import { CHAPTER_CATALOG, COURSE_CATALOG } from '../lib/chapterLoader';
import { suggestNextStep } from '../lib/recommendation';
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
  courseSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'baseline',
    ...shorthands.gap('8px'),
  },
  courseTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  coursePublisher: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('12px'),
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

  const nextStep = useMemo(() => suggestNextStep(state.chapterProgress), [state.chapterProgress]);
  const allMastered = stats.mastered === stats.total;

  const coursesWithChapters = useMemo(
    () =>
      COURSE_CATALOG.map((course) => ({
        course,
        chapters: CHAPTER_CATALOG.filter((c) => c.courseId === course.courseId),
      })).filter((group) => group.chapters.length > 0),
    [],
  );

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

        {allMastered ? (
          <div className={styles.resumeCard}>
            <div className={styles.resumeText}>
              <Text className={styles.resumeEyebrow}>Alle Kapitel gemeistert</Text>
              <Text className={styles.resumeTitle}>Stark! Du hast jedes Kapitel auf Grün gebracht. 🎉</Text>
            </div>
            <TrophyFilled fontSize={28} />
          </div>
        ) : (
          nextStep && (
            <div className={styles.resumeCard}>
              <div className={styles.resumeText}>
                <Text className={styles.resumeEyebrow}>{nextStep.hasStarted ? 'Weiter lernen' : 'Jetzt starten'}</Text>
                <Text className={styles.resumeTitle}>
                  {nextStep.courseTitle} · {nextStep.chapter.title}
                </Text>
              </div>
              <Button
                className={styles.resumeButton}
                appearance="primary"
                icon={<Sparkle24Filled />}
                onClick={() => navigate(`/chapter/${nextStep.chapter.chapterId}`)}
              >
                {nextStep.hasStarted ? 'Fortsetzen' : 'Start'}
              </Button>
            </div>
          )
        )}
      </section>

      {coursesWithChapters.map(({ course, chapters }) => (
        <section key={course.courseId} className={styles.courseSection}>
          <div className={styles.courseHeader}>
            <Text className={styles.courseTitle} size={500}>
              {course.title}
            </Text>
            <Text className={styles.coursePublisher}>{course.publisher}</Text>
          </div>
          <div className={styles.grid}>
            {chapters.map((chapter, i) => {
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
      ))}
    </div>
  );
};
