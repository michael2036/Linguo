import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, Text, Badge, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { CHAPTER_CATALOG } from '../lib/chapterLoader';
import { useAppStore } from '../store/appState';
import { TrafficLightBadge } from '../components/badges/TrafficLightBadge';
import { emptyChapterProgress } from '../types/appState';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
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
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
});

export const HomePage = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const state = useAppStore((s) => s.state);

  return (
    <div className={styles.wrap}>
      <Text as="h1" size={700} weight="semibold">
        Deine Kapitel
      </Text>
      <Text className={styles.meta}>
        Zielsprache: Deutsch · Muttersprache:{' '}
        {state.preferences.nativeLanguage === 'es' ? 'Español' : 'English'}
      </Text>
      <div className={styles.grid}>
        {CHAPTER_CATALOG.map((chapter) => {
          const progress = state.chapterProgress[chapter.chapterId] ?? emptyChapterProgress();
          return (
            <Card
              key={chapter.chapterId}
              className={styles.card}
              onClick={() => navigate(`/chapter/${chapter.chapterId}`)}
            >
              <CardHeader
                header={<Text weight="semibold">{`Kapitel ${chapter.chapterNumber}: ${chapter.title}`}</Text>}
                description={
                  <div className={styles.meta}>
                    <Badge appearance="outline">{chapter.targetLevel}</Badge> &nbsp;
                    <TrafficLightBadge status={progress.status} />
                  </div>
                }
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
