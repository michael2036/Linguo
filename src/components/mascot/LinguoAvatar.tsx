import { makeStyles, mergeClasses } from '@fluentui/react-components';
import linguoSprite from '../../linguo_sprites.jpeg';
import { LINGUO_GRID, LINGUO_GRID_SIZE, type LinguoExpression } from './linguoExpressions';

const useStyles = makeStyles({
  avatar: {
    display: 'inline-block',
    flexShrink: 0,
    backgroundImage: `url(${linguoSprite})`,
    backgroundSize: `${LINGUO_GRID_SIZE * 100}% ${LINGUO_GRID_SIZE * 100}%`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    borderRadius: '18%',
  },
  bob: {
    animationName: 'ls-linguo-bob',
    animationDuration: '2.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  popIn: {
    animationName: 'ls-linguo-pop-in',
    animationDuration: '520ms',
    animationTimingFunction: 'cubic-bezier(0.2, 0.9, 0.3, 1.3)',
  },
});

interface LinguoAvatarProps {
  expression: LinguoExpression;
  size?: number;
  animate?: 'bob' | 'pop' | 'none';
  className?: string;
}

// Linguo's face sheet is a single 4x4 sprite (src/linguo_sprites.jpeg) sliced
// purely with CSS background-position — no per-expression image assets to
// keep in sync. Swapping `expression` just moves the viewport.
export const LinguoAvatar = ({ expression, size = 56, animate = 'none', className }: LinguoAvatarProps) => {
  const styles = useStyles();
  const [row, col] = LINGUO_GRID[expression];
  const step = 100 / (LINGUO_GRID_SIZE - 1);

  return (
    <span
      role="img"
      aria-label={`Linguo, das Maskottchen: ${expression}`}
      className={mergeClasses(
        styles.avatar,
        animate === 'bob' && styles.bob,
        animate === 'pop' && styles.popIn,
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundPosition: `${col * step}% ${row * step}%`,
      }}
    />
  );
};
