import { Fragment } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { parseMarked } from '../../lib/grammarCards';

const useStyles = makeStyles({
  accent: {
    color: tokens.colorBrandForeground1,
    fontWeight: 700,
  },
  success: {
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: 700,
  },
});

export const Marked = ({ text }: { text: string }) => {
  const styles = useStyles();
  return (
    <>
      {parseMarked(text).map((part, i) =>
        part.tone === 'plain' ? (
          <Fragment key={i}>{part.text}</Fragment>
        ) : (
          <span key={i} className={part.tone === 'accent' ? styles.accent : styles.success}>
            {part.text}
          </span>
        ),
      )}
    </>
  );
};
