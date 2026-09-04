import { useEffect, useState } from 'react';
import { Button, ProgressBar, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { CheckmarkCircle24Regular, DismissCircle24Regular } from '@fluentui/react-icons';
import type { VocabularyItem } from '../../types/content';
import { GenderBadge } from '../badges/GenderBadge';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
    maxWidth: '520px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    fontWeight: 600,
    flexShrink: 0,
    marginLeft: '12px',
  },
  scene: {
    perspective: '1200px',
    minHeight: '280px',
  },
  card: {
    position: 'relative',
    minHeight: '280px',
    width: '100%',
    transformStyle: 'preserve-3d',
    transitionProperty: 'transform',
    transitionDuration: '480ms',
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
  },
  cardFlipped: {
    transform: 'rotateY(180deg)',
  },
  face: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backfaceVisibility: 'hidden',
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('32px', '20px'),
    boxShadow: tokens.shadow8,
  },
  faceFront: {
    backgroundImage: `linear-gradient(160deg, ${tokens.colorBrandBackground2}, ${tokens.colorNeutralBackground1})`,
  },
  faceBack: {
    backgroundColor: tokens.colorNeutralBackground1,
    transform: 'rotateY(180deg)',
  },
  term: {
    fontFamily: 'var(--font-display)',
    fontSize: tokens.fontSizeHero800,
    fontWeight: 700,
    marginBottom: '10px',
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
  example: {
    marginTop: tokens.spacingVerticalM,
    fontStyle: 'italic',
    color: tokens.colorNeutralForeground2,
  },
  principalParts: {
    marginTop: '6px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  regularityTag: {
    display: 'inline-block',
    marginTop: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
  },
  actions: {
    display: 'flex',
    ...shorthands.gap('12px'),
  },
  actionButton: {
    flex: 1,
    minHeight: '48px',
  },
  hint: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

interface VocabFlashcardsProps {
  items: VocabularyItem[];
  onComplete: (recognitionRatePercent: number) => void;
  // Fired for each card as it's rated, before onComplete — lets the
  // Wortschatz-Trainer update per-word spaced-repetition state live.
  onCardComplete?: (item: VocabularyItem, known: boolean) => void;
}

export const VocabFlashcards = ({ items, onComplete, onCardComplete }: VocabFlashcardsProps) => {
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);

  const current = items[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const advance = (known: boolean) => {
    onCardComplete?.(current, known);
    const nextKnown = knownCount + (known ? 1 : 0);
    setKnownCount(nextKnown);
    if (index + 1 >= items.length) {
      setDone(true);
      onComplete(Math.round((nextKnown / items.length) * 100));
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  if (done) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.progressRow}>
        <ProgressBar value={index / items.length} thickness="medium" style={{ flex: 1 }} />
        <Text className={styles.counter}>
          {index + 1} / {items.length}
        </Text>
      </div>

      <div className={styles.scene}>
        <div
          className={`${styles.card} ${flipped ? styles.cardFlipped : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`${styles.face} ${styles.faceFront}`}>
            <Text className={styles.term}>{current.term}</Text>
            <GenderBadge gender={current.gender} />
          </div>
          <div className={`${styles.face} ${styles.faceBack}`}>
            <Text className={styles.term}>{current.translation}</Text>
            <Text className={styles.meta}>
              {current.partOfSpeech}
              {current.plural ? ` · Plural: ${current.plural}` : ''}
            </Text>
            {current.partOfSpeech === 'verb' && current.preterite && current.participle && (
              <>
                <Text className={styles.principalParts}>
                  {current.term} · {current.preterite} ·{' '}
                  {current.auxiliary === 'sein' ? 'ist' : 'hat'} {current.participle}
                </Text>
                <span className={styles.regularityTag}>
                  {current.irregular ? 'unregelmäßig' : 'regelmäßig'}
                </span>
              </>
            )}
            <Text className={styles.example}>{current.example}</Text>
          </div>
        </div>
      </div>

      <Text className={styles.hint}>Tippe auf die Karte oder drücke Leertaste zum Umdrehen.</Text>
      <div className={styles.actions}>
        <Button
          className={styles.actionButton}
          appearance="outline"
          icon={<DismissCircle24Regular />}
          onClick={() => advance(false)}
        >
          Noch nicht
        </Button>
        <Button
          className={styles.actionButton}
          appearance="primary"
          icon={<CheckmarkCircle24Regular />}
          onClick={() => advance(true)}
        >
          Kenne ich
        </Button>
      </div>
    </div>
  );
};
