import { useState } from 'react';
import { Button, MessageBar, MessageBarBody, makeStyles, tokens } from '@fluentui/react-components';
import { LightbulbFilled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalM,
  },
});

interface HintExplanationProps {
  hint?: string;
  explanation: string;
  submitted: boolean;
  correct: boolean;
  solution: string;
}

// FR-12: every exercise offers an optional Hint before submission, and a
// rule-based Explanation after submission.
export const HintExplanation = ({ hint, explanation, submitted, correct, solution }: HintExplanationProps) => {
  const styles = useStyles();
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={styles.wrap}>
      {!submitted && hint && (
        <div>
          {showHint ? (
            <MessageBar intent="info">
              <MessageBarBody>{hint}</MessageBarBody>
            </MessageBar>
          ) : (
            <Button appearance="subtle" icon={<LightbulbFilled />} onClick={() => setShowHint(true)}>
              Hinweis anzeigen
            </Button>
          )}
        </div>
      )}
      {submitted && (
        <div role="status" aria-live="polite">
          <MessageBar intent={correct ? 'success' : 'warning'}>
            <MessageBarBody>
              {!correct && (
                <>
                  <strong>Richtige Lösung:</strong> {solution}
                  <br />
                </>
              )}
              {explanation}
            </MessageBarBody>
          </MessageBar>
        </div>
      )}
    </div>
  );
};
