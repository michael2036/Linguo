import { useEffect, useMemo, useState } from 'react';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { DismissCircle16Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  builtSentence: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    minHeight: '44px',
    ...shorthands.padding('8px'),
    ...shorthands.border('1px', 'dashed', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  chunkPool: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },
  chunk: {
    minHeight: '44px',
  },
});

const shuffle = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

interface SentenceScrambleProps {
  chunks: string[];
  value: string[];
  onChange: (value: string[]) => void;
  submitted: boolean;
}

export const SentenceScramble = ({ chunks, value, onChange, submitted }: SentenceScrambleProps) => {
  const styles = useStyles();
  const [pool, setPool] = useState<string[]>(() => shuffle(chunks));

  useEffect(() => {
    setPool(shuffle(chunks));
    onChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunks]);

  const remaining = useMemo(() => {
    const used = [...value];
    return pool.filter((chunk) => {
      const idx = used.indexOf(chunk);
      if (idx === -1) return true;
      used.splice(idx, 1);
      return false;
    });
  }, [pool, value]);

  const pick = (chunk: string) => {
    if (submitted) return;
    onChange([...value, chunk]);
  };

  const removeAt = (index: number) => {
    if (submitted) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.builtSentence}>
        {value.length === 0 && <Text style={{ color: tokens.colorNeutralForeground3 }}>Tippe auf die Wörter unten...</Text>}
        {value.map((chunk, index) => (
          <Button
            key={`${chunk}-${index}`}
            className={styles.chunk}
            appearance="primary"
            disabled={submitted}
            iconPosition="after"
            icon={!submitted ? <DismissCircle16Regular /> : undefined}
            onClick={() => removeAt(index)}
          >
            {chunk}
          </Button>
        ))}
      </div>
      <div className={styles.chunkPool}>
        {remaining.map((chunk, index) => (
          <Button key={`${chunk}-${index}`} className={styles.chunk} appearance="outline" disabled={submitted} onClick={() => pick(chunk)}>
            {chunk}
          </Button>
        ))}
      </div>
    </div>
  );
};
