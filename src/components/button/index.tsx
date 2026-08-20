import MuiButton from '@mui/material/Button';
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';
import { cx } from '@/lib/cx';
import styles from './button.module.css';

const VARIANT_MAP = {
  default: { variant: 'contained', color: 'primary' },
  outline: { variant: 'outlined', color: 'inherit' },
  secondary: { variant: 'contained', color: 'secondary' },
  ghost: { variant: 'text', color: 'inherit' },
} as const;

const SIZE_MAP = {
  default: 'medium',
  sm: 'small',
  icon: 'small',
} as const;

type OwnProps = {
  variant?: keyof typeof VARIANT_MAP;
  size?: keyof typeof SIZE_MAP;
  className?: string | undefined;
  children?: ReactNode;
};

type ButtonProps<C extends ElementType = 'button'> = OwnProps & {
  component?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof OwnProps>;

export function Button<C extends ElementType = 'button'>({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps<C>) {
  const mapped = VARIANT_MAP[variant];

  return (
    <MuiButton
      {...mapped}
      size={SIZE_MAP[size]}
      className={cx(styles.root, size === 'icon' && styles.icon, className)}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
