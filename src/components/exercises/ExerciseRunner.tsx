import { useEffect, useState } from 'react';
import { Button, Card, ProgressBar, Text, makeStyles, tokens } from '@fluentui/react-components';
import type { ExerciseItem } from '../../types/chapter';
import { isCorrectAnswer } from '../../lib/answerCheck';
import { MultipleChoice } from './MultipleChoice';
import { TextAnswerInput } from './TextAnswerInput';
import { SentenceScramble } from './SentenceScramble';
import { HintExplanation } from './HintExplanation';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    maxWidth: '640px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  card: {
    padding: '24px',
  },
  instruction: {
    color: tokens.colorNeutralForeground3,
  },
  prompt: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginTop: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalL,
  },
  submitButton: {
    minHeight: '44px',
    minWidth: '44px',
  },
});

interface ExerciseRunnerProps {
  tierLabel: string;
  items: ExerciseItem[];
  onComplete: (scorePercent: number) => void;
}

export const ExerciseRunner = ({ tierLabel, items, onComplete }: ExerciseRunnerProps) => {
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [scrambleValue, setScrambleValue] = useState<string[]>([]);
  const [choiceValue, setChoiceValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const item = items[index];
  const isLast = index === items.length - 1;

  const currentAnswer = () => {
    if (item.type === 'multiple-choice') return choiceValue ?? '';
    if (item.type === 'sentence-scramble') return scrambleValue.join(' ');
    return textValue;
  };

  const canSubmit = currentAnswer().trim().length > 0;
  const isAnswerCorrect = submitted && isCorrectAnswer(currentAnswer(), item.solution);

  const handleSubmit = () => {
    if (submitted || !canSubmit) return;
    const correct = isCorrectAnswer(currentAnswer(), item.solution);
    if (correct) setCorrectCount((c) => c + 1);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (isLast) {
      const finalCorrect = correctCount;
      onComplete(Math.round((finalCorrect / items.length) * 100));
      return;
    }
    setIndex((i) => i + 1);
    setTextValue('');
    setScrambleValue([]);
    setChoiceValue(null);
    setSubmitted(false);
  };

  // UR-05 desktop keyboard shortcuts: 1-4 select a multiple-choice option,
  // Enter submits (or advances once already submitted).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!submitted) handleSubmit();
        else handleNext();
        return;
      }
      if (item.type === 'multiple-choice' && !submitted && item.options) {
        const digit = Number(e.key);
        if (digit >= 1 && digit <= item.options.length) {
          setChoiceValue(item.options[digit - 1]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, submitted, textValue, scrambleValue, choiceValue]);

  return (
    <div className={styles.wrap}>
      <ProgressBar value={index / items.length} />
      <Text align="center">
        {tierLabel} · Aufgabe {index + 1} von {items.length}
      </Text>
      <Card className={styles.card}>
        <Text className={styles.instruction}>{item.instruction}</Text>
        <Text as="p" className={styles.prompt}>
          {item.prompt}
        </Text>

        {item.type === 'multiple-choice' && item.options && (
          <MultipleChoice
            options={item.options}
            value={choiceValue}
            onChange={setChoiceValue}
            submitted={submitted}
            solution={item.solution}
          />
        )}
        {item.type === 'sentence-scramble' && item.scrambleChunks && (
          <SentenceScramble
            chunks={item.scrambleChunks}
            value={scrambleValue}
            onChange={setScrambleValue}
            submitted={submitted}
          />
        )}
        {(item.type === 'fill-in-blank' ||
          item.type === 'cloze-conjugation' ||
          item.type === 'targeted-transformation' ||
          item.type === 'error-correction') && (
          <TextAnswerInput value={textValue} onChange={setTextValue} submitted={submitted} autoFocus />
        )}

        <HintExplanation
          hint={item.hint}
          explanation={item.explanation}
          submitted={submitted}
          correct={isAnswerCorrect}
          solution={item.solution}
        />

        <div className={styles.footer}>
          {!submitted ? (
            <Button className={styles.submitButton} appearance="primary" disabled={!canSubmit} onClick={handleSubmit}>
              Prüfen
            </Button>
          ) : (
            <Button className={styles.submitButton} appearance="primary" onClick={handleNext}>
              {isLast ? 'Abschließen' : 'Weiter'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
