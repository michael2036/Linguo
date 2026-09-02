import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { mergeClasses } from '@fluentui/react-components';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  option: {
    minHeight: '48px',
    justifyContent: 'flex-start',
    textAlign: 'left',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: tokens.durationFaster,
  },
  optionNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    marginRight: '10px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
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
            <span className={styles.optionNumber} style={isSelected && !submitted ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'inherit' } : undefined}>
              {index + 1}
            </span>
            {option}
          </Button>
        );
      })}
    </div>
  );
};
