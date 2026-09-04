import { Button, makeStyles, shorthands, tokens } from '@fluentui/react-components';

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
        // Fluent's own Button recipe styles and this component's makeStyles
        // output land in the same Griffel cascade layer, so which one wins
        // depends on atomic-class insertion order across the whole app —
        // not something this component controls or can rely on (in
        // practice the "correct" green class would win here but the
        // "incorrect" red one silently wouldn't, in both themes). Inline
        // style always wins regardless, so use it for this state color.
        let stateStyle: { backgroundColor: string; borderColor: string } | undefined;
        if (submitted && isSolution) {
          stateStyle = { backgroundColor: tokens.colorPaletteGreenBackground2, borderColor: tokens.colorPaletteGreenBorder2 };
        } else if (submitted && isSelected && !isSolution) {
          stateStyle = { backgroundColor: tokens.colorPaletteRedBackground2, borderColor: tokens.colorPaletteRedBorder2 };
        }

        return (
          <Button
            key={option}
            className={styles.option}
            style={stateStyle}
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
