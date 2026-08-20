import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './card.module.css';

type CardProps = {
  className?: string | undefined;
  children?: ReactNode;
  component?: ElementType;
};

export function Card({ className, children, component }: CardProps) {
  return (
    <MuiCard
      variant="outlined"
      className={cx(styles.root, className)}
      {...(component !== undefined ? { component } : {})}
    >
      {children}
    </MuiCard>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string | undefined;
  children?: ReactNode;
}) {
  return <MuiCardContent className={cx(styles.content, className)}>{children}</MuiCardContent>;
}

type CardTitleProps = {
  className?: string | undefined;
  children?: ReactNode;
  component?: ElementType;
};

export function CardTitle({ className, children, component = 'div' }: CardTitleProps) {
  return (
    <Typography variant="subtitle1" component={component} className={cx(styles.title, className)}>
      {children}
    </Typography>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      component="div"
      className={cx(styles.description, className)}
    >
      {children}
    </Typography>
  );
}
