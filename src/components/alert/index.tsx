import MuiAlert from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import type { ReactNode } from 'react';
import styles from './alert.module.css';

type AlertVariant = 'default' | 'warning';

const SEVERITY_MAP = {
  default: 'info',
  warning: 'warning',
} as const;

export function Alert({
  variant = 'default',
  children,
}: {
  variant?: AlertVariant;
  children?: ReactNode;
}) {
  return (
    <MuiAlert severity={SEVERITY_MAP[variant]} className={styles.root}>
      {children}
    </MuiAlert>
  );
}

export function AlertTitle({ children }: { children?: ReactNode }) {
  return <MuiAlertTitle className={styles.title}>{children}</MuiAlertTitle>;
}

export function AlertDescription({ children }: { children?: ReactNode }) {
  return <div className={styles.description}>{children}</div>;
}
