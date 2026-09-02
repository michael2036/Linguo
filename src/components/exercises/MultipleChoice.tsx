import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { mergeClasses } from '@fluentui/react-components';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  option: {
    minHeight: '44px',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  correct: {
    ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
    backgroundColor: tokens.colorPaletteGreenBackground2,
  },
  incorrect: {
    ...shorthands.borderColor(tokens.colorPaletteRedBorder2),
    backgroundColor: tokens.colorPaletteRedBackground2,
  },
});

interface MultipleChoiceProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  submitted: boolean;
  solution: string;
}

export const MultipleChoice = ({ options, value, onChange, submitted, solution }: MultipleChoiceProps) => {
  const styles = useStyles();

  return (
    <div className={styles.grid} role="radiogroup">
      {options.map((option, index) => {
        const isSelected = value === option;
        const isSolution = option === solution;
        let stateClass = '';
        if (submitted && isSolution) stateClass = styles.correct;
        else if (submitted && isSelected && !isSolution) stateClass = styles.incorrect;

        return (
          <Button
            key={option}
            className={mergeClasses(styles.option, stateClass)}
            appearance={isSelected && !submitted ? 'primary' : 'outline'}
            disabled={submitted}
            onClick={() => onChange(option)}
            role="radio"
            aria-checked={isSelected}
          >
            {index < 4 ? `${index + 1}. ` : ''}
            {option}
          </Button>
        );
      })}
    </div>
  );
};
