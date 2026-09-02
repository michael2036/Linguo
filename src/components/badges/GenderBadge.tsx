import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
import type { Gender } from '../../types/chapter';

const useStyles = makeStyles({
  base: {
    display: 'inline-block',
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  der: { backgroundColor: tokens.colorPaletteBlueBackground2, color: tokens.colorPaletteBlueForeground2 },
  die: { backgroundColor: tokens.colorPaletteRedBackground2, color: tokens.colorPaletteRedForeground2 },
  das: { backgroundColor: tokens.colorPaletteGreenBackground2, color: tokens.colorPaletteGreenForeground2 },
});

// Color-codes grammatical gender per FR-08: der = blue, die = red, das = green.
export const GenderBadge = ({ gender }: { gender: Gender | undefined }) => {
  const styles = useStyles();
  if (!gender) return null;
  const classByGender = { der: styles.der, die: styles.die, das: styles.das } as const;
  return <span className={`${styles.base} ${classByGender[gender]}`}>{gender}</span>;
};
