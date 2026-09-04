import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../lib/curriculumLoader';
import { useAppStore } from '../store/appState';
import { emptyLektionProgress } from '../types/appState';
import { LinguoLevelBanner } from '../components/mascot/LinguoLevelBanner';
import type { LinguoExpression } from '../components/mascot/linguoExpressions';
import { ModulPathCard } from '../components/dashboard/ModulPathCard';
import { NotFoundPage } from './NotFoundPage';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('18px'),
    animationName: 'ls-slide-in',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  backButton: {
    alignSelf: 'flex-start',
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

// One level's dedicated hub — everything HomePage.tsx used to render inline
// behind a tab switch now lives at its own URL, so a level can be linked to,
// bookmarked, and reloaded directly (see Phase 1 of the navigation refresh).
export const LevelHubPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const state = useAppStore((s) => s.state);

  const levelInfo = LEVEL_CATALOG.find((l) => l.level.toLowerCase() === levelId?.toLowerCase());

  const moduln = useMemo(
    () => (levelInfo ? MODUL_CATALOG.filter((m) => m.level === levelInfo.level) : []),
    [levelInfo],
  );
  const progressFor = (lektionId: string) => state.lektionProgress[lektionId] ?? emptyLektionProgress();

  const lektionen = useMemo(() => moduln.flatMap((m) => m.lektionen), [moduln]);
  const masteredCount = useMemo(
    () => lektionen.filter((l) => progressFor(l.lektionId).status === 'green').length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lektionen, state.lektionProgress],
  );

  if (!levelInfo) {
    return <NotFoundPage />;
  }

  const isMastered = lektionen.length > 0 && masteredCount === lektionen.length;
  const linguoExpression: LinguoExpression = isMastered ? 'celebrating' : masteredCount > 0 ? 'happy' : 'idle';
  const progressLabel =
    lektionen.length > 0
      ? isMastered
        ? `Alle ${lektionen.length} Lektionen gemeistert — stark! 🎉`
        : `${masteredCount} von ${lektionen.length} Lektionen gemeistert`
      : undefined;

  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
        Alle Level
      </Button>

      <LinguoLevelBanner
        levelTitle={levelInfo.title}
        tagline={levelInfo.tagline}
        expression={linguoExpression}
        progressLabel={progressLabel}
      />

      {moduln.length > 0 ? (
        <div className={styles.modulGrid}>
          {moduln.map((modul) => (
            <ModulPathCard
              key={modul.modulId}
              modul={modul}
              progressFor={progressFor}
              onSelectLektion={(lektionId) => navigate(`/lektion/${lektionId}`)}
            />
          ))}
        </div>
      ) : (
        <Text style={{ color: tokens.colorNeutralForeground3 }}>Für dieses Level sind noch keine Module verfügbar.</Text>
      )}
    </div>
  );
};
