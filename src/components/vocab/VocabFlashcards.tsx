import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  ProgressBar,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { CheckmarkCircle24Regular, DismissCircle24Regular } from '@fluentui/react-icons';
import type { VocabularyItem } from '../../types/chapter';
import { GenderBadge } from '../badges/GenderBadge';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    maxWidth: '520px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  card: {
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.padding('32px', '20px'),
    cursor: 'pointer',
  },
  term: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
  example: {
    marginTop: tokens.spacingVerticalM,
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    ...shorthands.gap('12px'),
  },
  actionButton: {
    flex: 1,
    minHeight: '44px',
  },
  hint: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

interface VocabFlashcardsProps {
  items: VocabularyItem[];
  onComplete: (recognitionRatePercent: number) => void;
}

export const VocabFlashcards = ({ items, onComplete }: VocabFlashcardsProps) => {
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
      <ProgressBar value={index / items.length} />
      <Text align="center">
        Karte {index + 1} von {items.length}
      </Text>
      <Card className={styles.card} onClick={() => setFlipped((f) => !f)}>
        {!flipped ? (
          <>
            <Text className={styles.term}>{current.term}</Text>
            <GenderBadge gender={current.gender} />
          </>
        ) : (
          <>
            <Text className={styles.term}>{current.translation}</Text>
            <Text className={styles.meta}>
              {current.partOfSpeech}
              {current.plural ? ` · Plural: ${current.plural}` : ''}
            </Text>
            <Text className={styles.example}>{current.example}</Text>
          </>
        )}
      </Card>
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
