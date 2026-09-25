import { useState } from 'react';
import { Button, ProgressBar, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular, ArrowRight24Regular, Eye24Regular } from '@fluentui/react-icons';
import { principalParts, type Verb } from '../../lib/verbConjugation';
import { VerbChips } from './VerbChips';
import { VerbTable } from './VerbTable';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
    maxWidth: '760px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  counter: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    fontWeight: 600,
    flexShrink: 0,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...shorthands.gap('10px'),
    ...shorthands.padding('28px', '20px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    boxShadow: tokens.shadow8,
    backgroundImage: `linear-gradient(160deg, ${tokens.colorBrandBackground2}, ${tokens.colorNeutralBackground1})`,
    minHeight: '200px',
  },
  term: {
    fontFamily: 'var(--font-display)',
    fontSize: tokens.fontSizeHero800,
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  translation: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase400,
  },
  chips: {
    justifyContent: 'center',
    display: 'flex',
  },
  parts: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: tokens.fontSizeBase400,
  },
  example: {
    fontStyle: 'italic',
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
  },
});

interface VerbCardsProps {
  verbs: Verb[];
  onComplete: () => void;
}

// Study mode: one verb at a time, the learner first tries to recall its
// forms, then reveals the principal parts and full table. Nothing is graded
// here — mastery only moves from checked answers in Übung/Test.
export const VerbCards = ({ verbs, onComplete }: VerbCardsProps) => {
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const verb = verbs[index];
  const isLast = index === verbs.length - 1;

  const go = (next: number) => {
    setIndex(next);
    setRevealed(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.progressRow}>
        <ProgressBar value={(index + 1) / verbs.length} thickness="large" />
        <Text className={styles.counter}>
          {index + 1}/{verbs.length}
        </Text>
      </div>

      <div className={styles.card}>
        <Text className={styles.term} as="h1">
          {verb.term}
        </Text>
        <Text className={styles.translation}>{verb.translation}</Text>
        <div className={styles.chips}>
          <VerbChips verb={verb} />
        </div>
        {revealed && (
          <>
            <Text className={styles.parts}>{principalParts(verb)}</Text>
            <Text className={styles.example}>{verb.example}</Text>
          </>
        )}
      </div>

      {revealed ? (
        <VerbTable verb={verb} />
      ) : (
        <Button appearance="secondary" size="large" icon={<Eye24Regular />} onClick={() => setRevealed(true)}>
          Formen zeigen
        </Button>
      )}

      <div className={styles.actions}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} disabled={index === 0} onClick={() => go(index - 1)}>
          Zurück
        </Button>
        <Button
          appearance="primary"
          icon={<ArrowRight24Regular />}
          iconPosition="after"
          onClick={() => (isLast ? onComplete() : go(index + 1))}
        >
          {isLast ? 'Fertig' : 'Nächstes Verb'}
        </Button>
      </div>
    </div>
  );
};
