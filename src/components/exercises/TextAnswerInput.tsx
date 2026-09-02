import { Input, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  input: {
    minHeight: '44px',
    fontSize: tokens.fontSizeBase400,
  },
});

interface TextAnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  autoFocus?: boolean;
}

export const TextAnswerInput = ({ value, onChange, submitted, autoFocus }: TextAnswerInputProps) => {
  const styles = useStyles();
  return (
    <Input
      className={styles.input}
      value={value}
      disabled={submitted}
      autoFocus={autoFocus}
      onChange={(_, data) => onChange(data.value)}
      placeholder="Deine Antwort..."
    />
  );
};
