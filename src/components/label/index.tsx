import FormLabel from '@mui/material/FormLabel';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './label.module.css';

type LabelProps = {
  htmlFor?: string;
  className?: string | undefined;
  children?: ReactNode;
};

export function Label({ htmlFor, className, children }: LabelProps) {
  return (
    <FormLabel className={cx(styles.root, className)} {...(htmlFor !== undefined ? { htmlFor } : {})}>
      {children}
    </FormLabel>
  );
}
