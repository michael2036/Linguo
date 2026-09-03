import { useState } from 'react';
import { Button, MessageBar, MessageBarBody, makeStyles, tokens } from '@fluentui/react-components';
import { LightbulbFilled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    marginTop: tokens.spacingVerticalM,
  },
});

interface HintExplanationProps {
  hint?: string;
  submitted: boolean;
}

// FR-12: every exercise offers an optional Hint before submission. The
// post-submit Explanation now lives in LinguoFeedbackDrawer, which also
// carries the correction — see ExerciseRunner.
export const HintExplanation = ({ hint, submitted }: HintExplanationProps) => {
  const styles = useStyles();
  const [showHint, setShowHint] = useState(false);

  if (submitted || !hint) return null;

  return (
    <div className={styles.wrap}>
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
  );
};
