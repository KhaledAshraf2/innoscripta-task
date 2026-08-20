import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  use,
  useMemo,
  useState,
} from 'react';
import { cx } from '@/lib/cx';
import styles from './sheet.module.css';

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(): SheetContextValue {
  const value = use(SheetContext);
  if (value === null) {
    throw new Error('Sheet components must be used within <Sheet>.');
  }
  return value;
}

export function Sheet({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <SheetContext value={value}>{children}</SheetContext>;
}

type TriggerChild = ReactElement<{
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}>;

function mergeTriggerClick(child: TriggerChild, onActivate: () => void) {
  return cloneElement(child, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      child.props.onClick?.(event);
      onActivate();
    },
  });
}

export function SheetTrigger({ children }: { children: TriggerChild }) {
  const { setOpen } = useSheetContext();
  return mergeTriggerClick(children, () => setOpen(true));
}

export function SheetClose({ children }: { children: TriggerChild }) {
  const { setOpen } = useSheetContext();
  return mergeTriggerClick(children, () => setOpen(false));
}

export function SheetContent({ children }: { children?: ReactNode }) {
  const { open, setOpen } = useSheetContext();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{ paper: { className: styles.paper } }}
    >
      <IconButton
        aria-label="Close"
        className={styles.close}
        onClick={() => setOpen(false)}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      {children}
    </Drawer>
  );
}

export function SheetHeader({ children }: { children?: ReactNode }) {
  return <div className={styles.header}>{children}</div>;
}

export function SheetTitle({
  className,
  children,
}: {
  className?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <Typography variant="subtitle1" component="h2" className={cx(styles.title, className)}>
      {children}
    </Typography>
  );
}

export function SheetDescription({ children }: { children?: ReactNode }) {
  return (
    <Typography variant="body2" color="textSecondary" component="p" className={styles.description}>
      {children}
    </Typography>
  );
}

export function SheetFooter({ children }: { children?: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}
