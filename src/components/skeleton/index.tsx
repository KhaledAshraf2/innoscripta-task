import MuiSkeleton from '@mui/material/Skeleton';
import { cx } from '@/lib/cx';
import styles from './skeleton.module.css';

export function Skeleton({ className }: { className?: string | undefined }) {
  return <MuiSkeleton variant="rounded" className={cx(styles.root, className)} />;
}
