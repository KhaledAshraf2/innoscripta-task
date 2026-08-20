import Chip from '@mui/material/Chip';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './badge.module.css';

type BadgeVariant = 'secondary' | 'outline';

type BadgeProps = {
  variant: BadgeVariant;
  className?: string | undefined;
  children?: ReactNode;
};

const VARIANT_MAP = {
  secondary: { color: 'default', variant: 'filled' },
  outline: { color: 'default', variant: 'outlined' },
} as const;

export function Badge({ variant, className, children }: BadgeProps) {
  const mapped = VARIANT_MAP[variant];

  return (
    <Chip
      size="small"
      color={mapped.color}
      variant={mapped.variant}
      label={children}
      className={cx(styles.root, className)}
    />
  );
}
